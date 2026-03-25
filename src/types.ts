/**
 * This library's supported gui frameworks.
 * (Raw requires no extra dependencies, use it if you're using some unknown framework!)
 */
export type framework = "electron" | "nwjs" | "raw";
export type prompt = "login" | "none" | "consent" | "select_account";

export type loadevent = {
  code: string;
  message: string;
  progress: number;
  total: number;
};

export type tokens = {
  refresh: string;
  access: string;
  exp: number;
};

export type minecraft = {};

export type microsoft = {};

export type result = {
  tokens: {
    refresh: string;
    access: string;
    exp: number;
  };
  minecraft: mcProfile;
  extra: {
    xboxAuthResponse: xboxAuthResponse;
    xstsAuthResponse: xstsAuthResponse;
    loginWithXboxResponse: loginWithXboxResponse;
    minecraftProfile: mcProfile;
  };
};
export interface mstoken {
  client_id: string;
  redirect: string;
  clientSecret?: string;
  prompt?: prompt;

  market?: string; //en-US, fr-FR, de-DE, it-IT, es-ES, ja-JP, ko-KR, zh-CN, zh-TW
}

export interface windowProperties {
  width: number;
  height: number;
  /**Raw ignores this property!*/
  resizable?: boolean;
  /**Raw only: Stops MSMC from passing through the browser console log*/
  suppress?: boolean;
  /**The title of the window*/
  title?: string;
  [key: string]: any;
}

export type config = {
  token?: mstoken;
  prompt?: prompt;
  windowProperties?: Partial<windowProperties>;
  market?: string; //en-US, fr-FR, de-DE, it-IT, es-ES, ja-JP, ko-KR, zh-CN, zh-TW
};

export type microsoftAuthResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  refresh_token: string;
  id_token: string;
};

export type xboxAuthResponse = {
  IssueInstant: string;
  NotAfter: string;
  Token: string; // save this, this is your xbl token
  DisplayClaims: {
    xui: [
      {
        uhs: string;
      }
    ];
  };
};

export type xstsErrorResponse = {
  Identity: string;
  XErr: number;
  Message: string;
  Redirect: string;
};

export type xstsAuthResponse = {
  IssueInstant: string;
  NotAfter: string;
  Token: string;
  DisplayClaims: {
    xui: [
      {
        uhs: string;
      }
    ];
  };
};

export type loginWithXboxResponse = {
  username: string; // this is not the uuid of the account
  roles: [];
  access_token: string; // jwt, your good old minecraft access token
  token_type: string;
  expires_in: number;
};

export type entitlement = {
  name:
    | "product_minecraft"
    | "game_minecraft"
    | "product_minecraft_bedrock"
    | "game_minecraft_bedrock"
    | "product_dungeons"
    | "game_dungeons"
    | "product_legends"
    | "game_legends"
    | "product_game_pass_pc"
    | "product_game_pass_ultimate";
  signature: "jwt";
};

export type mcProfile = {
  id: string; // the real uuid of the account, woo
  name: string; // the mc user name of the account
  skins: {
    id: string;
    state: "ACTIVE" | "INACTIVE";
    url: string;
    variant: "SLIM" | "CLASSIC";
    alias: string;
  }[];
  capes: {
    id: string;
    state: "ACTIVE" | "INACTIVE";
    url: string;
    alias: string;
  }[];
  demo?: boolean; // True if the account is a demo account
};
