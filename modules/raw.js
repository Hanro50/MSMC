/**
 * EXPERIMENTAL!
 * Only compatible with Linux and Windows at the stage. 
 */
const msmc = require('..');
const BE = require("./backEnd");

const path = require('path')
const fs = require('fs')
const os = require("os");

const temp = path.join(os.tmpdir(), "msmc");
const spawn = require('child_process').spawn;
const exec = require('child_process').execSync;
const defaultProperties = {
    width: 500,
    height: 650,
    resizable: false,
}
var start
switch (os.type()) {
    case 'Windows_NT':
        const pathsW = ["HKEY_LOCAL_MACHINE", "HKEY_CURRENT_USER"]
        WE: {
            for (var i = 0; i < pathsW.length; i++) {
                const loc = pathsW[i] + "\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\"
                const compatibleW = ["msedge.exe", "chrome.exe", "vivaldi.exe", "brave.exe", "blisk.exe"]
                for (var i2 = 0; i2 < compatibleW.length; i2++) {
                    try {
                        var out = exec("reg query \"" + loc + compatibleW[i2] + "\"").toString();
                        if (!out.startsWith("ERROR")) {
                            out = out.substr(out.indexOf("REG_SZ") + "REG_SZ".length).trim();
                            if (out.indexOf("\n") > 0)
                                out = out.substr(0, out.indexOf("\n") - 1);
                            start = out; break WE;
                        }
                    } catch { };
                }
            }
            console.error("[MSMC] No Chromium browser was found")
        }
        break;
    case 'Darwin':
        const loc = "/Applications/{0}.app/Contents/MacOS/{0}"
        const compatibleD = ["Google\\ Chrome", "Microsoft\\ Edge", "Vivaldi", "Blisk", "Brave\\ Browser", "Yandex"]
        for (var i2 = 0; i2 < compatibleD.length; i2++) {
            const s = loc.replace(/\{0\}/g, compatibleD[i2])
            if (fs.existsSync(s)) { start = s; break; }
        }
        if (start) break;
    case 'Linux':
    default:
        const pathsL = process.env.PATH.split(":");
        const compatibleL = ["chromium", "google-chrome", "microsoft-edge", "vivaldi", "brave-browser", "blisk-browser", "yandex-browser"]
        LE: {
            for (var i = 0; i < pathsL.length; i++) {
                for (var i2 = 0; i2 < compatibleL.length; i2++) {
                    const s = path.join(pathsL[i], compatibleL[i2]);
                    if (fs.existsSync(s)) { start = s; break LE; }
                }
            }
            console.error("[MSMC] No Chromium browser was found")
        }
}

function browserLoop(token, port, updates, browser) {
    return new Promise((resolve, reject) => {
        const f3 = setInterval(() => {
            BE.getFetch()("http://localhost:" + port + "/json/list").then(r => r.json()).then(out => {
                for (var i = 0; i < out.length; i++) {
                    const loc = out[i].url;
                    if (loc && loc.startsWith(token.redirect)) {
                        try {
                            clearInterval(f3);
                            browser.kill();
                        } catch {
                            console.error("[MSMC] Failed to close window!");
                        }
                        const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                        if (urlParams) {
                            resolve(msmc.authenticate(urlParams, token, updates));
                        } else {
                            updates({ type: "Cancelled" });
                            reject("[MSMC] Action cancelled by user")
                        }
                    }
                }
            }).catch(() => {
                clearInterval(f3);
                browser.kill();
                updates({ type: "Cancelled" });
                reject("[MSMC] Action cancelled by user")
            })
        }, 500);
    });
}

module.exports = (token, updates = () => { }, Windowproperties = defaultProperties) => {
    const cmd = Windowproperties.browserCMD ? Windowproperties.browserCMD : start;
    if (!cmd) {
        return Promise.reject("[MSMC] Error : no chromium browser was set, cannot continue!");
    }
    console.warn("[MSMC] This setting is experimental");
    console.warn("[MSMC] Using \"" + cmd + "\"");
    var redirect = msmc.createLink(token);
    return new Promise(resolve => {
        const browser = spawn(cmd, ["--disable-component-extensions-with-background-pages", "--no-first-run", "--disable-extensions", "--window-size=" + Windowproperties.width + "," + Windowproperties.height, "--remote-debugging-port=0", "--no-default-browser-check", "--user-data-dir=" + temp, "--force-app-mode", "--app=" + redirect + ""]);
        var firstrun = true;
        const ouput = (out) => {
            const cout = String(out.toString()).toLocaleLowerCase().trim();
            //console.log(cout)
            if (firstrun && cout.startsWith("devtools listening on ws://127.0.0.1:")) {
                //console.log("exec")
                firstrun = false;
                var data = cout.substr("devtools listening on ws://127.0.0.1:".length);
                const port = data.substr(0, data.indexOf("/"));
                //console.log(out.toString())
                resolve(browserLoop(token, port, updates, browser));
            }
        }
        browser.stdout.on('data', ouput)
        browser.stderr.on('data', ouput)
    });
}