import { err, lexcodes } from "../assets.js";
import { auth } from "../auth/auth.js";
import type { BrowserWindow as TBrowser } from 'electron';
//@ts-ignore
const dynReq = (typeof __webpack_require__ === "function" ? __non_webpack_require__ : require) as NodeRequire;

const BrowserWindow = dynReq("electron").BrowserWindow;

const defProp = {
    width: 500,
    height: 650,
    resizable: false,
    title: "Microsoft Login"
};

if (!BrowserWindow){
    err("error.state.invalid.electron")
}

export default (auth: auth, Windowproperties = defProp) => {
    return new Promise((resolve, reject: (e: lexcodes) => void) => {
        var redirect = auth.createLink();
        const mainWindow: TBrowser = new BrowserWindow(Windowproperties);
        mainWindow.setMenu(null);
        mainWindow.loadURL(redirect);
        const contents = mainWindow.webContents;
        var loading = false;
        mainWindow.on("close", () => {
            if (!loading) { reject("error.gui.closed") };
        });
        contents.on("did-finish-load", () => {
            const loc = contents.getURL();
            if (loc.startsWith(auth.token.redirect)) {
                const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                if (urlParams) {
                    resolve(urlParams);
                    loading = true;
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
