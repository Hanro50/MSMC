import fetch from "node-fetch";
import { errResponse, gmllUser, mclcUser, mcProfile } from "../assets.js";
import xbox from "./xbox.js";
import { auth } from "./auth.js"
export interface mcJWTDecoded { xuid: string, agg: string, sub: string, nbf: number, auth: string, roles: [], iss: string, exp: number, iat: number, platform: string, yuid: string }
export type entitlements = "game_minecraft" | "game_minecraft_bedrock" | "game_dungeons" | "product_minecraft" | "product_minecraft_bedrock" | "product_dungeons"
export interface mcToken {
    refresh?: string;
    mcToken: string;
    profile: mcProfile;
    xuid: string;
    exp: number;
}
/**Validates MC tokens to check if they're valid. */
export function validate(token: mcToken | minecraft | mclcUser) {
    if ("exp" in token)
        return (typeof token.exp == "number" && token.exp > Date.now());
    else if ("meta" in token && "exp" in token.meta)
        return (typeof token.meta.exp == "number" && token.meta.exp > Date.now());
    return false;
}

/**
 * Gets a minecraft token from a saved mcToken. 
 * @param auth A new instance of the auth object
 * @param token The mcToken
 * @param refresh Set to true if we should try refreshing the token
 * @returns A newly serialized minecraft Token. 
 * 
 * @warning The xbox object may not be restored using this method!
 */
export function fromToken(auth: auth, token: mcToken): null | minecraft
export function fromToken(auth: auth, token: mcToken, refresh?: boolean): Promise<minecraft>
export function fromToken(auth: auth, token: mcToken, refresh?: boolean): null | minecraft | Promise<minecraft> {
    if (validate(token) && refresh)
        return new Promise(async done => {
            const xbl = await auth.refresh(token.refresh);
            done(await xbl.getMinecraft())
        })
    let mc = new minecraft(token.mcToken, token.profile, auth, token.refresh, token.exp );
    return mc;
}

/**
 * Gets a minecraft token from a saved mcToken. 
 * @param auth A new instance of the auth object
 * @param token The mcToken
 * @returns A newly serialized minecraft Token. 
 * 
 * @warning The xbox object may not be restored using this method!
 */
export function fromMclcToken(auth: auth, token: mclcUser, refresh?: boolean): null | minecraft | Promise<minecraft> {
    return fromToken(auth, { mcToken: token.access_token, refresh: token.meta?.refresh, exp: token.meta?.exp, profile: { id: token.uuid, name: token.name }, xuid: token.meta?.xuid }, refresh)
}

export default class minecraft {

    readonly mcToken: string;
    readonly profile: mcProfile | undefined;
    readonly parent: xbox | auth;
    readonly xuid: string;
    readonly exp: number;
    refreshTkn: string;
    getToken(full: boolean): mcToken {
        return {
            refresh: (this.parent instanceof auth) ? this.refreshTkn : this.parent?.msToken?.refresh_token,
            mcToken: this.mcToken,
            profile: full ? this.profile : { name: this.profile.name, id: this.profile.id, demo: this.profile.demo },
            xuid: this.xuid,
            exp: this.exp
        }

    }
    constructor(mcToken: string, profile: mcProfile, parent: xbox)
    constructor(mcToken: string, profile: mcProfile, parent: auth, refreshTkn: string, exp: number)
    constructor(mcToken: string, profile: mcProfile, parent: xbox | auth, refreshTkn?: string, exp = new Date().getTime() + (1000 * 60 * 60 * 23)) {
        this.parent = parent;
        this.mcToken = mcToken;
        this.profile = profile;
        this.xuid = this._parseLoginToken().xuid;
        this.exp = exp;
        this.refreshTkn = refreshTkn;
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
                refresh: refreshable ? ((this.parent instanceof auth) ? this.refreshTkn : this.parent.msToken.refresh_token) : undefined
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
        this.parent = (this.parent instanceof auth) ? await this.parent.refresh(this.refreshTkn) : await this.parent.refresh(force);
        if (this.validate() && !force) return this
        let tkn = await this.parent.getMinecraft();
        //Copy back objects
        Object.keys(tkn).forEach(e => {
            this[e] = tkn[e];
        })
        return this;
    }
    validate() {
        return validate(this);
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