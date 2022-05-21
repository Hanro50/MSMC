import { exception, lexcodes } from "./assets.js";
import { auth, loader, mcAuthToken, mcProfile, msAuthToken, xblAuthToken } from "./auth.js";
import fetch from "node-fetch";
export interface infXbox {
    parent: auth;
    msToken: msAuthToken;
    xblToken: xblAuthToken;
    refresh(force?: boolean): Promise<this>;
    social(): Promise<this & infSocial>;
    minecraft(): Promise<this & infMinecraft>;
    validate(): { xbox: boolean }
}
export interface infMinecraft {
    mcToken: string;
    profile?: mcProfile;
    entitlements(): Promise<entitlements[]>
    validate(): { xbox: boolean, minecraft?: boolean }

}
export interface infSocial {
    header: string;
}

export default class xbox implements infXbox, infMinecraft, infSocial {
    parent: auth;
    msToken: msAuthToken;
    xblToken: xblAuthToken;
    constructor(parent: auth, MStoken: msAuthToken, xblToken: xblAuthToken) {
        this.parent = parent;
        this.msToken = MStoken;
        this.xblToken = xblToken
    }

    //Internal 
    load(code: lexcodes) {
        this.parent.emit("load", code);
    }
    async _xAuth(RelyingParty = "http://xboxlive.com") {
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
        //  if (!rxsts.ok) new exception("error.auth.xsts", { response: rxsts });

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
            new exception(ts);
        }
        console.log(XSTS.DisplayClaims)
        return `XBL3.0 x=${XSTS.DisplayClaims.xui[0].uhs};${XSTS.Token}`
    }
    //infxbox
    async refresh(force: boolean) {
        const valid = this.validate()
        let tkn = await this.parent.refresh(this.msToken) as infXbox
        if (this.header && (valid.xbox || force))
            tkn = await tkn.social();
        if (this.mcToken && (valid.minecraft || force))
            tkn = await tkn.minecraft();
        //Copy back objects
        Object.keys(tkn).forEach(e => {
            this[e] = tkn[e];
        })
        return this;
    }

    async social() {
        (this as this & infSocial).header = await this._xAuth();
        return this as this & infSocial
    }

    async minecraft() {
        const auth = await this._xAuth("rp://api.minecraftservices.com/");
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
        if (!rlogin_with_xbox.ok) new exception("error.auth.minecraft.login", { response: rlogin_with_xbox });
        var MCauth = await rlogin_with_xbox.json() as mcAuthToken;
        this.load('load.auth.minecraft.profile')
        var r998 = await fetch("https://api.minecraftservices.com/minecraft/profile", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${MCauth.access_token}`,
            },
        });
        if (!r998.ok) new exception("error.auth.minecraft.profile", { response: r998 });
        var MCprofile = await r998.json() as mcProfile & { error?: string };
        const profile = MCprofile.error ? { id: MCauth.username, capes: [], skins: [], name: "player", demo: true } : MCprofile;
        const self = (this as this & infMinecraft)
        self.mcToken = MCauth.access_token;
        self.profile = profile
        return self as this & infMinecraft;
        // return new minecraft(this, MCauth.access_token, profile);
    }
    validate(): { xbox: boolean, minecraft?: boolean } {
        throw new Error("Method not implemented.");
    }

    //infminecraft

    mcToken: string;
    profile: mcProfile;

    _mcCheckit() {
        if (!this.mcToken) new exception("error.state.invalid")
    }
    async entitlements() {
        this._mcCheckit();
        this.load('load.auth.minecraft.entitlements')

        var r998 = await fetch("https://api.minecraftservices.com/minecraft/profile", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${this.mcToken}`,
            },
        });
        if (!r998.ok) new exception("error.auth.minecraft.entitlements", { response: r998 });
        const json = await r998.json() as { items: [{ name: entitlements, signature: string }] }
        const r: entitlements[] = [];
        json.items.forEach(e => {
            r.push(e.name)
        })
        return r;
    }

    isDemo() {
        this._mcCheckit();
        return this.profile.demo;
    }

    //infsocial
    header: string;
    _scCheckit() {
        if (!this.header) new exception("error.state.invalid")
    }



}






export type entitlements = "game_minecraft" | "game_minecraft_bedrock" | "game_dungeons" | "product_minecraft" | "product_minecraft_bedrock" | "product_dungeons"




