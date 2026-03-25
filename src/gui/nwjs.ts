import { createAuthLink } from "../advance.js";
import { LoginError } from "../error.js";
import type { mstoken, windowProperties } from "../types.js";

export default async (token: mstoken, Windowproperties: windowProperties) => {
  return new Promise((resolve, rejects: (e: LoginError) => void) => {
    var redirect = createAuthLink(token);
    //@ts-ignore
    nw.Window.open(redirect, Windowproperties, function (new_win) {
      new_win.on("close", function () {
        rejects(new LoginError("error.gui.closed", "GUI closed by user"));
        new_win.close(true);
      });
      new_win.on("loaded", function () {
        const loc = new_win.window.location.href;
        if (loc.startsWith(token.redirect)) {
          const urlParams = new URLSearchParams(
            loc.substr(loc.indexOf("?") + 1)
          ).get("code");
          if (urlParams) {
            resolve(urlParams);
          } else {
            rejects(new LoginError("error.gui.closed", "GUI closed by user"));
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
