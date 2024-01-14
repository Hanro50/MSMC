import type { Minecraft } from "../auth/minecraft";
import type { MCToken, MclcUser } from "../types";

export function validate(token: MCToken | Minecraft | MclcUser) {
  if ("exp" in token)
    return typeof token.exp == "number" && token.exp > Date.now();
  else if ("meta" in token && "exp" in token.meta)
    return typeof token.meta.exp == "number" && token.meta.exp > Date.now();
  return false;
}
exports.default = validate;
