import type { mstoken, prompt, windowProperties } from "./types";
import { emitter } from "./events";
import { LoginError } from "./error";
export function getWindowProperties(
  overrides: Partial<windowProperties>
): windowProperties {
  return {
    width: 500,
    height: 650,
    resizable: false,
    title: "Microsoft Authentication",
    ...overrides,
  };
}
export function createAuthLink(token: mstoken) {
  return (
    "https://login.live.com/oauth20_authorize.srf" +
    "?client_id=" +
    token.client_id +
    "&response_type=code" +
    "&redirect_uri=" +
    encodeURIComponent(token.redirect) +
    "&scope=XboxLive.signin%20offline_access" +
    (token.prompt ? "&prompt=" + token.prompt : "") +
    "&mkt=" +
    token.market
  );
}
export function mojangAuthToken(token?: Partial<mstoken>): mstoken {
  return {
    client_id: token?.client_id || "00000000402b5328",
    redirect: token?.redirect || "https://login.live.com/oauth20_desktop.srf",
    prompt: token?.prompt || "login",
    market: token?.market || "en-US",
  };
}

export function microsoftAuthBody(token: mstoken, code: string) {
  return (
    "client_id=" +
    this.token.client_id +
    (this.token.clientSecret
      ? "&client_secret=" + this.token.clientSecret
      : "") +
    "&code=" +
    code +
    "&grant_type=authorization_code" +
    "&redirect_uri=" +
    token.redirect
  );
}

export async function microsoftAuth(body: string) {
  const microsoftResponse = await fetch(
    "https://login.live.com/oauth20_token.srf",
    {
      method: "post",
      body: body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  if (!microsoftResponse.ok) {
    throw new LoginError(
      "error.auth.microsoft",
      "Failed to login to Microsoft account"
    );
  }

  return await microsoftResponse.json();
}

export async function xboxAuth(access_token: string) {
  const xboxResponse = await fetch(
    "https://user.auth.xboxlive.com/user/authenticate",
    {
      method: "post",
      body: JSON.stringify({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: `d=${access_token}`,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  if (!xboxResponse.ok) {
    throw new LoginError("error.auth.xboxLive", "Failed to login to Xbox Live");
  }
  var token = await xboxResponse.json();
  return token;
}
