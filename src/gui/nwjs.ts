import { auth } from "../auth.js";

const defProp = {
    width: 500,
    height: 650,
    resizable: false,
    title: "Microsoft Login"
}


module.exports = (auth: auth, updates = () => { }, Windowproperties = defProp) => {
    return new Promise(resolve => {
        var redirect = auth.createLink();
        //@ts-ignore
        nw.Window.open(redirect, Windowproperties, function (new_win) {
            new_win.on('close', function () {
                resolve({ type: "Cancelled", translationString: "Cancelled.GUI" })
                new_win.close(true);
            });
            new_win.on('loaded', function () {
                const loc = new_win.window.location.href;
                if (loc.startsWith(auth.token.redirect)) {
                    const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                    if (urlParams) {
                        resolve(MSMC.authenticate(urlParams));
                    } else {
                        resolve({ type: "Cancelled", translationString: "Cancelled.Back" });
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

