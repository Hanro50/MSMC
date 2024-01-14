import type { WindowProperties } from "../types";
import { getCode } from "../util/lexicon";
import { error } from "../util/lexicon.js";

import type { Auth } from "../auth/auth.js";
export function getDefaultWinProperties(): WindowProperties {
  return {
    width: 500,
    height: 650,
    resizable: false,
    title: getCode("gui.title"),
  };
}

export async function launch(
  auth: Auth,
  framework: any,
  windowProperties: any,
) {
  let func = null;
  switch (framework) {
    case "raw":
      func = await import("./raw.js");
      break;
    case "nwjs":
      func = await import("./nwjs.js");
      break;
    case "electron":
      func = await import("./electron.js");
      break;
    default:
      error("error.state.invalid.gui");
      return;
  }
  console.log(func);
  return await auth.login(
    await (func?.default?.default || func?.default || func)(
      auth,
      windowProperties,
    ),
  );
}
