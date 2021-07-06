const MSMC = require("..");
const BE = require("./backEnd");
const { BrowserWindow } = require("electron");

const defaultProperties = {
    width: 500,
    height: 650,
    resizable: false,
};

module.exports = (token, callback, updates = () => { }, Windowproperties = defaultProperties) => {
    var redirect = MSMC.createLink(token);
    const mainWindow = new BrowserWindow(Windowproperties);
    mainWindow.setMenu(null);
    mainWindow.loadURL(redirect);
    const contents = mainWindow.webContents;
    var loading = false;
    mainWindow.on("close", () => {
        if (!loading) { updates({ type: "Cancelled" }); };
    });

    contents.on("did-finish-load", () => {
        const loc = contents.getURL();
        if (loc.startsWith(token.redirect)) {
            const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
            if (urlParams) {
                MSMC.authenticate(urlParams, token, callback, updates);
                loading = true;
            }
            try {
                mainWindow.close();
            } catch {
                console.error("[MSMC] Failed to close window!");
            }
        };
    });
};
