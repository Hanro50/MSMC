const MSMC = require("../..");
const dynReq = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;

const { BrowserWindow } = dynReq("electron");

const defaultProperties = {
    width: 500,
    height: 650,
    resizable: false,
};

module.exports = (token, updates = () => { }, Windowproperties = defaultProperties) => {
    return new Promise(resolve => {
        var ts = "Cancelled.GUI";
        var redirect = MSMC.createLink(token);
        const mainWindow = new BrowserWindow(Windowproperties);
        mainWindow.setMenu(null);
        mainWindow.loadURL(redirect);
        const contents = mainWindow.webContents;
        var loading = false;
        mainWindow.on("close", () => {
            if (!loading) { resolve({ type: "Cancelled", translationString: ts }) };
        });

        contents.on("did-finish-load", () => {
            const loc = contents.getURL();
            if (loc.startsWith(token.redirect)) {
                const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                if (urlParams) {
                    resolve(MSMC.authenticate(urlParams, token, updates));
                    loading = true;
                }
                else {
                    ts = "Cancelled.Back";
                }
                try {
                    mainWindow.close();
                } catch {
                    console.error("[MSMC]: Failed to close window!");
                }
            };
        });
    });
};
