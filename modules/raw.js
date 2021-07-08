/**
 * EXPERIMENTAL!
 * Only compatible with Linux and Windows at the stage. 
 */
const path = require('path')
const fs = require('fs')
const msmc = require('..');
const spawn = require('child_process').spawn;
const BE = require("./backEnd");
const os = require("os");
const temp = path.join(os.tmpdir(), "msmc"); // /tmp
const pref = path.join(temp, "Preferences")
console.log(temp)

async function setup() {
    try {
        if (fs.existsSync(pref)) {

        }
    } catch {
        fs.writeFile(pref, "{'state': 0}", () => { console.log("Rewrote file extensions") })
    }

}
setup();
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
                const compatible = ["chromium", "google-chrome", "microsoft-edge", "vivaldi", "brave-browser", "blisk-browser", "yandex-browser"]
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

function browserLoop(token, port, updates, browser) {
    return new Promise((resolve, reject) => {
        const f3 = setInterval(() => {
            BE.getFetch()("http://localhost:" + port + "/json/list").then(r => r.json()).then(out => {
                for (var i = 0; i < out.length; i++) {
                    const loc = out[i].url;
                    if (loc && loc.startsWith(token.redirect)) {
                        try {
                            clearInterval(f3);
                            for (var i2 = 0; i2 < out.length; i2++) {
                                BE.getFetch()("http://localhost:" + port + "/json/close/" + out[i2].id)
                            }
                            browser.kill("SIGILL")

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
    console.warn("[MSMC]: This setting is experimental");
    console.warn("[MSMC]: Using \"" + cmd + "\"");
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