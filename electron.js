const MSMC = require("./microsoft");
const { BrowserWindow } = require("electron");

module.exports.FastLaunch = (callback, updates = () => { }, prompt) => {
    const token = {
        client_id: "00000000402b5328",
        redirect: "https://login.live.com/oauth20_desktop.srf",
        prompt: prompt,
    };
    var redirect = MSMC.CreateLink(token);
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 650,
        resizable: false
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL(redirect);
    const contents = mainWindow.webContents;
    var loading = false;
    mainWindow.on('close', () => {
        if (!loading) {
            updates({ type: "Canceled" })
        }
    });
    contents.on("did-finish-load", () => {
        const loc = contents.getURL();
        if (loc.startsWith(token.redirect)) {
            const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
            try {
                loading = true;
                mainWindow.close();
            } catch {
                console.error("Failed to close window!");
            }
            MSMC.MSCallBack(urlParams, token, callback, updates);
        }
    });
};