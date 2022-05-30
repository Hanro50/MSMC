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
At the moment you can get support via Discord (link above).

<h1>UNDER CONSTRUCTION; 4.0.0 is still in an alpha state!</h1>

# Examples
These are in an unfinished state 
## A basic ES6 example with [MCLC](https://github.com/Pierce01/MinecraftLauncher-core)
```js
import msmc, { wrapError } from "msmc";
import { Client, Authenticator } from "minecraft-launcher-core";
const launcher = new Client();//We're simple setting up mclc here...
const auth = new msmc.auth(); //Spawn a new auth object using mojang's token


auth.on('load', console.log) //read load events into the console 
try{
    const xbx = await  auth.luanch('raw')//In the example we use raw, but you can replace the word raw with electron or nwjs if you're using either of the two
    const mc = await xbx.getMinecraft()//Lets get the information we need to launch minecraft

    // Pulled from the Minecraft Launcher core docs.
    let opts = {
        clientPackage: null,
        // Simply call this function to convert the msmc minecraft object into a mclc authorization object
        authorization: mc.mclc(),
        root: "./minecraft",
        version: {
            number: "1.18.2",
            type: "release"
        },
        memory: {
            max: "6G",
            min: "4G"
        }
    }
    console.log("Starting!")
    launcher.launch(opts);

    launcher.on('debug', (e) => console.log(e));
    launcher.on('data', (e) => console.log(e));
}catch(e){
  console.log(wrapError(e)) // The wrap error function is here to convert an msmc error into something we can decode. 
}

```



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
This version of the constructor will generate an auth object with the vanilla Minecraft launcher token. The prompt variable is a string that provides the prompt field in the vanilla token as that is not provided by default. 

```ts
type prompt = "login" | "none" | "consent" | "select_account";
```

To learn more about the prompt type, check out <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code">Microsoft's support page</a>. It will provide more details for the possible value of this field. 
>### `constructor(token: MStoken)` \<advanced>
This version of the constructor is for use with custom Microsoft tokens. 
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
Creates a login link using the given Token. Can be used if you're forgoing msmc's default gui based login flow for something custom. In essence you should use this link as a redirect, then capture the returning code url-parameter and feed it into the login function 
>### `login(code: string): Promise<xbox>` \<advance>
The low level login function msmc uses. The returning promise is for the next stage in the login chain. Mainly the xbox module. I'd refer you to the next module to learn more! 

returns an instance of the [xbox](#xbox) module or throws an error
>### `refresh(MS: msAuthToken): Promise<xbox>`
The low level refresh function msmc uses. This will attempt to refresh the Microsoft token at the core of msmc and return an xbox object as a result. Please see the msToken variable under the xbox module.
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
Refreshes a user solely based on the refresh token of a set user's refresh_token. See the [save](#save-string) function in the [xbox](#xbox) for more information.

returns an instance of the [xbox](#xbox) module or throws an error

>### ` luanch(framework: framework, windowProperties?: windowProperties): Promise<xbox>`
Launches a pop-up window prompting the user to login to their Microsoft account. 
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
This is the properties msmc passes through to the function of a set framework that spawns a pop-up. For more information of which properties are available depending on your preferred GUI framework of choice. Click <a href="https://nwjs.readthedocs.io/en/latest/References/Window/#windowopenurl-options-callback">here</a> for nwjs and <a href="https://www.electronjs.org/docs/latest/api/browser-window#class-browserwindow">here</a> for electron. The raw framework only uses the properties "width","height" and "suppress"

returns an instance of the [xbox](#xbox) module or throws an error

> ### `server(port?: number): Promise<void>` \<placeholder>
WIP, not implemented yet

returns an instance of the [xbox](#xbox) module or throws an error
> ### `on(event: "load", listener: (asset: lexcodes, message: string) => void): this`
Event handler. Fires on a load event. Can be used for loading indicators similar to the update function in previous versions on msmc. 
> ### `once(event: "load", listener: (asset: lexcodes, message: string) => void): this`
The same as the "on" function, but only fires once. 
<hr>

## xbox
The second stage of the authentication phase. In this phase the user has been logged in with their Microsoft account, but they haven't been logged into Minecraft nor have they been authenticated to the degree needed to access social features yet. This being said, you now potentially have the ability to do both if you have made it this far. 

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
The auth object that was used to create this Xbox object.
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
The time in milliseconds the provided tokens are valid till. If this date is surpassed it can be assumed the provided tokens need to be refreshed. 

> ### `xAuth(RelyingParty?: string): Promise<string>` \<advanced>
Retrieves the auth header for a set replying party. In theory it could be expanded to be used with more services that work with Xbox live endpoints. Right now this is mainly an internal function that happens to be exposed
> ### `refresh(force?: boolean): Promise<this>`
Refreshes the tokens of this Xbox object. This function should be called once per hour. This being said, msmc does check if the tokens need to be refreshed before refreshing them. The exception being when the "force" property is set to true. In that case it will force all tokens to be refreshed.
> ### `getSocial(): Promise<social>`
Gets an instance of the [social](#social) module. Can be used to implement friend lists. 
> ### `getMinecraft(): Promise<minecraft>`
Gets an instance of the [Minecraft](#minecraft) module. Can be used to obtain the needed information to launch Minecraft. 

NB: There is an additional internal check that will be done to determine if a user got Minecraft Java edition via game pass. This is experimental at the moment so please report any issues you observe with this. It may also not function with older versions of the game just yet. 
> ### `validate(): boolean`
Checks if the internal tokens in this object are still valid and usable. If this returns false then it is a good idea to call the [refresh](#refreshforce-boolean-promisethis) function listed earlier (This also gets called by that funtion btw). 
> ### `save(): string`
Returns a token that can be fed into a [refresh](#refreshrefreshtoken-string-promisexbox) function in an instance of the auth module. Useful if you want to save the information needed to recreate a set Xbox object to file. 
<hr>

## minecraft
The module needed to obtain the information required to launch Minecraft.
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
    skins: Array<{
        id: string,
        state: 'ACTIVE',
        url: string,
        variant: 'SLIM' | 'CLASSIC'
    }>,
    capes: Array<{
        id: string,
        state: 'ACTIVE',
        url: string,
        alias: string
    }>,
    demo?: boolean
}

profile: mcProfile;
```
The raw Minecraft profile object. Do note that the skins and capes arrays may be empty. Generally this contains everything you need to launch Minecraft. 

```ts
parent: xbox;
```
The [xbox](#xbox) object that spawned this instance of the Minecraft module.
```ts
xuid: string;
```
The xuid of the Xbox user id of the logged in user. 
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
Like the Like the [validate](#validate-boolean) function in the [xbox](#xbox) module, but just for the Minecraft token. Which remains valid for 24 hours
<hr>

## social
The social module is unique. Partly because it is expected to be ran server side in some settings. This is done to allow for features such as allowing you to create screens where players may be able to see which of their friends are online and such. 

If you have deeper access to the game, such as in the scenario where your launcher is a front end for some type of custom client. Then I foresee the possibility of even implementing a kind of "click to join" function. In the end this is merely here to serve as a bases for something substantially more complex that is beyond the scope of msmc.

```ts
class social {
    auth: string;
    constructor(auth: string);
    getProfile(xuid?: string): Promise<xplayer>;
    getFriends(xuid?: string): Promise<xplayer[]>;
    xGet(enpoint: string, xuid?: string): Promise<any>;
}
```
> ### `class xplayer`
```ts
class xplayer {
    auth: social;
    score: number;
    xuid: string;
    gamerTag: string;
    name: string;
    profilePictureURL: string;
    getFriends(): Promise<xplayer[]>;
}
```
auth=> The instance of the [social](#social) module that spawned this xplayer object<br>
score=> The user's player score....not sure what it does, but the endpoint provides it<br>
xuid=>The xbox user id of the player this instance of xplayer represents.<br>
gamerTag=>The gamer tag of the user this instance of xplayer represents.<br>
name=>The name of the user this instance of xplayer represents.<br>
profilePictureURL=>The profile picture url of the user this instance of xplayer represents.<br>
getFriends=>This function returns a list of xplayer modules that represents everyone on a give user's friend list. 

> ### `constructor(auth: string)` \<advance>
The auth header is needed to use the underlying endpoints that make this function. To get this header, run [xAuth](#xauthrelyingparty-string-promisestring-advanced) function in the [xbox](#xbox) module. This header can potentially be sent as an authentication string for an endpoint of your launcher's back end server.

> ### `getProfile(xuid?: string): Promise<xplayer>`
Gets the user profile of a given user. If the xuid field is missing it will return the profile of the user the auth header belongs to.

> ### `getFriends(xuid?: string): Promise<xplayer[]>`
Gets the friend list of a given user. If the xuid field is missing it will return the friend list of the user the auth header belongs to.

> ### `xGet(enpoint: string, xuid?: string): Promise<any>` \<advance>
The raw back end function used to obtain information related to a given user based on the xuid provided. If a xuid is not provided the information returned will instead be based on the profile the auth header belongs to. 
<hr>

## assets
A collection of helper functions to aid in using msmc.

> ### Languages and you
See our premade [lexipacks here](/lexipacks) and see the [loadLexiPack](#function-loadlexipackfile-string-typeof-lexicon) function for more information on how to load it. 

I've noticed that a fair amount of the people in the mcjs café discord tend to maintain launchers that by default aren't set to English. While older versions of msmc made efforts to address this. I'm happy to announce that we switched over to a solution that isn't just hacked onto existing code this time. 

Introducing the lexicon property. By overriding this object with your own code you can effectively localize MSMC without essentially needing to hunt for every English piece of dialogue. Potential msmc language packs will only need to override this one property to translate the entirety of msmc's errors and load events to another language. 

#### `lexicon`
```ts
export let lexicon = {
    //Error
    "error": "An unknown error has occured",
    "error.auth": "An unknown authentication error has occured",
    "error.auth.microsoft": "Failed to login to Microsoft account",
    "error.auth.xboxLive": "Failed to login to Xbox Live",
    "error.auth.xsts": "Unknown error occured when attempting to optain an Xbox Live Security Token",
    "error.auth.xsts.userNotFound": "The given Microsoft account doesn't have an Xbox account",
    "error.auth.xsts.bannedCountry": "The given Microsoft account is from a country where Xbox live is not available",
    "error.auth.xsts.child": "The account is a child (under 18) and cannot proceed unless the account is added to a Family account by an adult",
    "error.auth.xsts.child.SK": "South Korean law: Go to the Xbox page and grant parental rights to continue logging in.",

    "error.auth.minecraft": "Unknown error occured when attempting to login to Minecraft",
    "error.auth.minecraft.login": "Failed to authenticate with Mojang with given Xbox account",
    "error.auth.minecraft.profile": "Failed to fetch minecraft profile",
    "error.auth.minecraft.entitlements": "Failed to fetch player entitlements",

    "error.gui": "An unknown gui framework error has occured",
    "error.gui.closed": "Gui closed by user",
    "error.gui.raw.noBrowser": "no chromium browser was set, cannot continue!",

    "error.state.invalid": "[Internal]: Method not implemented.",
    "error.state.invalid.gui": "[Internal]: Invalid gui framework.",
    "error.state.invalid.redirect": "[Internal]: The token must have a redirect starting with 'http://localhost/' for this function to work!",
    "error.state.invalid.electron": "[Internal]: It seems you're attempting to load electron on the frontend. A critical function is missing!",
    //Load events
    "load": "Generic load event",
    "load.auth": "Generic authentication load event",
    "load.auth.microsoft": "Logging into Microsoft account",
    "load.auth.xboxLive": "Logging into Xbox Live",
    "load.auth.xboxLive.1": "Logging into Xbox Live",
    "load.auth.xboxLive.2": "Authenticating with xbox live",
    "load.auth.xsts": "Generating Xbox Live Security Token",

    "load.auth.minecraft": "Generic Minecraft login flow event",
    "load.auth.minecraft.login": "Authenticating with Mojang's servers",
    "load.auth.minecraft.profile": "Fetching player profile",
    "load.auth.minecraft.gamepass": "[experimental!] Checking if a user has gamepass"
}
```
A note on implementation. If msmc updates and a new event gets added, say `load.auth.example.new`. If your translation supports `load.auth.example`, msmc will proceed to use the translation text you provided for that code if `load.auth.example.new` is not available. This is why `load` and `load.auth` still have translations provided even if they're not called directly by msmc. They're in essence fall backs. 

Note: if you want to translate the read me into another language. Then hit me up on the discord! 
#### `lst(lexcodes: lexcodes): any` 
```ts
function lst(lexcodes: lexcodes): any;
```
This function will translate lexcodes into readable text based on the [lexicon](#lexicon) object. 

#### `function loadLexiPack(...file: string[]): typeof lexicon;` 
Loads a set lexipack and returns it when it finishes loading it.  

Usage: 
```js
import {assets} from "msmc";
assets.loadLexiPack(path,to,lexipack,here);
```
> ### Error handling
Handling errors in msmc changed a little. Since we moved back to a throw on error model last seen when we moved to an async architecture. The issue of error typing has propped up again. If an msmc object throws an error. It will be in one of two formats. 
```ts
interface response{ response: Response, ts: lexcodes }
```
This is thrown when a fetch request errors out. The ts object will be the raw lexcode. The [lst](#lstlexcodes-lexcodes-any) function can translate the lexcodes into readable text for you. The response object is the response from the fetch object that caused the exception 

Otherwise only the raw lexcode will be thrown. You can use [lst](#lstlexcodes-lexcodes-any) to translate if for you, but msmc already ships with a function to handle all this for you. 

```ts
function wrapError(code: string | exptOpts | any): {
    name: lexcodes;
    opt?: {
        response: Response;
    };
    message: any;
};
```
This function will take errors thrown by msmc and wrap them up for you. The message will be the translated cause of the error. The opt field will contain the response object if the error was caused by a fetch operation and the name is the standard lexcode if you want to do some processing based on the lexcode of the error. 

# Build source 
Simply run in the root directory. 
```bash
npm run build
```