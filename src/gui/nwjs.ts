import { Auth } from "../auth/auth.js";
import { Lexcodes } from "../types.js";
import { getDefaultWinProperties } from "./common.js";

export default (auth: Auth, Windowproperties = getDefaultWinProperties()) => {
  return new Promise((resolve, rejects: (e: Lexcodes) => void) => {
    var redirect = auth.createLink();
    //@ts-ignore
    nw.Window.open(redirect, Windowproperties, function (new_win) {
      new_win.on("close", function () {
        rejects("error.gui.closed");
        new_win.close(true);
      });
      new_win.on("loaded", function () {
        const loc = new_win.window.location.href;
        if (loc.startsWith(auth.token.redirect)) {
          const urlParams = new URLSearchParams(
            loc.substr(loc.indexOf("?") + 1),
          ).get("code");
          if (urlParams) {
            resolve(urlParams);
          } else {
            rejects("error.gui.closed");
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
};
