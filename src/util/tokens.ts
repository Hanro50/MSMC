import type { Auth } from "../auth/auth.js";
import type { MCToken, MclcUser } from "../types";

import { Minecraft } from "../auth/minecraft.js";
import { validate } from "./validate.js";
/**Validates MC tokens to check if they're valid. */

/**
 * Gets a Minecraft token from a saved mcToken.
 * @param auth A new instance of the Auth object
 * @param token The mcToken
 * @param refresh Set to true if we should try refreshing the token
 * @returns A newly serialized Minecraft Token.
 *
 * @warning The Xbox object may not be restored using this method!
 */
export function fromToken(auth: Auth, token: MCToken): null | Minecraft;
export function fromToken(
  auth: Auth,
  token: MCToken,
  refresh?: boolean,
): Promise<Minecraft>;
export function fromToken(
  auth: Auth,
  token: MCToken,
  refresh?: boolean,
): null | Minecraft | Promise<Minecraft> {
  if (validate(token) && refresh)
    return new Promise(async (done) => {
      const xbl = await auth.refresh(token.refresh);
      done(await xbl.getMinecraft());
    });
  let mc = new Minecraft(
    token.mcToken,
    token.profile,
    auth,
    token.refresh,
    token.exp,
  );
  return mc;
}

/**
 * Gets a Minecraft token from a saved mcToken.
 * @param auth A new instance of the Auth object
 * @param token The mcToken
 * @returns A newly serialized Minecraft Token.
 *
 * @warning The Xbox object may not be restored using this method!
 */
export function fromMclcToken(
  auth: Auth,
  token: MclcUser,
  refresh?: boolean,
): null | Minecraft | Promise<Minecraft> {
  return fromToken(
    auth,
    {
      mcToken: token.access_token,
      refresh: token.meta?.refresh,
      exp: token.meta?.exp,
      profile: { id: token.uuid, name: token.name },
      xuid: token.meta?.xuid,
    },
    refresh,
  );
}
