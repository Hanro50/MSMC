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
  tokens: tokens;
  microsoft: microsoft;
  minecraft: minecraft;
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
