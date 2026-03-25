import { LoginError } from "../error";
import type { framework, mstoken, windowProperties } from "../types";

export async function launch(
  auth: mstoken,
  framework: framework,
  windowProperties: windowProperties
): Promise<string> {
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
      throw new LoginError("error.state.invalid.gui", "Invalid GUI framework");
  }
  return await (func?.default?.default || func?.default || func)(
    auth,
    windowProperties
  );
}
