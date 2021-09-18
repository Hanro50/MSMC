const MSMC = require("../..");
const defaultProperties = {
    width: 500,
    height: 650,
    resizable: false,
    title: "Microsoft Login"
}

module.exports = (token, updates = () => { }, Windowproperties = defaultProperties) => {
    return new Promise(resolve => {
        var redirect = MSMC.createLink(token);
        nw.Window.open(redirect, Windowproperties, function (new_win) {
            new_win.on('close', function () {
                resolve({ type: "Cancelled", translationString:"Cancelled.GUI" })
                new_win.close(true);
            });
            new_win.on('loaded', function () {
                const loc = new_win.window.location.href;
                if (loc.startsWith(token.redirect)) {
                    const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                    if (urlParams) {
                        resolve(MSMC.authenticate(urlParams, token, updates));
                    } else {
                        resolve({ type: "Cancelled", translationString:"Cancelled.Back" });
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

