/**
 * EXPERIMENTAL!
 */
const MSMC = require("../..");
const BE = require("../backEnd");

const path = require('path')
const fs = require('fs')
const os = require("os");

const temp = path.join(os.tmpdir(), "msmc");
const spawn = require('child_process').spawn;
const exec = require('child_process').execSync;
const defaultProperties = {
    width: 500,
    height: 650,
}
var start
console.log("[MSMC]: OS Type => " + os.type());
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
                            if (fs.existsSync(out)) { start = out; break WE; }
                            else console.log("[MSMC]: cannot find " + out)
                        }
                    } catch { };
                }
            }
            console.error("[MSMC]: No Chromium browser was found")
        }
        break;
    case 'Darwin':
        const loc = "/Applications/{0}.app/Contents/MacOS/{0}"
        const compatibleD = ["Google\\ Chrome", "Google Chrome", "Microsoft\\ Edge", "Microsoft Edge", "Vivaldi", "Blisk", "Brave\\ Browser", "Brave Browser", "Yandex"]
        for (var i2 = 0; i2 < compatibleD.length; i2++) {
            const s = loc.replace(/\{0\}/g, compatibleD[i2])
            if (fs.existsSync(s)) { start = s; break; }
        }
        if (start) break;
    case 'Linux':
    default:
        const pathsL = process.env.PATH.split(":");
        const compatibleL = ["chromium", "google-chrome", "microsoft-edge", "vivaldi", "brave-browser", "blisk-browser", "yandex-browser", "firefox"]
        LE: {
            for (var i = 0; i < pathsL.length; i++) {
                for (var i2 = 0; i2 < compatibleL.length; i2++) {
                    const s = path.join(pathsL[i], compatibleL[i2]);
                    if (fs.existsSync(s)) { start = s; break LE; }
                }
            }
            console.error("[MSMC]: No Chromium browser was found")
        }
}

function browserLoop(token, port, updates, browser) {
    return new Promise((resolve) => {
        const f3 = setInterval(() => {
            BE.getFetch()("http://127.0.0.1:" + port + "/json/list").then(r => r.json()).then(out => {
                for (var i = 0; i < out.length; i++) {
                    const loc = out[i].url;

                    if (loc && loc.startsWith(token.redirect)) {
                        try {
                            clearInterval(f3);
                            browser.kill();
                        } catch {
                            console.error("[MSMC]: Failed to close window!");
                        }
                        const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                        if (urlParams) {
                            resolve(MSMC.authenticate(urlParams, token, updates));
                        } else {
                            resolve({ type: "Cancelled", translationString:"Cancelled.Back"})
                        }
                    }
                }
            }).catch((err) => {
                console.log(err)
                clearInterval(f3);
                browser.kill();
                resolve({ type: "Cancelled", translationString:"Cancelled.GUI" })
            })
        }, 500);
    });
}

module.exports = (token, updates = () => { }, Windowproperties = defaultProperties) => {
    const cmd = Windowproperties.browserCMD ? Windowproperties.browserCMD : start;
    if (!cmd) {
        throw new Error("[MSMC]: Error : no chromium browser was set, cannot continue!");
    }
    console.warn("[MSMC]: This setting is experimental");
    console.warn("[MSMC]: Using \"" + cmd + "\"");
    var redirect = MSMC.createLink(token);
    return new Promise(resolve => {
        var browser;
        if (cmd.includes("firefox")) {
            console.log("[MSMC]: Using firefox fallback {Linux only!}");
            if (fs.existsSync(temp)) exec("rm -R " + temp); fs.mkdirSync(temp);
            browser = spawn(cmd, ["--remote-debugging-port=0", "-width", Windowproperties.width, "-height", Windowproperties.height, "--new-instance", "--profile", temp, redirect]);
        } else
            browser = spawn(cmd, ["--disable-restore-session-state", "--disable-first-run-ui", "--disable-component-extensions-with-background-pages", "--no-first-run", "--disable-extensions", "--window-size=" + Windowproperties.width + "," + Windowproperties.height, "--remote-debugging-port=0", "--no-default-browser-check", "--user-data-dir=" + temp, "--force-app-mode", "--app=" + redirect]);
        var firstrun = true;
        const ouput = (out) => {
            const cout = String(out.toString()).toLocaleLowerCase().trim();
            //console.log(cout)
            console.log("[MSMC]: " + cout)
            if (firstrun && cout.startsWith("devtools listening on ws://")) {
                //console.log("exec")
                firstrun = false;
                var data = cout.substr("devtools listening on ws://".length);
                const n = data.indexOf(":") + 1;
                const port = data.substr(n, data.indexOf("/") - n);
                console.log("[MSMC]: http://127.0.0.1:" + port);
                //console.log(out.toString())
                resolve(browserLoop(token, port, updates, browser));
            }
        }
        browser.stdout.on('data', ouput)
        browser.stderr.on('data', ouput)
    });
}