import Auth from "./auth/auth.js";

import * as assets from "./assets.js";
import { wrapError, lst } from "./assets.js";

import Social from "./auth/social";
import type Xbox from "./auth/xbox.js";
import type Minecraft from "./auth/minecraft.js";
import { fromToken, fromMclcToken, validate, MCToken } from "./auth/minecraft.js";

export { Social, Auth, assets, wrapError, lst };
export const mcTokenToolbox = { fromToken, fromMclcToken, validate };
export type { Xbox, Minecraft, MCToken };
