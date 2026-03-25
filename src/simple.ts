import {
  createAuthLink,
  getWindowProperties,
  mojangAuthToken,
} from "./advance";
import { emitter } from "./events";
import { launch } from "./gui/common";
import type { config, framework, loadevent, result, tokens } from "./types";

export async function authenticate(framework: framework, config: config) {
  let token =
    config?.token ||
    mojangAuthToken({
      prompt: config?.prompt,
      market: config?.market,
    });

  const windowProperties = getWindowProperties(config?.windowProperties || {});
  emitter.emit("loadEvent", {
    code: "load.starting",
    message: "Loading event",
    progress: 0,
    total: 100,
  });

  const code = await launch(token, framework, windowProperties);
}

export async function refresh(tokens: tokens, config: config) {}
