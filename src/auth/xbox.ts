import { err, errResponse, lexcodes, mcProfile } from "../assets.js";
import { auth, msAuthToken } from "./auth.js";
import fetch from "node-fetch";

import social from "./social.js";
import minecraft from "./minecraft.js";

export interface mcAuthToken {
    username: string,
    roles: [],
    access_token: string
    token_type: string,
    expires_in: number
}
export interface xblAuthToken {
    IssueInstant: string
    NotAfter: string
    Token: string
    DisplayClaims: { xui: [{ uhs: string }] }
}



export default class xbox {
    readonly parent: auth;
    readonly msToken: msAuthToken;
    readonly xblToken: xblAuthToken;
    readonly exp: number;

    constructor(parent: auth, MStoken: msAuthToken, xblToken: xblAuthToken) {
        this.parent = parent;
        this.msToken = MStoken;
        this.xblToken = xblToken;

        this.exp = new Date().getTime() + (60 * 60 * 1000) - 1000;
    }
    load(code: lexcodes) {
        this.parent.emit("load", code);
    }
    async xAuth(RelyingParty = "http://xboxlive.com") {
        this.load('load.auth.xsts');
        let rxsts = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
            method: "post",
            body: JSON.stringify({
                Properties: { SandboxId: "RETAIL", UserTokens: [this.xblToken.Token] },
                RelyingParty,
                TokenType: "JWT",
            }),
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        });

        var XSTS = await rxsts.json();
        if (XSTS.XErr) {
            var ts = "error.auth.xsts" as lexcodes;
            switch (XSTS.XErr) {
                case 2148916233: ts = "error.auth.xsts.userNotFound"; break;
                case 2148916235: ts = "error.auth.xsts.bannedCountry"; break;
                case 2148916236:
                case 2148916237: ts = "error.auth.xsts.child.SK"; break;
                case 2148916238: ts = "error.auth.xsts.child"; break;
            }
            err(ts);
        }
        console.log(XSTS.DisplayClaims)
        return `XBL3.0 x=${XSTS.DisplayClaims.xui[0].uhs};${XSTS.Token}`
    }
    //infxbox
    async refresh(force?: boolean) {
        if (this.validate() && !force) return this
        let tkn = await this.parent.refresh(this.msToken);
        //Copy back objects
        Object.keys(tkn).forEach(e => {
            this[e] = tkn[e];
        })
        return this;
    }

    async getSocial() {
        const header = await this.xAuth();
        const _social = new social(header)
        return _social;
    }

    async getMinecraft() {
        const auth = await this.xAuth("rp://api.minecraftservices.com/");
        this.load('load.auth.minecraft.login')
        var rlogin_with_xbox = await fetch(
            "https://api.minecraftservices.com/authentication/login_with_xbox",
            {
                method: "post",
                body: JSON.stringify({
                    identityToken: auth
                }),
                headers: { "Content-Type": "application/json", Accept: "application/json" },
            }
        );
        errResponse(rlogin_with_xbox, "error.auth.minecraft.login")
        var MCauth = await rlogin_with_xbox.json() as mcAuthToken;
        this.load('load.auth.minecraft.profile')
        var r998 = await fetch("https://api.minecraftservices.com/minecraft/profile", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${MCauth.access_token}`,
            },
        });
        errResponse(r998, "error.auth.minecraft.profile")
        var MCprofile = await r998.json() as mcProfile & { error?: string };
        const profile = MCprofile.error ? { id: MCauth.username, capes: [], skins: [], name: "player", demo: true } : MCprofile;
        let mc = new minecraft(this, MCauth.access_token, profile);
        if (mc.isDemo()) {
            this.load('load.auth.minecraft.gamepass');
            const entitlements = await mc.entitlements()
            if (entitlements.includes("game_minecraft") || entitlements.includes("product_minecraft")) {
                const social = await (await this.getSocial()).getProfile();
                mc = new minecraft(this, MCauth.access_token, { id: MCauth.username, capes: [], skins: [], name: social.gamerTag });
            }
        }
        return mc
    }
    validate() {
        return this.exp > Date.now();
    }
    /**
     * Feed this into the refresh funtion in the auth object that generated it.
     * @returns The refresh token
     */
    save() {
        return this.msToken.refresh_token;
    }
}