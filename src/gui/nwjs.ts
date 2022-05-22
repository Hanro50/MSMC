import { lexcodes } from "../assets.js";
import { auth } from "../auth/auth.js";
const defProp = {
    width: 500,
    height: 650,
    resizable: false,
    title: "Microsoft Login"
}

export default (auth: auth, Windowproperties = defProp) => {
    return new Promise((resolve, rejects: (e: lexcodes) => void) => {
        var redirect = auth.createLink();
        //@ts-ignore
        nw.Window.open(redirect, Windowproperties, function (new_win) {
            new_win.on('close', function () {
                rejects('error.gui.closed')
                new_win.close(true);
            });
            new_win.on('loaded', function () {
                const loc = new_win.window.location.href;
                if (loc.startsWith(auth.token.redirect)) {
                    const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                    if (urlParams) {
                        resolve(urlParams);
                    } else {
                        rejects('error.gui.closed');
                    }
                    try {
                        new_win.close(true);
                    } catch {
                        console.error("[MSMC]: Failed to close window!");
                    }
                    return true;
                }
                return false;
            });
        });
    });
}

