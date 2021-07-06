/**
 * For more information. Check out Microsoft's support page: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code <br>
 * 
 * Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the FastLaunch or Launch functions under either Electron or NW.js
 */
export type prompt = "login" | "none" | "consent" | "select_account";


export type framework = "electron" | "nwjs";
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
 * This app does not allow you to set the port manually, due to the extreme risk of unforseen bugs popping up. 
 * 
 * 3) If you set the ridirect to, for example, "http://localhost/Rainbow/Puppy/Unicorns/hl3/confirmed" then the variable {redirect} needs to equal "Rainbow/Puppy/Unicorns/hl3/confirmed".
 * 
 * 4) Basically the redirect field is equal to your redirect URL you gave microsoft without the "http://localhost/" part. 
 * Please keep this in mind or you'll get weird errors as a mismatch here will still work...sort of. 
 */
export interface MSToken {
    client_id: string,
    clientSecret?: string,
    redirect?: string,
    prompt?: prompt
}

/**A version of a mincraft profile you'd get from the auth end points */
export interface profile {
    id: string, name: string, skins?: [], capes?: []
}

/**The callback given on a successful login!*/
export interface callback {
    "access_token": string, //Your classic Mojang auth token. You can do anything with this that you could do with the normal MC login token 
    profile: profile //Player profile. Similar to the one you'd normaly get with the mojang login
}

/**The object returned to give you information about how the login process is progressing */
export interface update {
    /**
     * Loading: This gives input with regards to how far along the login process is. <br>
     * Rejection: This is given with a fetch error. You are given the fetch item as a data object. <br>
     * Error: This is given with a normal MC account error and will give you some user readable feedback. <br>
     * Starting: This is fired once when the whole loading process is started. This is mainly for setting up loading bars and stuff like that. <br>
     * Cancelled: When the user closes out of a popup (Electron / NV.js only)
     */
    type: "Loading" | "Rejection" | "Error" | "Starting" | "Cancelled",
    /**Some information about the call. Like the component that's loading or the cause of the error. */
    data?: string,
    /**Used by the rejection type.*/
    response?: Response,
    /**Used to show how far along the object is in terms of loading*/
    percent?: number
}
/**
 * Used by grathical Electron and NW.js intergrations to set the properties of the generated popup
 */
export interface WindowsProperties {
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
 * Note that this function is called internally after the redirect has been formated. Aka after "http://localhost:\<port\>/" is appended to the redirect. <br>
 * This is done to allow us to create the "FastLaunch" methods which don't rely on an internal http server<br>
 *
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect;
 */
export declare function createLink(token: MSToken): String;

/**
 * @param code The code gotten from a successful login 
 * @param MStoken The MS token object 
 * @param callback The callback that is fired on a successful login. It contains a mojang access token and a user profile
 * @param updates A callback that one can hook into to get updates on the login process
 */
export declare function authenticate(code: string, MStoken: MSToken, callback: (info: callback) => void, updates?: (info: update) => void): Promise<void>;

/**
 * @param profile Player profile. Similar to the one you'd normaly get with the mojang login
 * @param callback The callback that is fired on a successful login. It contains a mojang access token and a user profile
 * @param updates A callback that one can hook into to get updates on the login process
 * @param MStoken The MS token object (Optional, will use the vanilla client token if it doesn't have anything)
 */
export declare function refresh(profile: profile, callback: (info: callback) => void, updates?: (info: update) => void, authToken?: MSToken): Promise<void>;

/**
 * Checks if a profile object is still valid
 * @param profile Player profile. Similar to the one you'd normaly get with the mojang login
 */
export declare function validate(profile: profile): Boolean;

/**
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect (Do not include http://localhost:<port>/ as that's added for you!)
 * @param callback The callback that is fired on a successful login. It contains a mojang access token and a user profile
 * @param updates A callback that one can hook into to get updates on the login process
 * @returns The URL needed to log in your user. You need to send this to a web browser or something similar to that!
 */
export declare function login(token: MSToken, callback: (info: callback) => void, updates?: (info: update) => void): Promise<string>;

export declare function luanch(type: framework, token: MSToken, callback: (info: callback) => void, updates?: (info: update) => void, properties?: WindowsProperties): void;

export declare function fastLuanch(type: framework, callback: (info: callback) => void, updates?: (info: update) => void, prompt?: prompt, properties?: WindowsProperties): void;

/**Use with electron to get a electron version of fast launch 
 * @deprecated
*/
export declare function getElectron(): {
    Launch: (token: MSToken, callback: (info: callback) => void, updates?: (info: update) => void, properties?: WindowsProperties) => void
    FastLaunch: (callback: (info: callback) => void, updates?: (info: update) => void, prompt?: prompt, properties?: WindowsProperties) => void
};
/**Use with NW.js to get a electron version of fast launch 
 * @deprecated
*/

export declare function getNWjs(): {
    Launch: (token: MSToken, callback: (info: callback) => void, updates?: (info: update) => void, properties?: WindowsProperties) => void
    FastLaunch: (callback: (info: callback) => void, updates?: (info: update) => void, prompt?: prompt, properties?: WindowsProperties) => void
};

/**Used with the Minecraft Launcher core library, special thanks for Luuxis */
export declare function getMCLC(): {
    getAuth: (info: callback) => Promise<any>

    validate: (profile: {
        access_token: string;
        client_token?: string;
        uuid?: string;
        name?: string;
        user_properties?: Partial<any>;
    }) => Promise<Boolean>

    refresh: (profile: {
        access_token: string;
        client_token?: string;
        uuid?: string;
        name?: string;
        user_properties?: Partial<any>;
    }) => Promise<any>
};

/**
 * ES 6 compatibility for typescript
 * These lines of code where a royal pain in the behind to get working.
 */
import * as module from '.';
export default module;