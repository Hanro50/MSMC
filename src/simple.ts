import {
  getProfile,
  getWindowProperties,
  loginWithXbox,
  microsoftAuth,
  microsoftAuthBody,
  microsoftRefreshBody,
  mojangAuthToken,
  obtainXSTS,
  xboxAuth,
} from "./advance";
import { emitter } from "./events";
import { launch } from "./gui/common";
import type { config, framework, result, tokens } from "./types";

function loadEvent(
  code: string,
  message: string,
  progress: number,
  total: number
) {
  emitter.emit("loadEvent", {
    code,
    message,
    progress,
    total,
  });
}

export async function authenticate(
  framework: framework,
  config: config
): Promise<result> {
  const token =
    config?.token ||
    mojangAuthToken({
      prompt: config?.prompt,
      market: config?.market,
    });

  const windowProperties = getWindowProperties(config?.windowProperties || {});
  loadEvent("load.starting", "Starting authentication", 0, 6);
  const code = await launch(token, framework, windowProperties);
  loadEvent("load.auth.microsoft", "Logging in to Microsoft", 1, 6);
  const microsoftBody = microsoftAuthBody(token, code);
  const microsoftAuthResponse = await microsoftAuth(microsoftBody);
  loadEvent("load.auth.xboxLive", "Logging in to Xbox Live", 2, 6);
  const xboxAuthResponse = await xboxAuth(microsoftAuthResponse.access_token);
  loadEvent("load.auth.xsts", "Generating Xbox Live Security Token", 3, 6);
  const xstsAuthResponse = await obtainXSTS(xboxAuthResponse);
  loadEvent("load.auth.loginWithXbox", "Logging in to Minecraft", 4, 6);
  const loginWithXboxResponse = await loginWithXbox(xstsAuthResponse);
  loadEvent("load.auth.minecraft", "Getting Minecraft profile", 5, 6);
  const minecraftProfile = await getProfile(loginWithXboxResponse);
  loadEvent("load.auth.done", "Done!", 6, 6);

  return {
    tokens: {
      refresh: microsoftAuthResponse.refresh_token,
      access: loginWithXboxResponse.access_token,
      exp: new Date().getTime() + microsoftAuthResponse.expires_in * 1000,
    },
    minecraft: minecraftProfile,

    extra: {
      xboxAuthResponse,
      xstsAuthResponse,
      loginWithXboxResponse,
      minecraftProfile,
    },
  };
}

export async function refresh(tokens: tokens, config: config): Promise<result> {
  const token =
    config?.token ||
    mojangAuthToken({
      prompt: config?.prompt,
      market: config?.market,
    });
  loadEvent("load.starting", "Starting authentication", 0, 6);

  if (new Date().getTime() > tokens.exp) {
    loadEvent("load.refresh.microsoft", "Refreshing Microsoft token", 1, 6);

    const refreshBody = microsoftRefreshBody(token, tokens.refresh);
    const microsoftAuthResponse = await microsoftAuth(refreshBody);
    tokens = {
      refresh: microsoftAuthResponse.refresh_token,
      access: microsoftAuthResponse.access_token,
      exp: new Date().getTime() + microsoftAuthResponse.expires_in * 1000,
    };
  }
  loadEvent("load.refresh.xboxLive", "Refreshing Xbox Live token", 2, 6);
  const xboxAuthResponse = await xboxAuth(tokens.access);
  loadEvent("load.refresh.xsts", "Generating Xbox Live Security Token", 3, 6);
  const xstsAuthResponse = await obtainXSTS(xboxAuthResponse);
  loadEvent("load.refresh.loginWithXbox", "Logging in to Minecraft", 4, 6);
  const loginWithXboxResponse = await loginWithXbox(xstsAuthResponse);
  loadEvent("load.refresh.minecraft", "Getting Minecraft profile", 5, 6);
  const minecraftProfile = await getProfile(loginWithXboxResponse);
  loadEvent("load.refresh.done", "Done!", 6, 6);
  return {
    tokens: tokens,
    minecraft: minecraftProfile,
    extra: {
      xboxAuthResponse,
      xstsAuthResponse,
      loginWithXboxResponse,
      minecraftProfile,
    },
  };
}
