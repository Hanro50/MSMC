import EventEmitter from "events";
import type { lexicon } from "./util/lexicon";

export type Lexcodes = keyof typeof lexicon;

export declare interface AuthEvents extends EventEmitter {
  on(event: "load", listener: (asset: Lexcodes, message: string) => void): this;
  once(
    event: "load",
    listener: (asset: Lexcodes, message: string) => void,
  ): this;
  emit(event: "load", asset: Lexcodes): boolean;
}

/**
 * This library's supported gui frameworks.
 * (Raw requires no extra dependencies, use it if you're using some unknown framework!)
 */
export type Framework = "electron" | "nwjs" | "raw";
/**
 * For more information. Check out Microsoft's support page: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code <br>
 *
 * Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the fastLaunch or launch functions under either Electron or NW.js
 */
export type Prompt = "login" | "none" | "consent" | "select_account";
/**
 * The Oauth2 details needed to log you in.
 *
 * Resources
 * 1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
 * 2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
 * 3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
 *
 */
export interface MSToken {
  client_id: string;
  redirect: string;
  clientSecret?: string;
  prompt?: Prompt;
}
export interface MSAuthToken {
  token_type: string;
  expires_in: number;
  scope: string;
  access_token: string;
  refresh_token: string;
  user_id: string;
  foci: string;
}

/**
 * A copy of the user object mclc uses
 */
export type MclcUser = {
  access_token: string;
  client_token?: string;
  uuid: string;

  name?: string;
  meta?: {
    refresh: string;
    exp?: number;
    type: "mojang" | "msa" | "legacy";
    xuid?: string;
    demo?: boolean;
  };
  user_properties?: Partial<any>;
};
/**
 * Used by graphical Electron and NW.js integrations to set the properties of the generated pop-up
 */
export interface WindowProperties {
  width: number;
  height: number;
  /**Raw ignores this property!*/
  resizable?: boolean;
  /**Raw only: Stops MSMC from passing through the browser console log*/
  suppress?: boolean;
  [key: string]: any;
}

export interface MCProfile {
  id: string;
  name: string;
  skins?: Array<{
    id: string;
    state: "ACTIVE";
    url: string;
    variant: "SLIM" | "CLASSIC";
  }>;
  capes?: Array<{
    id: string;
    state: "ACTIVE";
    url: string;
    alias: string;
  }>;
  demo?: boolean;
}

export interface GmllUser {
  profile: {
    id: string;
    name: string;
    xuid?: string;
    type?: "mojang" | "msa" | "legacy";
    demo?: boolean;
    properties?: {
      //We're still reverse engineering what this property is used for...
      //This likely does not work anymore...
      twitch_access_token: string;
    };
  };
  access_token?: string;
}
export interface MCJWTDecoded {
  xuid: string;
  agg: string;
  sub: string;
  nbf: number;
  auth: string;
  roles: [];
  iss: string;
  exp: number;
  iat: number;
  platform: string;
  yuid: string;
}
export type Entitlements =
  | "game_minecraft"
  | "game_minecraft_bedrock"
  | "game_dungeons"
  | "product_minecraft"
  | "product_minecraft_bedrock"
  | "product_dungeons";
export interface MCToken {
  refresh?: string;
  mcToken: string;
  profile: MCProfile;
  xuid: string;
  exp: number;
}

export interface MCAuthToken {
  username: string;
  roles: [];
  access_token: string;
  token_type: string;
  expires_in: number;
}
export interface XblAuthToken {
  IssueInstant?: string;
  NotAfter?: string;
  Token: string;
  DisplayClaims?: { xui: [{ uhs: string }] };
}
