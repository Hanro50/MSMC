//@ts-nocheck
import { createAuthLink } from "../advance.js";
import { LoginError } from "../error.js";
import type { mstoken, windowProperties } from "../types.js";

export default async (token: mstoken, Windowproperties: windowProperties) => {
  let mainWindow;
  try {
    const { BrowserWindow } = await import(
      /* webpackIgnore: true */ "electron"
    );
    mainWindow = new BrowserWindow(Windowproperties);
  } catch {
    const dynReq = (
      typeof __webpack_require__ === "function"
        ? __non_webpack_require__
        : require
    ) as NodeRequire;
    const { BrowserWindow } = dynReq("electron");
    mainWindow = new BrowserWindow(Windowproperties);
    console.log("[MSMC]: Using fallback dynamic require for electron");
  }
  return await new Promise((resolve, reject: (e: LoginError) => void) => {
    var redirect = createAuthLink(token);

    mainWindow.setMenu(null);
    mainWindow.loadURL(redirect);
    const contents = mainWindow.webContents;
    var loading = false;
    mainWindow.on("close", () => {
      if (!loading) {
        reject(new LoginError("error.gui.closed", "GUI closed by user"));
      }
    });
    contents.on("did-finish-load", () => {
      const loc = contents.getURL();
      if (loc.startsWith(token.redirect)) {
        const urlParams = new URLSearchParams(
          loc.substr(loc.indexOf("?") + 1)
        ).get("code");
        if (urlParams) {
          resolve(urlParams);
          loading = true;
        }
        try {
          mainWindow.close();
        } catch {
          console.error("[MSMC]: Failed to close window!");
        }
      }
    });
  });
};
