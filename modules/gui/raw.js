/**
 * EXPERIMENTAL!
 */
const MSMC = require("../..");
const BE = require("../backEnd");

const path = require('path')
const fs = require('fs')
const os = require("os");

const temp = path.join(os.tmpdir(), "msmc");
const { spawn, execSync: exec, ChildProcess } = require('child_process');

var firefox = false;
const defaultProperties = {
    width: 500,
    height: 650,
}
var start
console.log("[MSMC]: OS Type => " + os.type());
switch (os.type()) {
    case 'Windows_NT':
        const pathsW = ["HKEY_LOCAL_MACHINE", "HKEY_CURRENT_USER"]
        const compatibleW = ["chrome.exe", "vivaldi.exe", "brave.exe", "blisk.exe", "msedge.exe"]
        WE: {
            for (var i2 = 0; i2 < compatibleW.length; i2++) {
                for (var i = 0; i < pathsW.length; i++) {
                    const locW = pathsW[i] + "\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\"
                    try {
                        console.log("reg query \"" + locW + compatibleW[i2] + "\"")
                        var out = exec("\"C:\\Windows\\System32\\reg.exe\" query \"" + locW + compatibleW[i2] + "\"").toString();
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
        const locD = "/Applications/{0}.app/Contents/MacOS/{0}"
        const compatibleD = ["Google\\ Chrome", "Google Chrome", "Microsoft\\ Edge", "Microsoft Edge", "Vivaldi", "Blisk", "Brave\\ Browser", "Brave Browser", "Yandex"]
        for (var i2 = 0; i2 < compatibleD.length; i2++) {
            const s = locD.replace(/\{0\}/g, compatibleD[i2])
            if (fs.existsSync(s)) { start = s; break; }
        }
        if (start) break;
    case 'Linux':
    default:
        const pathsL = process.env.PATH.split(":");
        const edd = ["", "-stable", "-beta", "-dev", "-g4"];
        const compatibleL = ["chromium", "google-chrome", "microsoft-edge", "vivaldi", "brave-browser", "blisk-browser", "yandex-browser", "waterfox", "firefox"]
        const ffox = ["firefox", "waterfox"]
        LE: {
            for (var i2 = 0; i2 < compatibleL.length; i2++) {
                for (var i3 = 0; i3 < edd.length; i3++) {
                    for (var i = 0; i < pathsL.length; i++) {
                        const s = path.join(pathsL[i], compatibleL[i2] + edd[i3]);
                        if (fs.existsSync(s)) { start = s; firefox = (ffox.includes(compatibleL[i2])); break LE; }
                    }
                }
            }
            console.error("[MSMC]: No compatible browser was found")
        }
}
/**
 * @param {ChildProcess} browser
 */
function browserLoop(token, port, updates, browser) {
    return new Promise((resolve) => {
        const call = () => {
            try {
                clearInterval(f3);
                process.removeListener("exit", call);
                if (os.type() == "Windows_NT") {
                    exec("taskkill /pid " + browser.pid);
                } else {
                    browser.kill();
                }
            } catch {
                console.error("[MSMC]: Failed to close window!");
            }
        }
        const end = process.on("exit", call)
        const f3 = setInterval(() => {
            BE.getFetch()("http://127.0.0.1:" + port + "/json/list").then(r => r.json()).then(out => {
                for (var i = 0; i < out.length; i++) {
                    const loc = out[i].url;
                    if (loc && loc.startsWith(token.redirect)) {
                        const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                        if (urlParams)
                            resolve(MSMC.authenticate(urlParams, token, updates));
                        else
                            resolve({ type: "Cancelled", translationString: "Cancelled.Back" });
                        call();
                    }
                }
            }).catch((err) => {
                call();
                resolve({ type: "Cancelled", translationString: "Cancelled.GUI" })
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
        if (firefox || Windowproperties.firefox) {
            console.log("[MSMC]: Using firefox fallback {Linux only!}");
            if (fs.existsSync(temp)) exec("rm -R " + temp); fs.mkdirSync(temp);
            browser = spawn(cmd, ["--profile", temp, "-kiosk", redirect, "--remote-debugging-port=0", "--new-instance"]);
        } else browser = spawn(cmd, ["--disable-restore-session-state", "--disable-first-run-ui", "--disable-component-extensions-with-background-pages", "--no-first-run", "--disable-extensions", "--window-size=" + Windowproperties.width + "," + Windowproperties.height, "--remote-debugging-port=0", "--no-default-browser-check", "--user-data-dir=" + temp, "--force-app-mode", "--app=" + redirect]);

        var firstrun = true;
        const ouput = (out) => {
            const cout = String(out.toString()).toLocaleLowerCase().trim();
            console.log("[MSMC][Browser]: " + cout)
            if (firstrun && cout.startsWith("devtools listening on ws://")) {
                firstrun = false;
                var data = cout.substr("devtools listening on ws://".length);
                const n = data.indexOf(":") + 1;
                const port = data.substr(n, data.indexOf("/") - n);
                console.log("[MSMC]: Debug hook => http://127.0.0.1:" + port);
                resolve(browserLoop(token, port, updates, browser));
            }
        }
        if (!Windowproperties.suppress) {
            browser.stdout.on('data', ouput)
            browser.stderr.on('data', ouput)
        }
    });
}