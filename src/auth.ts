import EventEmitter from "events";
import { exception, lexcodes, windowProperties } from "./assets";
import fetch from "node-fetch";
import {infXbox} from "./endpoints";
/**
 * This library's supported gui frameworks. 
 * (Raw requires no extra dependencies, use it if you're using some unknown framework!)
 */
export type framework = "electron" | "nwjs" | "raw";
/**
 * For more information. Check out Microsoft's support page: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code <br>
 * 
 * Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the fastLaunch or launch functions under either Electron or NW.js
 */
export type prompt = "login" | "none" | "consent" | "select_account";
/**
 * The Oauth2 details needed to log you in. 
 * 
 * Resources
 * 1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
 * 2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
 * 3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
 * 
 * Recommendations: 
 * 
 * 1) Use "Mobile and desktop applications" as your type setting and make sure to set it up to only use "Personal Microsoft accounts only". 
 * You're not a university!
 * 
 * 2) set the redirect to "http://localhost/...", With localhost specifically Microsoft does not check port numbers. 
 * This means that  http://localhost:1/... to http://localhost:65535/... are all the same redirect to MS. (http://localhost/... == http://localhost:80/... btw)
 * This library does not allow you to set the port manually, due to the extreme risk of unforeseen bugs popping up. 
 * 
 * 3) If you set the redirect to, for example, "http://localhost/Rainbow/Puppy/Unicorns/hl3/confirmed" then the variable {redirect} needs to equal "Rainbow/Puppy/Unicorns/hl3/confirmed".
 * 
 * 4) Basically the redirect field is equal to your redirect URL you gave microsoft without the "http://localhost/" part. 
 * Please keep this in mind or you'll get weird errors as a mismatch here will still work...sort of. 
 */
export interface MStoken {
    client_id: string,
    clientSecret?: string,
    redirect?: string,
    prompt?: prompt
}
export interface msAuthToken {
    token_type: string,
    expires_in: number,
    scope: string,
    access_token: string,
    refresh_token: string,
    user_id: string,
    foci: string
}
export interface xblAuthToken {
    IssueInstant: string
    NotAfter: string
    Token: string
    DisplayClaims: { xui: [{ uhs: string }] }
}
export interface mcAuthToken {
    username: string,
    roles: [],
    access_token: string
    token_type: string,
    expires_in: number
}
export interface mcProfile {
    id: string,
    name: string,
    skins: Array<
        {
            id: string,
            state: 'ACTIVE',
            url: string,
            variant: 'SLIM' | 'CLASSIC'
        }
    >,
    capes: Array<
        {
            id: string,
            state: 'ACTIVE',
            url: string,
            alias: string
        }
    >,
    demo?: boolean
}
function mojangAuthToken(prompt?: prompt) {
    const token = {
        client_id: "00000000402b5328",
        redirect: "https://login.live.com/oauth20_desktop.srf",
        prompt: prompt
    }
    return token;
}
export class loader {
    auth: auth
    constructor(auth: auth) {
        this.auth = auth;
    }

    load(code: lexcodes) {
        this.auth.emit("load", code);
    }
}



export declare interface auth extends EventEmitter {
    on(event: "start", listener: (asset: lexcodes) => void): this
    on(event: "load", listener: (asset: lexcodes) => void): this
    on(event: "error", listener: (asset: lexcodes) => void): this
    on(event: "done", listener: (asset: lexcodes) => void): this

    once(event: "start", listener: (asset: lexcodes) => void): this
    once(event: "error", listener: (asset: lexcodes) => void): this
    once(event: "done", listener: (asset: lexcodes) => void): this

    emit(event: "start", asset: lexcodes): boolean;
    emit(event: "load", asset: lexcodes): boolean;
    emit(event: "error", asset: lexcodes): boolean;
    emit(event: "done", asset: lexcodes): boolean;
}



export class auth extends EventEmitter {
    token: MStoken;
    constructor(prompt?: prompt)
    constructor(token: MStoken)
    constructor(token?: MStoken | prompt) {
        super();
        this.token = (!token || typeof token == "string") ? mojangAuthToken(token as prompt) : token;
    }
    createLink() {
        return (
            "https://login.live.com/oauth20_authorize.srf" +
            "?client_id=" +
            this.token.client_id +
            "&response_type=code" +
            "&redirect_uri=" + encodeURIComponent(this.token.redirect) +
            "&scope=XboxLive.signin%20offline_access" +
            (this.token.prompt ? "&prompt=" + this.token.prompt : "")
        );
    }
    load(code: lexcodes) {
        this.emit("load", code);
    }
    login(code: string) {
        const body = (
            "client_id=" + this.token.client_id +
            (this.token.clientSecret ? "&client_secret=" + this.token.clientSecret : "") +
            "&code=" + code +
            "&grant_type=authorization_code" +
            "&redirect_uri=" + this.token.redirect)
        return this._get(body);
    }
    refresh(MS: msAuthToken): Promise< infXbox>
    refresh(refreshToken: string): Promise<infXbox>
    refresh(MS: msAuthToken | string) {
        const refresh = typeof MS == 'string' ? MS : MS.refresh_token;
        const body = (
            "client_id=" + this.token.client_id +
            (this.token.clientSecret ? "&client_secret=" + this.token.clientSecret : "") +
            "&refresh_token=" + refresh +
            "&grant_type=refresh_token")
        return this._get(body)
    }

    async luanch(framework: framework, windowProperties?: windowProperties) {
        switch (framework) {
            case "raw":
                return await this.login(await (require("./gui/raw.js")).default(this, windowProperties))
        }
    }

    private async _get(body: string): Promise<infXbox> {
        this.load('load.auth.microsoft')
        var MS_Raw = await fetch("https://login.live.com/oauth20_token.srf", {
            method: "post", body: body, headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        if (!MS_Raw.ok) new exception("error.auth.microsoft", { response: MS_Raw })

        var MS = await MS_Raw.json();
        this.load('load.auth.xboxLive.1')
        var rxboxlive = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
            method: "post",
            body: JSON.stringify({
                Properties: {
                    AuthMethod: "RPS",
                    SiteName: "user.auth.xboxlive.com",
                    RpsTicket: `d=${MS.access_token}` // your access token from step 2 here
                },
                RelyingParty: "http://auth.xboxlive.com",
                TokenType: "JWT"
            }),
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        if (!rxboxlive.ok) new exception("error.auth.xboxLive", { response: MS_Raw });
        var token = await rxboxlive.json();
        return new (require("./endpoints.js").default)(this, MS, token);
    }
}
export default auth;


