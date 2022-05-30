
import path from 'path';
import fs from 'fs';
import os from "os";

const temp = path.join(os.tmpdir(), "msmc");
import { spawn, execSync as exec, ChildProcessWithoutNullStreams } from 'child_process';
import { err, getDefaultWinProperties, lexcodes } from '../assets.js';
import auth from '../auth/auth';
import fetch from 'node-fetch';
var firefox = false;

var start: string
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
                            out = out.substring(out.indexOf("REG_SZ") + "REG_SZ".length).trim();
                            if (out.indexOf("\n") > 0)
                                out = out.substring(0, out.indexOf("\n") - 1);
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

function browserLoop(auth: auth, port: string, browser: ChildProcessWithoutNullStreams) {

    return new Promise((resolve, error: (e: lexcodes) => void) => {
        const call = () => {
            try {
                clearInterval(f3);
                //@ts-ignore
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
        process.on("exit", call)
        const f3 = setInterval(() => {
            fetch("http://127.0.0.1:" + port + "/json/list").then(r => r.json()).then(out => {
                for (var i = 0; i < out.length; i++) {
                    const loc = out[i].url;
                    if (loc && loc.startsWith(auth.token.redirect)) {
                        const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                        if (urlParams)
                            resolve(urlParams);
                        else
                            error("error.gui.closed");
                        call();
                    }
                }
            }).catch((err) => {
                call();
                console.error("[msmc]: " + err)
                error("error.gui.closed");
            })
        }, 500);
    });
}

export default (auth: auth, Windowproperties = getDefaultWinProperties()) => {
    const cmd = Windowproperties.browserCMD ? Windowproperties.browserCMD : start;
    if (!cmd) {
        err("error.gui.raw.noBrowser");
    }
    console.log("[MSMC]: Using \"" + cmd + "\"");
    var redirect = auth.createLink();
    return new Promise((resolve, error) => {
        var browser: ChildProcessWithoutNullStreams;
        if (firefox || Windowproperties.firefox) {
            console.log("[MSMC]: Using firefox fallback {Linux only!}");
            if (fs.existsSync(temp)) exec("rm -R " + temp); fs.mkdirSync(temp);
            browser = spawn(cmd, ["--profile", temp, "-kiosk", redirect, "--remote-debugging-port=0", "--new-instance"]);
        } else browser = spawn(cmd, ["--disable-restore-session-state", "--disable-first-run-ui", "--disable-component-extensions-with-background-pages", "--no-first-run", "--disable-extensions", "--window-size=" + Windowproperties.width + "," + Windowproperties.height, "--remote-debugging-port=0", "--no-default-browser-check", "--user-data-dir=" + temp, "--force-app-mode", "--app=" + redirect]);

        var firstrun = true;
        const ouput = (out: { toString: () => any; }) => {
            const cout = String(out.toString()).toLocaleLowerCase().trim();
            console.log("[MSMC][Browser]: " + cout)
            if (firstrun && cout.startsWith("devtools listening on ws://")) {
                firstrun = false;
                var data = cout.substring("devtools listening on ws://".length);
                const n = data.indexOf(":") + 1;
                const port = data.substring(n, data.indexOf("/"));
                console.log("[MSMC]: Debug hook => http://127.0.0.1:" + port);
                browserLoop(auth, port, browser).then(resolve).catch(error)
            }
        }
        if (!Windowproperties.suppress) {
            browser.stdout.on('data', ouput)
            browser.stderr.on('data', ouput)
        }
    });
}