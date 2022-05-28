# MSMC
<a href="https://github.com/Hanro50/MSMC/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/msmc" alt="MIT license"/></a>
<a href="https://www.npmjs.com/package/msmc"><img src="https://img.shields.io/npm/v/msmc" alt="Version Number"/></a>
<a href="https://github.com/Hanro50/MSMC/"><img src="https://img.shields.io/github/stars/hanro50/msmc" alt="Github Stars"/></a>

> A bare bones login library for Minecraft based projects to authenticate individuals with a Microsoft account.

# Support
<div>
   <a href="https://discord.gg/3hM8H7nQMA">
   <img src="https://img.shields.io/discord/861839919655944213?logo=discord"
      alt="chat on Discord"></a>
</div>
At the momement you can get support via Discord (link above).

<h1>UNDER CONSTRUCTION; 4.0.0 is still in an alpha state!</h1>

# Modules 
## auth
This module is the starting point of msmc. It will be the first msmc object you create. It is also the object that'll handle all of msmc's events for you. Mainly the load event. 
```ts
class auth extends EventEmitter {
    token: MStoken;
    constructor(prompt?: prompt);
    constructor(token: MStoken);
    createLink(): string;
    login(code: string): Promise<xbox>;
    refresh(MS: msAuthToken): Promise<xbox>;
    refresh(refreshToken: string): Promise<xbox>;
    luanch(framework: framework, windowProperties?: windowProperties): Promise<xbox>;
    server(port?: number): Promise<void>;

    on(event: "load", listener: (asset: lexcodes, message: string) => void): this;
    once(event: "load", listener: (asset: lexcodes, message: string) => void): this;
}
```
>### `constructor(prompt?: prompt)`
This version of the constructor will generate an auth object with the vanilla minecraft launcher token. The prompt variable is a string that provides the prompt field in the vanilla token as that is not provided by default. 

```ts
type prompt = "login" | "none" | "consent" | "select_account";
```

To learn more about the prompt type, check out <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code">Microsoft's support page</a>. It will provide more details for the possible value of this field. 
>### `constructor(token: MStoken)` \<advanced>
This version of the constructor is for use with custom microsoft tokens.  
```ts
interface MStoken {
    client_id: string,
    redirect: string,
    clientSecret?: string,
    prompt?: prompt
}
```
The Oauth2 token details needed for you to log people in with Microsoft's service.  

Resources:
  1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
  2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
  3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
>### `createLink(): string` \<advance>
Creates a login link using the given Token. Can be used if you're forgoing MSMC's default gui based login flow for something custom. In essence you should use this link as a redirect, then capture the returning code url-parameter and feed it into the login function   
>### `login(code: string): Promise<xbox>` \<advance>
The low level login function msmc uses. The returning promise is for the next stage in the login chain. Mainly the xbox module. I'd refer you to the next module to learn more! 

returns an instance of the [xbox](#xbox) module or throws an error
>### `refresh(MS: msAuthToken): Promise<xbox>`
The low level refresh function msmc uses. This will attempt to refresh the microsoft token at the core of msmc and return an xbox object as a result. Please see the msToken variable under the xbox module.
```ts
interface msAuthToken {
    token_type: string,
    expires_in: number,
    scope: string,
    access_token: string,
    refresh_token: string,
    user_id: string,
    foci: string
}
```
The 'refresh_token' and the 'access_token' are the only two fields of note to this project.

returns an instance of the [xbox](#xbox) module or throws an error

>### `refresh(refreshToken: string): Promise<xbox>`
Refreshes a user solely based on the refresh token of a set user's refresh_token.  See the [save](#save-string) funtion in the [xbox](#xbox) for more information.

returns an instance of the [xbox](#xbox) module or throws an error

>### ` luanch(framework: framework, windowProperties?: windowProperties): Promise<xbox>`
Launches a popup window prompting the user to login to thier microsoft account. 
```ts
type framework = "electron" | "nwjs" | "raw";
```
The supported frameworks are <a title="Build cross-platform desktop apps with JavaScript, HTML, and CSS" src="https://www.electronjs.org/">electron</a>, <a title="NW.js (previously known as node-webkit) lets you call all Node.js modules directly from DOM and enables a new way of writing applications with all Web technologies." src="https://nwjs.io/">nwjs</a> and <a title="Uses a user's native (chromium based) browser. For example the new Microsoft edge. Can be used with launchers written purely in plain vanilla nodejs">raw</a>.  

```ts
interface windowProperties {
    width: number,
    height: number,
    /**Raw ignores this property!*/
    resizable?: boolean,
    /**Raw only: Stops MSMC from passing through the browser console log*/
    suppress?: boolean,
    [key: string]: any
}
```
This is the properties msmc passes through to the funtion of a set framework that spawns a popup. For more information of which properties are available depending on your prefered gui framework of choice. Click <a href="https://nwjs.readthedocs.io/en/latest/References/Window/#windowopenurl-options-callback">here</a> for nwjs and <a href="https://www.electronjs.org/docs/latest/api/browser-window#class-browserwindow">here</a> for electron. The raw framework only uses the properties "width","height" and "suppress"

returns an instance of the [xbox](#xbox) module or throws an error

> ### `server(port?: number): Promise<void>` \<placeholder>
WIP, not implemented yet

returns an instance of the [xbox](#xbox) module or throws an error
> ### `on(event: "load", listener: (asset: lexcodes, message: string) => void): this`
Event handler. Fires on a load event. Can be used for loading indicators similar to the update function in previous versions on msmc.  
> ### `once(event: "load", listener: (asset: lexcodes, message: string) => void): this`
The same as the "on" funtion, but only fires once. 
<hr>

## xbox
The second stage of the authentication phase. In this phase the user has been logged in with their Microsoft account, but they haven't been logged into minecraft nor have they been authenticated to the degree needed to access social features yet. This being said, you now potentially have the ability to do both if you have made it this far.  

Please see [auth](#auth) module for more information on how to spawn this object
```ts
class xbox {
    readonly parent: auth;
    readonly msToken: msAuthToken;
    readonly xblToken: xblAuthToken;
    readonly exp: number;

    xAuth(RelyingParty?: string): Promise<string>;
    refresh(force?: boolean): Promise<this>;
    getSocial(): Promise<social>;
    getMinecraft(): Promise<minecraft>;
    validate(): boolean;
    save(): string;
}
```
> ### properties \<advance>
```ts
parent: auth;
```
The auth object that was used to create this xbox object.
```ts
interface msAuthToken {
    token_type: string;
    expires_in: number;
    scope: string;
    access_token: string;
    refresh_token: string;
    user_id: string;
    foci: string;
}
msToken: msAuthToken;
```
This is the token that was generated when the user was logged into their Microsoft account.  
```ts
interface xblAuthToken {
    IssueInstant: string;
    NotAfter: string;
    Token: string;
    DisplayClaims: {
        xui: [{
            uhs: string;
        }];
    };
}

xblToken: xblAuthToken;
```
This is the token that was generated when msmc authenticated against a user's microsoft account to gain xbox live authentication access. 

```ts
exp: number;
```
The time in miliseconds the provided tokens are valid till. If this date is surpased it can be assumed the provided tokens need to be refreshed. 

> ### `xAuth(RelyingParty?: string): Promise<string>` \<advanced>
Retrieves the auth header for a set replying party. In theory it could be expanded to be used with more services that work with xbox live endpoints. Right now this is mainly an internal function that happens to be exposed
> ### `refresh(force?: boolean): Promise<this>`
Refreshes the tokens of this xbox object. This funtion should be called once per hour. This being said, msmc does check if the tokens need to be refreshed before refreshing them. The exception being when the "force" property is set to true. In that case it will force all tokens to be refreshed.
> ###  `getSocial(): Promise<social>`
Gets an instance of the [social](#social) module. Can be used to implement friendlists. 
> ### `getMinecraft(): Promise<minecraft>`
Gets an instance of the [Minecraft](#minecraft) module. Can be used to obtain the needed information to launch minecraft. 

NB: There is an aditional internal check that will be done to determine if a user got minecraft java edition via gamepass. This is experimental atm so please report any issues you observe with this. It may also not function with older versions of the game just yet.   
> ### `validate(): boolean`
Checks if the internal tokens in this object are still valid and usable. If this returns false then it is a good idea to call the [refresh](#refreshforce-boolean-promisethis) function listed earlier (This also gets called by that funtion btw). 
> ###  `save(): string`
Returns a token that can be fed into a [refresh](#refreshrefreshtoken-string-promisexbox) function in an instance of the auth module. Usefull if you want to save the information needed to recreate a set xbox object to file. 
<hr>

## minecraft
The module needed to obtain the information required to launch minecraft.
```ts
minecraft {
    mcToken: string;
    profile: mcProfile;
    parent: xbox;
    xuid: string;

    entitlements(): Promise<entitlements[]>;
    isDemo(): boolean;
    mclc(): mclcUser;
    refresh(force?: boolean): Promise<this>;
    validate(): boolean;
}
```
> ### properties \<advance>
```ts
mcToken: string;
```
The minecraft authentication token. This is needed to launch the game in online mode 
```ts
interface mcProfile {
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

profile: mcProfile;
```
The raw minecraft profile object. Do note that the skins and capes arrays may be empty. Generally this contains everything you need to launch minecraft. 

```ts
parent: xbox;
```
The [xbox](#xbox) object that spawned this instance of the minecraft module.
```ts
xuid: string;
```
The xuid of the xbox user id of the logged in user. 
> ### `entitlements(): Promise<entitlements[]>` 
Generates a list of mojang products/games a set user owns.
```ts
type entitlements = "game_minecraft" | "game_minecraft_bedrock" | "game_dungeons" | "product_minecraft" | "product_minecraft_bedrock" | "product_dungeons";
```
> ### `mclc(): mclcUser`
Creates a <a title="MCLC (Minecraft Launcher Core) is a NodeJS solution for launching modded and vanilla Minecraft without having to download and format everything yourself. Basically a core for your Electron or script based launchers." href="https://github.com/Pierce01/MinecraftLauncher-core">Mincraft Launcher core</a> user object. Usefull if you wish to use msmc with that library. 
> ### `refresh(force?: boolean): Promise<this>`
Refreshes the minecraft and xbox tokens. Like the [refresh](#refreshforce-boolean-promisethis) function in the [xbox](#xbox) module.
> ### `validate(): boolean`
Like the Like the [validate](#validate-boolean) function in the [xbox](#xbox) module, but just for the minecraft token. Which remains valid for 24 hours
<hr>

## social
The social module is unique. Partly because it is expected to be ran serverside in some settings. This is done to allow for features such as allowing you to create screens where players may be able to see which of their friends are online and such. 

If you have deeper access to the game, such as in the scenario where your launcher is a frontend for some type of custom client. Then I forsee the possiblity of even implementing a kind of "click to join" function. In the end this is merely here to surve as a bases for something substancially more complex that is beyond the scope of msmc.

```ts
class social {
    auth: string;
    constructor(auth: string);
    getProfile(xuid?: string): Promise<xplayer>;
    getFriends(xuid?: string): Promise<xplayer[]>;
    xGet(enpoint: string, xuid?: string): Promise<any>;
}
```
> ### `constructor(auth: string)`

> ### `getProfile(xuid?: string): Promise<xplayer>`

> ### `getFriends(xuid?: string): Promise<xplayer[]>`

> ### `xGet(enpoint: string, xuid?: string): Promise<any>` \<advance>
<hr>

## assets
A collection of helper functions to aid in using msmc.

