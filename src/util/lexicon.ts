import { readFileSync } from "fs";
import { join } from "path";

import type { Response } from "node-fetch";
import type { Lexcodes } from "../types";
import type { Auth } from "../auth/auth.js";
/**
 * If the exact code isn't found. The lexicon string is split up and shaved down till it finds a description for the code.
 *
 * For example; error.auth.microsoft will be shortend to error.auth if error.auth.microsoft isn't found
 */
export let lexicon = {
  //Error
  error: "An unknown error has occurred",
  "error.auth": "An unknown authentication error has occurred",
  "error.auth.microsoft": "Failed to login to Microsoft account",
  "error.auth.xboxLive": "Failed to login to Xbox Live",
  "error.auth.xsts":
    "Unknown error occurred when attempting to optain an Xbox Live Security Token",
  "error.auth.xsts.userNotFound":
    "The given Microsoft account doesn't have an Xbox account",
  "error.auth.xsts.bannedCountry":
    "The given Microsoft account is from a country where Xbox live is not available",
  "error.auth.xsts.child":
    "The account is a child (under 18) and cannot proceed unless the account is added to a Family account by an adult",
  "error.auth.xsts.child.SK":
    "South Korean law: Go to the Xbox page and grant parental rights to continue logging in.",

  "error.auth.minecraft":
    "Unknown error occurred when attempting to login to Minecraft",
  "error.auth.minecraft.login":
    "Failed to authenticate with Mojang with given Xbox account",
  "error.auth.minecraft.profile": "Failed to fetch Minecraft profile",
  "error.auth.minecraft.entitlements": "Failed to fetch player entitlements",

  "error.gui": "An unknown gui framework error has occurred",
  "error.gui.closed": "Gui closed by user",
  "error.gui.raw.noBrowser": "no chromium browser was set, cannot continue!",

  "error.state.invalid": "[Internal]: Method not implemented.",
  "error.state.invalid.http":
    "[Internal]: Http server support not present in current environment.",
  "error.state.invalid.gui": "[Internal]: Invalid gui framework.",
  "error.state.invalid.redirect":
    "[Internal]: The token must have a redirect starting with 'http://localhost/' for this function to work!",
  "error.state.invalid.electron":
    "[Internal]: It seems you're attempting to load electron on the frontend. A critical function is missing!",
  //Load events
  load: "Generic load event",
  "load.auth": "Generic authentication load event",
  "load.auth.microsoft": "Logging into Microsoft account",
  "load.auth.xboxLive": "Logging into Xbox Live",
  "load.auth.xboxLive.1": "Logging into Xbox Live",
  "load.auth.xboxLive.2": "Authenticating with Xbox live",
  "load.auth.xsts": "Generating Xbox Live Security Token",

  "load.auth.minecraft": "Generic Minecraft login flow event",
  "load.auth.minecraft.login": "Authenticating with Mojang's servers",
  "load.auth.minecraft.profile": "Fetching player profile",
  "load.auth.minecraft.gamepass":
    "[experimental!] Checking if a user has gamepass",
  //Gui components
  gui: "Gui component",
  "gui.title": "Sign in to your account",
  "gui.market": "en-US",
};

export function getCode(lexcodes: Lexcodes) {
  const lex = lexcodes.split(".");
  do {
    const l = lex.join(".");
    if (l in lexicon) {
      return lexicon[l];
    }
    lex.pop();
  } while (lex.length > 0);
  return lexcodes;
}

export interface ExptOpts {
  ts: Lexcodes;
  response: Response;
}

export function error(ts: Lexcodes) {
  throw ts;
}

export function errorResponse(response: Response, ts: Lexcodes) {
  if (!response.ok) throw { response, ts };
}
export function wrapError(code: string | ExptOpts | any) {
  let name: Lexcodes;
  let opt: ExptOpts | null;
  if (typeof code == "string") {
    name = code as Lexcodes;
  } else {
    opt = code;
    name = opt.ts;
  }
  let message = getCode(name || "error");
  return { name, opt, message };
}

export function loadLexiPack(...file: string[]): typeof lexicon {
  const pack: typeof lexicon = JSON.parse(
    readFileSync(join(...file)).toString(),
  );
  lexicon = pack;
  return pack;
}
export class LexiLoader {
  auth: Auth;
  constructor(auth: Auth) {
    this.auth = auth;
  }

  load(code: Lexcodes) {
    this.auth.emit("load", code);
  }
}
