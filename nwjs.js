const MSMC = require("./microsoft");

const defaultProperties = {
    prompt: "login",
    window: {
        width: 500,
        height: 650,
        resizable: false,
        title: "Microsoft Login"
    },
};

module.exports.FastLaunch = (callback, updates = () => { }, properties = defaultProperties) => {
    const token = {
        client_id: "00000000402b5328",
        redirect: "https://login.live.com/oauth20_desktop.srf",
        prompt: properties.prompt,
    };
    var redirect = MSMC.CreateLink(token);
    var loading = false;
    nw.Window.open(redirect, properties.window, function (new_win) {
        new_win.on('close', function () {
            if (!loading) {
                updates({ type: "Canceled" });
            }
        })
        new_win.on('loaded', function () {

            const loc = new_win.window.location.href;
            console.log(loc);
            if (loc.startsWith(token.redirect)) {
                const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                try {
                    loading = false;
                    new_win.close(true);
                } catch {
                    console.error("Failed to close window!");
                }
                MSMC.MSCallBack(urlParams, token, callback, updates);
                return true;
            }
            return false;
        });
    });
};