declare enum Prompt {
    /**will force the user to enter their credentials on that request, negating single-sign on. */
    login = "login",
    /**is the opposite - it will ensure that the user isn't presented with any interactive prompt whatsoever. If the request can't be completed silently via single-sign on, the Microsoft identity platform will return an interaction_required error.  */
    none = "none",
    /**will trigger the OAuth consent dialog after the user signs in, asking the user to grant permissions to the app.*/
    consent = "consent",
    /**will interrupt single sign-on providing account selection experience listing all the accounts either in session or any remembered account or an option to choose to use a different account altogether.*/
    select_account = "select_account"
}

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
interface MSToken {
    client_id: string,
    clientSecret?: string,
    redirect?: string,
    prompt?:Prompt
}

/**
 * The callback given on a successful login!
 */
interface callback {
    "access_token": string, //Your classic Mojang auth token. You can do anything with this that you could do with the normal MC login token 
    profile: { "id": string, "name": string, "skins": [], "capes": [] } //Player profile. Similar to the one you'd normaly get with the mojang login
}



/**
 * Update object. Used with the update callback to get some info on the login process
 * 
 * types: 
 * "Loading" 
 * This gives input with regards to how far along the login process is
 * 
 * "Rejection" 
 * This is given with a fetch error. You are given the fetch item as a data object.
 * 
 * "Error"
 * This is given with a normal MC account error and will give you some user readable feedback. 
 * 
 * "Starting"
 * This is fired once when the whole loading process is started. This is mainly for setting up loading bars and stuff like that
 */

declare enum updateTypes {
    /** This gives input with regards to how far along the login process is */
    Loading = "Loading",
    /** This is given with a fetch error. You are given the fetch item as a data object.  */
    Rejection = "Rejection",
    /**This is given with a normal MC account error and will give you some user readable feedback.  */
    Error = "Error",
    /**This is fired once when the whole loading process is started. This is mainly for setting up loading bars and stuff like that */
    Starting = "Starting"
}
interface update {
    type: updateTypes, // Either "Starting","Loading" , "Rejection" or "Error". 
    data: string, // Some information about the call. Like the component that's loading or the cause of the error. 
    response: Response, //used by the rejection type
    percent?: number // Used to show how far along the object is in terms of loading
}

/**
 * This is for window based applications
 */
interface WindowSettings {
    popup?: boolean, //Should the app try to generate a popup? (This might cause some irregular results. Electron blocks popups by default!)
    parent?: Window, //The main window object that will be manipulated (If blank then the global global.window object will be used!)
    closeAfter?: boolean //Should the window be closed afterwards? (Will be ignored if 'parent' is undefined!)
    trueRedirect?: boolean //The true redirect fired when the login procedure begins! ("will be ignored if closeAfter is true and 'parent' is defined")

}

/**
 * RECOMMENDED!!!!
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect (Do not include http://localhost:<port>/ as that's added for you!)
 * @param callback The callback that is fired on a successful login. It contains a mojang access token and a user profile
 * @param updates A callback that one can hook into to get updates on the login process
 * @returns The URL needed to log in your user. You need to send this to a web browser or something similar to that!
 */

export declare function MSLogin(token: MSToken, callback: (info: callback) => void, updates?: (info: update) => void): Promise<string>;
/**
 * EXPERIMENTAL!!
 * Notice: This function does not process the redirect you provide unlike the classic MSLogin function!!
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect 
 * @returns The URL needed to log in your user. You need to send this to a web browser or something similar to that!
 */
export declare function CreateLink(token: MSToken, ProcessRedirect: boolean): string;
/**
 * EXPERIMENTAL!!
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect (This should match the redirect you want 100%)
 * @param win see WindowSettings
 * @param callback The callback that is fired on a successful login. It contains a mojang access token and a user profile
 * @param updates A callback that one can hook into to get updates on the login process
 * @returns The URL needed to log in your user. You need to send this to a web browser or something similar to that!
 */

export declare function WindowLogin(token: MSToken, win: WindowSettings, callback: (info: callback) => void, updates?: (info: update) => void): void;


/**
 * EXPERIMENTAL!!
 * This is the same as WindowLogin, but it uses the native mojang login!
 * @param win see WindowSettings
 * @param callback The callback that is fired on a successful login. It contains a mojang access token and a user profile
 * @param updates A callback that one can hook into to get updates on the login process
 */
export declare function FastLaunch(win: WindowSettings, callback: (info: callback) => void, updates?: (info: update) => void, prompt?:Prompt): void;