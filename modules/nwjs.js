const MSMC = require("..");

const BE = require("./backEnd");
const defaultProperties = {
    width: 500,
    height: 650,
    resizable: false,
    title: "Microsoft Login"
};

module.exports.Launch = (token, callback, updates = () => { }, Windowproperties = defaultProperties) => {
    var redirect = MSMC.CreateLink(token);
    nw.Window.open(redirect, Windowproperties, function (new_win) {
        new_win.on('close', function () {
                updates({ type: "Cancelled" });
        });
        new_win.on('loaded', function () {
            const loc = new_win.window.location.href;
            if (loc.startsWith(token.redirect)) {
                const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                if (urlParams) {
                    MSMC.MSCallBack(urlParams, token, callback, updates);
                }else{
                    updates({ type: "Cancelled" });
                }
                try {
                    new_win.close(true);
                } catch {
                    console.error("[MSMC] Failed to close window!");
                }

                return true;
            }
            return false;
        });
    });
};

module.exports.FastLaunch = (callback, updates = () => { }, prompt = "select_account", properties = defaultProperties) => {
    this.Launch(BE.MojangAuthToken(prompt), callback, updates, properties);
};