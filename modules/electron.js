const MSMC = require("..");
const BE = require("./backEnd");
const { BrowserWindow } = require("electron");

const defaultProperties = {
        width: 500,
        height: 650,
        resizable: false,
};
module.exports.Launch = (token, callback, updates = () => { }, Windowproperties = defaultProperties) => {
    var redirect = MSMC.CreateLink(token);
    const mainWindow = new BrowserWindow(Windowproperties);
    mainWindow.setMenu(null);
    mainWindow.loadURL(redirect);
    const contents = mainWindow.webContents;
    var loading = false;
    mainWindow.on("close", () => {
        if (!loading) {
            updates({ type: "Canceled" });
        };
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
        };
    });
};


module.exports.FastLaunch = (callback, updates = () => { },prompt ="select_account", properties = defaultProperties) => {
    this.Launch(BE.MojangAuthToken(prompt), callback, updates, properties);
};