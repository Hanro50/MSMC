import type {
  microsoftAuthResponse,
  xboxAuthResponse,
  mstoken,
  prompt,
  windowProperties,
  xstsErrorResponse,
  xstsAuthResponse,
  loginWithXboxResponse,
  entitlement,
  mcProfile,
} from "./types";
import { emitter } from "./events";
import { LoginError, XSTSError } from "./error";
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

export function microsoftRefreshBody(token: mstoken, refreshToken: string) {
  return (
    "client_id=" +
    token.client_id +
    (token.clientSecret ? "&client_secret=" + token.clientSecret : "") +
    "&refresh_token=" +
    refreshToken +
    "&grant_type=refresh_token"
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

  if (!microsoftResponse.ok)
    throw new LoginError(
      "error.auth.microsoft",
      "Failed to login to Microsoft account"
    );

  return (await microsoftResponse.json()) as microsoftAuthResponse;
}

export async function xboxAuth(accessToken: string) {
  const xboxResponse = await fetch(
    "https://user.auth.xboxlive.com/user/authenticate",
    {
      method: "post",
      body: JSON.stringify({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: `d=${accessToken}`,
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
  if (!xboxResponse.ok)
    throw new LoginError("error.auth.xboxLive", "Failed to login to Xbox Live");

  return await xboxResponse.json();
}

export async function obtainXSTS(
  xboxAuthResponse: xboxAuthResponse,
  party = "rp://api.minecraftservices.com/"
) {
  let rxsts = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
    method: "post",
    body: JSON.stringify({
      Properties: { SandboxId: "RETAIL", UserTokens: [xboxAuthResponse.Token] },
      RelyingParty: party,
      TokenType: "JWT",
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!rxsts.ok) {
    if (rxsts.status === 401)
      throw new XSTSError((await rxsts.json()) as xstsErrorResponse);

    throw new LoginError("error.auth.xsts", "Failed to obtain XSTS token");
  }
  return (await rxsts.json()) as xstsAuthResponse;
}

export async function loginWithXbox(
  xstsAuthResponse: xstsAuthResponse
): Promise<loginWithXboxResponse> {
  const identityToken = `XBL3.0 x=${xstsAuthResponse.DisplayClaims.xui[0].uhs};${xstsAuthResponse.Token}`;
  var rlogin_with_xbox = await fetch(
    "https://api.minecraftservices.com/authentication/login_with_xbox",
    {
      method: "post",
      body: JSON.stringify({
        identityToken: identityToken,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  if (!rlogin_with_xbox.ok)
    throw new LoginError(
      "error.auth.minecraft.login",
      "Failed to login with Xbox"
    );
  return (await rlogin_with_xbox.json()) as loginWithXboxResponse;
}
export async function getEntitlements(
  loginWithXboxResponse: loginWithXboxResponse
): Promise<entitlement[]> {
  const entitlementsResponse = await fetch(
    "https://api.minecraftservices.com/entitlements/mcstore",
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${loginWithXboxResponse.access_token}`,
      },
    }
  );
  if (!entitlementsResponse.ok)
    throw new LoginError(
      "error.auth.minecraft.entitlements",
      "Failed to get entitlements"
    );
  return (await entitlementsResponse.json()) as entitlement[];
}

export async function getProfile(
  loginWithXboxResponse: loginWithXboxResponse
): Promise<mcProfile> {
  const profileResponse = await fetch(
    "https://api.minecraftservices.com/minecraft/profile",
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${loginWithXboxResponse.access_token}`,
      },
    }
  );
  let profile:
    | mcProfile
    | { path: string; error: string; errorMessage: string };
  try {
    profile = await profileResponse.json();
  } catch (error) {
    throw new LoginError(
      "error.auth.minecraft.profile",
      "Failed to get profile"
    );
  }

  if ("error" in profile) {
    if (profile.error === "NOT_FOUND")
      return {
        id: loginWithXboxResponse.username,
        name: "Steve",
        skins: [],
        capes: [],
        demo: true,
      };
    throw new LoginError(
      "error.auth.minecraft.profile",
      "Failed to get profile"
    );
  }
  return profile;
}
