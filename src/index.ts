import auth from "./auth/auth.js";

import * as assets from "./assets.js";
import { wrapError, lst } from "./assets.js";

import social from "./auth/social";
import type xbox from "./auth/xbox.js";
import type minecraft from "./auth/minecraft.js";
import { fromToken, fromMclcToken, validate, mcToken } from "./auth/minecraft.js";

export { social, auth, assets, wrapError, lst };
export const mcTokenToolbox = {fromToken, fromMclcToken, validate} 
export type { xbox, minecraft, mcToken };