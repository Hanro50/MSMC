/**
 * EXPERIMENTAL!
 * Only compatible with Linux and Windows at the stage. 
 */
const fs = require('fs')
const msmc = require('..');
const exec = require('child_process').exec;
const BE = require("./backEnd");
const os = require("os");
const temp = os.tmpdir() + "/msmc"; // /tmp
const defaultProperties = {
    width: 500,
    height: 650,
    resizable: false,
}
//const fr = setCallback(console.log) --host-rules="MAP * localhost:' + fr.address().port + '"--debug-print--no-sandbox
var start
var type = os.type();
switch (type) {
    case 'Windows_NT':
        start = "start msedge"
        break;
    case 'Linux':
    default:
        const locations = process.env.PATH.split(":");
        LE: {
            for (var i = 0; i < locations.length; i++) {
                const compatible = [ "chromium", "google-chrome", "microsoft-edge", "brave-browser","vivaldi","blisk-browser","yandex-browser"]
                for (var i2 = 0; i2 < compatible.length; i2++) {
                    const s = locations[i] + "/" + compatible[i2];
                    if (fs.existsSync(s)) {
                        start = s;
                        break LE;
                    }
                }
            }
            console.error("[MSMC]: No Chromium browser was found")
        }
}
module.exports = (token, updates = () => { }, Windowproperties = defaultProperties) => {
    const cmd = Windowproperties.browserCMD ? Windowproperties.browserCMD : start;
    if (!cmd) {
        return Promise.reject("[MSMC] Error : no chromium browser was set, cannot continue!");
    }
    console.warn("[MSMC]: This setting is experimental");
    console.warn("[MSMC]: Using \"" + cmd + "\"")
    var redirect = msmc.createLink(token);
    return new Promise(resolve => {
        const f = exec(cmd + " --window-size=" + Windowproperties.width + "," + Windowproperties.height + " --remote-debugging-port=0 --no-first-run --no-default-browser-check --user-data-dir=" + temp + " --force-app-mode --app=\"" + redirect + "\"");
        setTimeout(() => {
            const data = fs.readFileSync(temp + "/DevToolsActivePort").toString();
            const port = data.substr(0, data.indexOf("\n"));
            const f3 = setInterval(() => {
                BE.getFetch()("http://localhost:" + port + "/json").then(r => r.json()).then(out => {
                    for (var i = 0; i < out.length; i++) {
                        const loc = out[i].url;
                        if (!loc || !loc.startsWith(token.redirect)) {
                            if (loc && loc.startsWith("chrome-extension")) {
                                //Thank you Blisk!
                                BE.getFetch()("http://localhost:" + port + "/json/close/" + out[i].id)
                            }
                            break;
                        }
                        const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                        if (urlParams) {
                            resolve(msmc.authenticate(urlParams, token, updates));
                        } else {
                            updates({ type: "Cancelled" });
                        }
                        try {
                            clearInterval(f3);
                            for (var i2 = 0; i2 < out.length; i2++) {
                                BE.getFetch()("http://localhost:" + port + "/json/close/" + out[i2].id)
                            }
                            f.kill("SIGILL")

                        } catch {
                            console.error("[MSMC] Failed to close window!");
                        }
                        return true;

                    }
                }).catch(err => {
                    clearInterval(f3);
                    f.kill();
                    updates({ type: "Cancelled" });
                    console.log(err)
                })
            }, 500);

        }, 500);
    });
}