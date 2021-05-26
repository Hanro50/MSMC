
/*Copyright 2021 Hanro50

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

End license text.*/
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
    redirect: string
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

 enum updateTypes {
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
    data?: string, // Some information about the call. Like the component that's loading or the cause of the error. 
    response?: Response, //used by the rejection type
    percent?: number // Used to show how far along the object is in terms of loading
}


//This could be running in a hybrid browser context (NW.js) or node context (Electron)
function FETCHGet() {
    if (typeof fetch === "function") {
        //hybrid browser context
        return fetch;
    } else {
        try {
            //node context (Electron)
            return require("node-fetch")
        } catch {
            //And the user no longer has a required dependency - If someone wants to. I'd be open for a wrapper to work with request.js 

            console.error("No version of fetch is a available in this enviroment!")
        }
    }
}
/** We need an http server of some description to get the callback */
import {Server,createServer} from 'http';
const FETCH = FETCHGet();
/**
 * @param {URLSearchParams} Params 
 * @returns 
 */
async function MSCallBack(Params: URLSearchParams, token : MSToken, callback : (info:callback)=>void, updates: (info: update) => void = () => { }) {
    
    updates({ type: updateTypes.Starting });
    const code = Params.get('code');
    console.log(Params); //debug
    var percent = 100 / 8;
    function loadBar(number : number, asset : string) {
        updates({ type: updateTypes.Loading, data: asset, percent: number })
    }

    function error(reason : string) {
        updates({ type: updateTypes.Error, data: reason })
    }

    function webCheck(response : Response) {
        if (response.status > 400) {
            updates({ type: updateTypes.Rejection, response: response })
        }
    }

    loadBar(percent * 1, "Getting Login Token")
    var MS = await (await FETCH("https://login.live.com/oauth20_token.srf", {
        method: "post", body:
            "client_id=" + token.client_id +
            "&code=" + code +
            "&grant_type=authorization_code" +
            "&redirect_uri=" + token.redirect +
            (token.clientSecret ? "&client_secret=" + token.clientSecret : "")
        , headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })).json();
    console.log(MS); //debug
    webCheck(MS);

    loadBar(percent * 2, "Logging into Xbox Live")
    var rxboxlive = await FETCH("https://user.auth.xboxlive.com/user/authenticate", {
        method: "post", body:
            JSON.stringify({
                "Properties": {
                    "AuthMethod": "RPS",
                    "SiteName": "user.auth.xboxlive.com",
                    "RpsTicket": "d=" + MS.access_token // your access token from step 2 here
                },
                "RelyingParty": "http://auth.xboxlive.com",
                "TokenType": "JWT"
            })
        , headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
    })
    console.log(rxboxlive); //debug
    webCheck(rxboxlive);
    var xboxtoken = await (rxboxlive).json();

    console.log(token); //debug

    var XBLToken = xboxtoken.Token;
    var UserHash = xboxtoken.DisplayClaims.xui[0].uhs;
    loadBar(percent * 3, "Getting a Xbox One Security Token")
    var rxsts = await FETCH("https://xsts.auth.xboxlive.com/xsts/authorize", {
        method: "post", body:
            JSON.stringify({
                "Properties": {
                    "SandboxId": "RETAIL",
                    "UserTokens": [
                        XBLToken // from above
                    ]
                },
                "RelyingParty": "rp://api.minecraftservices.com/",
                "TokenType": "JWT"
            })
        , headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
    })

    webCheck(rxsts);
    console.log(rxsts) //debug
    var XSTS = await (rxsts).json();

    console.log(XSTS);
    loadBar(percent * 4, "Checking for errors")

    if (XSTS.XErr) {
        var reason = "Unknown reason"
        switch (XSTS.XErr) {
            case "2148916233": {
                reason = "The account doesn't have an Xbox account."; break;
            }
            case "2148916238": {
                reason = "The account is a child (under 18) and cannot proceed unless the account is added to a Family by an adult (FIX ME: This error should in theory never happen if the launcher's oauth token is set up correctly)"; break;
            }
        }
        return error(reason);
    }

    loadBar(percent * 5, "Logging into Minecraft")
    var rlogin_with_xbox = await FETCH("https://api.minecraftservices.com/authentication/login_with_xbox", {
        method: "post", body:
            JSON.stringify({
                "identityToken": "XBL3.0 x=" + UserHash + ";" + XSTS.Token
            })
        , headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
    })
    webCheck(rlogin_with_xbox);

    loadBar(percent * 6, "Checking game ownership")
    var MCauth = await rlogin_with_xbox.json();
    console.log(MCauth) //debug
    var rmcstore = await FETCH("https://api.minecraftservices.com/entitlements/mcstore", {
        headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': "Bearer " + MCauth.access_token }
    })

    var MCPurchaseCheck = await rmcstore.json();
    console.log(MCPurchaseCheck) //debug
    if (MCPurchaseCheck.items.length < 1) {
        return error("You do not seem to own minecraft.");
    }

    loadBar(percent * 7, "Fetching player profile");
    var r998 = await FETCH("https://api.minecraftservices.com/minecraft/profile", {
        headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': "Bearer " + MCauth.access_token }
    })

    var profile = await r998.json();
    console.log(profile) //debug
    if (profile.error) {
        return error("You do not seem to have a minecraft account.");
    }

    loadBar(100, "Done!");
    callback({ access_token: MCauth.access_token, profile: profile });
}

//This needs to be apart or we could end up with a memory leak!
var app: Server;
/** 
* @param {(URLCallback:URLSearchParams,App:any)=>void} callback
* This is needed for the oauth 2 callback
*/
function setCallback(callback: (URL: URLSearchParams, serv: Server) => void) {
    try {
        if (app) {
            app.close();
        }
    } catch { }
    app = createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Thank you!');
        app.close();
        console.log(req.url);
        console.log(req.url.substr(req.url.indexOf("?") + 1))
        if (req.url.includes("?")) {
            const urlParams = new URLSearchParams(req.url.substr(req.url.indexOf("?") + 1));
            callback(urlParams, app);
        }

    });
    return app.listen();
}




/**
 * @param token Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect (Do not include http://localhost:<port>/ as that's added for you!)
 * @param callback The callback that is fired on a successful login. It contains a mojang access token and a user profile
 * @param updates A callback that one can hook into to get updates on the login process
 * @returns The URL needed to log in your user. You need to send this to a web browser or something similar to that!
 */
import {AddressInfo} from "net";
export function MSLogin(token: MSToken, callback: (info: callback) => void, updates?: (info: update) => void): Promise<string> {

    setCallback((Params: URLSearchParams) => MSCallBack(Params, token, callback, updates))
    return new Promise(
        resolve => app.addListener('listening',
            () => {
                var address = app.address() as AddressInfo;
                token.redirect = "http%3A%2F%2Flocalhost%3A" + (address.port) + "%2F" + (token.redirect ? encodeURIComponent(token.redirect) : "");
                resolve(
                    "https://login.live.com/oauth20_authorize.srf" +
                    "?client_id=" + token.client_id +
                    "&response_type=code" +
                    "&redirect_uri=" + token.redirect +
                    "&scope=XboxLive.signin%20offline_access"
                )
            }
        )
    )
}
