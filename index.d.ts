/**
 * For more information. Check out Microsoft's support page: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code <br>
 * 
 * Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the fastLaunch or launch functions under either Electron or NW.js
 */
export type prompt = "login" | "none" | "consent" | "select_account";

export type framework = "electron" | "nwjs" | "raw";
/**
 * The Oauth2 details needed to log you in. 
 * 
 * Resources
 * 1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
 * 2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
 * 3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
 * 
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
export interface token {
    client_id: string,
    clientSecret?: string,
    redirect?: string,
    prompt?: prompt
}

/**A version of a Minecraft profile you'd get from the auth end points */
export interface profile {
    id: string, name: string, skins?: [], capes?: []
}
/**The return object that all the async login procedures return */
export interface result {
    type: "Success" | "DemoUser" | "Authentication" | "Cancelled" | "Unknown"
    /**Only returned when the user has logged in via microsoft */
    "access_token"?: string, //Your classic Mojang auth token. 
    /**Only returned on a successful login and if the player owns the game*/
    profile?: profile, //Player profile. Similar to the one you'd normally get with the Mojang login
    /**Used with the error types*/
    reason?: string,
    /**Used when there was a fetch rejection.*/
    data?: Response,
}

/**The object returned to give you information about how the login process is progressing */
export interface update {
    /**
     * Loading: This gives input with regards to how far along the login process is. <br>
     * Rejection: This is given with a fetch error. You are given the fetch item as a data object. <br>
     * Error: This is given with a normal Minecraft account error and will give you some user readable feedback. <br>
     * Starting: This is fired once when the whole loading process is started. This is mainly for setting up loading bars and stuff like that. <br>
     * Cancelled: When the user closes out of a pop-up (Electron / NW.js only)
     */
    type: "Loading" | "Error" | "Starting",
    /**Some information about the call. Like the component that's loading or the cause of the error. */
    data?: string,
    /**Used by the rejection type.*/
    response?: Response,
    /**Used to show how far along the object is in terms of loading*/
    percent?: number
}
/**
 * Used by graphical Electron and NW.js integrations to set the properties of the generated pop-up
 */
export interface windowProperties {
    width: number,
    height: number,
    resizable?: boolean,
    [key: string]: any
}

/**
 * An override to manually define which version of fetch should be used 
 * @param fetchIn A version of fetch 
 */
export declare function setFetch(fetchIn: any): void;

/** 
 * This function will create a login link based on the inputs provided. <br>
 * Note that this function is called internally after the redirect has been formatted. Aka after "http://localhost:\<port\>/" is appended to the redirect. <br>
 * This is done to allow us to create the "fastLaunch" methods which don't rely on an internal http server<br>
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect;
 * @returns A link you can plug into a web browser to send a user to a ms login page
*/
export declare function createLink(token: token): String;

/**
 * This function will create a login link based on the inputs provided. <br>
 * This method assumes you're planning on using Mojang's endpoints
 * @param prompt See the type definition for "prompt" for more information
 * @returns A link you can plug into a web browser to send a user to a ms login page
 */
export declare function createLink(prompt: prompt): String;
/**
 * Used when you want to implement your own login code, but still want MSMC to handle authentication for you. 
 * @param code The code gotten from a successful login 
 * @param MStoken The Microsoft token object used to obtain the login code 
 * @param updates A callback that one can hook into to get updates on the login process
 * @returns A promise that will grant you a user profile and Mojang login token
 */
export declare function authenticate(code: string, MStoken: token, updates?: (info: update) => void): Promise<result>;

/**
 * Used to refresh login tokens. It is recommended to do this at start up after calling validate to check if the client token needs a refresh
 * @param profile Player profile. Similar to the one you'd normally get with the Mojang login
 * @param updates A callback that one can hook into to get updates on the login process
 * @param MStoken Microsoft token object used to obtain the login code  (Optional, will use the vanilla client token if it doesn't have anything)
 * @returns A promise that will grant you an updated user profile and Mojang login token
 */
export declare function refresh(profile: profile, updates?: (info: update) => void, MStoken?: token): Promise<result>;

/**
 * Checks if a profile object is still valid
 * @param profile Player profile. Similar to the one you'd normaly get with the Mojang login
 * @return Returns a boolean stating whether a set account is still valid
*/
export declare function validate(profile: profile): Boolean;

/**
 * A generic login method. Useful if you aren't using electron or NW.js and want to make a terminal launcher or are using an unsupported framework
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect (Do not include http://localhost:<port>/ as that's added for you!)
 * @param callback The URL needed to log in your user will be handled by the function you provide here. I recommend you send it off to a web browser or something similar
 * @param updates A callback that one can hook into to get updates on the login process
 * @returns A promise that will grant you a user profile and Mojang login token
 */
export declare function login(token: token, callback: (info: string) => void, updates?: (info: update) => void): Promise<result>;
/**
 * Used with electron or nwjs to launch a pop-up that a user can use to sign in with
 * @param type The GUI framework this is compatible with
 * @param token Basic MS token info
 * @param updates A callback that one can hook into to get updates on the login process
 * @param properties See windowProperties interface for more information
 * @returns A promise that will grant you a user profile and Mojang login token
 */
export declare function launch(type: framework, token: token, updates?: (info: update) => void, properties?: windowProperties): Promise<result>;

/**
 * Memics the vanilla launcher in how it works. Like launch in creates a popup a user can log in with
 * @param type The GUI framework this is compatible with
 * @param updates A callback that one can hook into to get updates on the login process
 * @param prompt See the type definition for "prompt" for more information
 * @param properties See windowProperties interface for more information
 * @returns A promise that will grant you a user profile and Mojang login token
 */
export declare function fastLaunch(type: framework, updates?: (info: update) => void, prompt?: prompt, properties?: windowProperties): Promise<result>;
/**
 * A copy of the user object mclc uses
 */
export type mclcUser = {
    access_token: string;
    client_token?: string;
    uuid?: string;
    name?: string;
    user_properties?: Partial<any>;
}

/**Used with the Minecraft Launcher core library, special thanks for Luuxis */
export declare function getMCLC(): {
    getAuth: (info: result) => Promise<mclcUser>
    validate: (profile: mclcUser) => Promise<Boolean>
    refresh: (profile: mclcUser) => Promise<mclcUser>
}

/**Checks if a return value is valid */
export declare function errorCheck(result: result): Boolean;

/**
 * @deprecated Will be removed by version 2.4.0 
 */
export declare function loadLegacy(): void;

/**
 * ES 6 compatibility for typescript
 * These lines of code where a royal pain in the behind to get working.
 */
import * as module from '.';
export default module;
