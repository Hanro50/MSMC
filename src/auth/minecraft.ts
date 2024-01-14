import fetch from "node-fetch";
import { Auth } from "./auth.js";
import { errorResponse } from "../util/lexicon.js";
import { validate } from "../util/validate.js";

import type {
  MCProfile,
  MclcUser,
  GmllUser,
  MCToken,
  Entitlements,
  MCJWTDecoded,
} from "../types.js";
import type { Xbox } from "./xbox.js";

export class Minecraft {
  readonly mcToken: string;
  readonly profile: MCProfile | undefined;
  readonly parent: Xbox | Auth;
  readonly xuid: string;
  readonly exp: number;
  refreshTkn: string;
  getToken(full: boolean): MCToken {
    return {
      refresh:
        this.parent instanceof Auth
          ? this.refreshTkn
          : this.parent?.msToken?.refresh_token,
      mcToken: this.mcToken,
      profile: full
        ? this.profile
        : {
            name: this.profile.name,
            id: this.profile.id,
            demo: this.profile.demo,
          },
      xuid: this.xuid,
      exp: this.exp,
    };
  }
  constructor(mcToken: string, profile: MCProfile, parent: Xbox);
  constructor(
    mcToken: string,
    profile: MCProfile,
    parent: Auth,
    refreshTkn: string,
    exp: number,
  );
  constructor(
    mcToken: string,
    profile: MCProfile,
    parent: Xbox | Auth,
    refreshTkn?: string,
    exp = new Date().getTime() + 1000 * 60 * 60 * 23,
  ) {
    this.parent = parent;
    this.mcToken = mcToken;
    this.profile = profile;
    this.xuid = this._parseLoginToken().xuid;
    this.exp = exp;
    this.refreshTkn = refreshTkn;
  }
  async entitlements() {
    var r998 = await fetch(
      "https://api.minecraftservices.com/minecraft/profile",
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${this.mcToken}`,
        },
      },
    );
    errorResponse(r998, "error.auth.minecraft.entitlements");
    const json = (await r998.json()) as {
      items: [{ name: Entitlements; signature: string }];
    };
    const r: Entitlements[] = [];
    json.items.forEach((e) => {
      r.push(e.name);
    });
    return r;
  }
  isDemo() {
    return this.profile.demo;
  }
  /**
   * A MCLC user object for launching minecraft
   * @param refreshable Should we embed some metadata for refreshable tokens?
   * @returns returns an MCLC user token
   *
   */
  mclc(refreshable?: boolean) {
    return {
      access_token: this.mcToken,
      client_token: getUUID(),
      uuid: this.profile.id,
      name: this.profile.name,
      meta: {
        xuid: this.xuid,
        type: "msa",
        demo: this.profile.demo,
        exp: this.exp,
        refresh: refreshable
          ? this.parent instanceof Auth
            ? this.refreshTkn
            : this.parent.msToken.refresh_token
          : undefined,
      },
      user_properties: {},
    } as MclcUser;
  }
  gmll(): GmllUser {
    return {
      profile: {
        id: this.profile.id,
        name: this.profile.name,
        xuid: this.xuid,
        type: "msa",
        demo: this.profile.demo,
      },
      access_token: this.mcToken,
    };
  }
  async refresh(force?: boolean) {
    //@ts-ignore
    this.parent =
      this.parent instanceof Auth
        ? await this.parent.refresh(this.refreshTkn)
        : await this.parent.refresh(force);
    if (this.validate() && !force) return this;
    let tkn = await this.parent.getMinecraft();
    //Copy back objects
    Object.keys(tkn).forEach((e) => {
      this[e] = tkn[e];
    });
    return this;
  }
  validate() {
    return validate(this);
  }
  _parseLoginToken() {
    var base64Url = this.mcToken.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString("utf8")
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload) as MCJWTDecoded;
  }
}

function getUUID() {
  var result = "";
  for (var i = 0; i <= 4; i++) {
    result += (Math.floor(Math.random() * 16777216) + 1048576).toString(16);
    if (i < 4) result += "-";
  }
  return result;
}
module.exports.default = Minecraft;
