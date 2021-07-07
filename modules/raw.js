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
        const compatible = ["google-chrome", "microsoft-edge", "chromium"]
        for (var i = 0; i < compatible.length; i++) {
            if (fs.readFileSync("/bin/" + compatible[i])) {
                start = compatible[i];
            }
        }
        break;
    default:
        //Safari doesn't seem to support command line options atm 
        start = "google-chrome";
}
module.exports = (token, updates = () => { }, Windowproperties = defaultProperties) => {
    const cmd = Windowproperties.browserCMD ? Windowproperties.browserCMD : start
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
                    const loc = out[0].url;
                    if (loc && loc.startsWith(token.redirect)) {
                        const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                        if (urlParams) {
                            resolve(msmc.authenticate(urlParams, token, updates));
                        } else {
                            updates({ type: "Cancelled" });
                        }
                        try {
                            clearInterval(f3);
                            BE.getFetch()("http://localhost:" + port + "/json/close/" + out[0].id)
                            f.kill("SIGILL")

                        } catch {
                            console.error("[MSMC] Failed to close window!");
                        }
                        return true;
                    }
                }).catch(err => { clearInterval(f3); f.kill(); console.log(err) })
            }, 500);

        }, 500);
    });
}