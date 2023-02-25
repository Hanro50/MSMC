import fetch from "node-fetch";
import { errResponse, gmllUser, mclcUser, mcProfile } from "../assets.js";
import xbox from "./xbox.js";
export interface mcJWTDecoded { xuid: string, agg: string, sub: string, nbf: number, auth: string, roles: [], iss: string, exp: number, iat: number, platform: string, yuid: string }
export type entitlements = "game_minecraft" | "game_minecraft_bedrock" | "game_dungeons" | "product_minecraft" | "product_minecraft_bedrock" | "product_dungeons"

export default class minecraft {

    readonly mcToken: string;
    readonly profile: mcProfile;
    readonly parent: xbox;
    readonly xuid: string;
    readonly exp: number;

    constructor(parent: xbox, mcToken: string, profile: mcProfile) {
        this.parent = parent;
        this.mcToken = mcToken;
        this.profile = profile;
        this.xuid = this._parseLoginToken().xuid;
        this.exp = new Date().getTime() + (1000 * 60 * 60 * 23);
    }
    async entitlements() {
        var r998 = await fetch("https://api.minecraftservices.com/minecraft/profile", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${this.mcToken}`,
            },
        });
        errResponse(r998, "error.auth.minecraft.entitlements");
        const json = await r998.json() as { items: [{ name: entitlements, signature: string }] }
        const r: entitlements[] = [];
        json.items.forEach(e => {
            r.push(e.name)
        })
        return r;
    }
    isDemo() {
        return this.profile.demo;
    }
    mclc() {
        return {
            access_token: this.mcToken,
            client_token: getUUID(),
            uuid: this.profile.id,
            name: this.profile.name,
            meta: {
                xuid: this.xuid,
                type: "msa",
                demo: this.profile.demo
            },
            user_properties: {}
        } as mclcUser
    }
    gmll(): gmllUser {
        return {
            profile: {
                id: this.profile.id,
                name: this.profile.name,
                xuid: this.xuid,
                type: "msa",
                demo: this.profile.demo,
            },
            access_token: this.mcToken
        }
    }
    async refresh(force?: boolean) {
        //@ts-ignore
        this.parent = await this.parent.refresh(force);
        if (this.validate() && !force) return this
        let tkn = await this.parent.getMinecraft();
        //Copy back objects
        Object.keys(tkn).forEach(e => {
            this[e] = tkn[e];
        })
        return this;
    }
    validate() {
        return this.exp > Date.now();
    }
    _parseLoginToken() {
        var base64Url = this.mcToken.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(Buffer.from(base64, "base64").toString("utf8").split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload) as mcJWTDecoded;
    }
}

function getUUID() {
    var result = ""
    for (var i = 0; i <= 4; i++) {
        result += (Math.floor(Math.random() * 16777216) + 1048576).toString(16);
        if (i < 4) result += "-"
    }
    return result;
}