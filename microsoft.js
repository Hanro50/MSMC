
/*Copyright 2021 Hanro50

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

End license text.*/


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
            try {
                return ("electron-fetch");
            } catch {
                //And the user no longer has a required dependency - If someone wants to. I'd be open for a wrapper to work with request.js 
                console.error("No version of fetch is a available in this enviroment!")
                console.error("Possible packages to fill this dependency are 'electron-fetch' and 'node-fetch' (Recommended) ")
            }
        }
    }
}

const FETCH = FETCHGet();
/**
 * @param {URLSearchParams} Params 
 * @returns 
 */
async function MSCallBack(Params, token, callback, updates = () => { }) {
    updates({ type: "Starting" });
    const code = Params.get('code');
    //console.log(Params); //debug
    var percent = 100 / 8;
    function loadBar(number, asset) {
        updates({ type: "Loading", data: asset, percent: number })
    }

    function error(reason) {
        updates({ type: "Error", data: reason })
    }

    function webCheck(response) {
        if (response.status > 400) {
            updates({ type: "Rejection", response: response })
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
    //console.log(MS); //debug
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
    //console.log(rxboxlive); //debug
    webCheck(rxboxlive);
    var token = await (rxboxlive).json();

    //console.log(token); //debug

    var XBLToken = token.Token;
    var UserHash = token.DisplayClaims.xui[0].uhs;
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
    //console.log(rxsts) //debug
    var XSTS = await (rxsts).json();

    //console.log(XSTS);
    loadBar(percent * 4, "Checking for errors")

    if (XSTS.XErr) {
        var reason = "Unknown reason"
        switch (XSTS.XErr) {
            case "2148916233": {
                reason = "The account doesn't have an Xbox account."; break;
            }
            case "2148916238": {
                reason = "The account is a child (under 18) and cannot proceed unless the account is added to a Family by an adult. (FIX ME: This error should in theory never happen if the launcher's oauth token is set up correctly)"; break;
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
    //console.log(MCauth) //debug
    var rmcstore = await FETCH("https://api.minecraftservices.com/entitlements/mcstore", {
        headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': "Bearer " + MCauth.access_token }
    })

    var MCPurchaseCheck = await rmcstore.json();
    //console.log(MCPurchaseCheck) //debug
    if (MCPurchaseCheck.items.length < 1) {
        return error("You do not seem to own minecraft.");
    }

    loadBar(percent * 7, "Fetching player profile");
    var r998 = await FETCH("https://api.minecraftservices.com/minecraft/profile", {
        headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': "Bearer " + MCauth.access_token }
    })

    var profile = await r998.json();
    //console.log(profile) //debug
    if (profile.error) {
        return error("You do not seem to have a minecraft account.");
    }

    loadBar(100, "Done!");
    callback({ access_token: MCauth.access_token, profile: profile });
}

//This needs to be apart or we could end up with a memory leak!
var app;
/** 
* @param {(URLCallback:URLSearchParams,App:any)=>void} callback
* This is needed for the oauth 2 callback
*/
function setCallback(callback) {
    var http
    try {
        /** We need an http server of some description to get the callback */
        http = require('http');
    } catch {
        console.error("Dependency error! I need to spin up an http server for this method!")
        return;
    }
    try {
        if (app) {
            app.close();
        }
    } catch { }
    app = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Thank you!');
        app.close();
        //console.log(req.url);
        //console.log(req.url.substr(req.url.indexOf("?") + 1))
        if (req.url.includes("?")) {
            const urlParams = new URLSearchParams(req.url.substr(req.url.indexOf("?") + 1));
            //console.log(Array.from(urlParams.keys()));
            callback(urlParams, app);
        }

    });
    return app.listen();
}


if (typeof module == "undefined") {
    console.log("Loading in on browser mode!\nUse getMSMC() to access sub functions.")
    module = {};
    module.exports = {};

    function getMSMC() {
        return module.exports;
    }
}


module.exports.MSLogin = function (token, callback, updates) {

    setCallback((Params) => MSCallBack(Params, token, callback, updates))
    return new Promise(
        resolve => app.addListener('listening',
            () => {
                token.redirect = "http://localhost:" + (app.address().port) + "/" + (token.redirect ? token.redirect : "");
                resolve(
                    this.CreateLink(token)
                )
            }
        )
    )
}

module.exports.CreateLink = function (token) {



    console.log(token
    )
    return "https://login.live.com/oauth20_authorize.srf" +
        "?client_id=" + token.client_id +
        "&response_type=code" +
        "&redirect_uri=" + encodeURIComponent(token.redirect) +
        "&scope=XboxLive.signin%20offline_access" +
        (token.prompt ? "&prompt=" + token.prompt : "")
}
/**
 * 
 * @param {*} token 
 * @param {{win:Window}} win 
 * @param {*} callback 
 * @param {*} updates 
 */
module.exports.WindowLogin = function (token, win, callback, updates) {

    var redirect = this.CreateLink(token);

    const closeOnExit = win.parent || win.popup ? win.closeAfter : false;
    /**@type {Window} */
    const main = () => win.parent ? win.parent : (typeof window != "undefined" ? window : null)

    /**
     * 
     * @param {Window} mainWin 
    
     * @returns 
     */
    function loadchange(mainWin, loc = mainWin.location.href) {


        if (loc.startsWith(token.redirect)) {
            const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1));

            if (closeOnExit) {
                try {
                    console.error("close window!")
                    mainWin.close();

                } catch {
                    console.error("Failed to close window!")
                }
            } else if (win.trueRedirect) {
                if ("location" in mainWin) {
                    mainWin.location.href = win.trueRedirect;

                } else {
                    mainWin.loadURL(win.trueRedirect)
                }
            }
            MSCallBack(urlParams, token, callback, updates);
            return true;
        }
        return false;

    }


    /**@type {Window} */
    var mainWin;
    if (win.popup) {
        if (typeof nw != "undefined") {
            //NW.js
            nw.Window.open(redirect, {}, function (new_win) {
                new_win.on('loaded', function () {
                    console.log('loaded')
                    loadchange(new_win.window)

                });

            })
            return;
        } else {

            try {
                const { BrowserWindow } = require('electron');
                const mainWindow = new BrowserWindow({
                    width: 800,
                    height: 600
                })
                mainWindow.loadURL(redirect);
                const contents = mainWindow.webContents;
                contents.on('did-finish-load', () => {

                    loadchange(mainWindow, contents.getURL())
                })


                return;
            } catch (e) {
                if (!main()) {
                    console.trace(e);
                    return;
                }
                //Unknown framework! or Electron front end
                mainWin = main().open("", "MSLogin", 'height=500,width=500,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes')
            }
        }
    } else
        mainWin = main();

    if (!mainWin) {
        console.error("Popup blocked!")
        return;
    }




    console.log(mainWin)
    try {
        mainWin.location = redirect;
        console.log(mainWin)
        var inter = setInterval(() => {
            if (loadchange(mainWin) || mainWin.closed) {
                clearInterval(inter);
            }
        }, 1000);
    } catch {
        console.error("Seems you're running in a commercial browser or within a framework with the same limitations as a commercial browser. This will not work!")
    }

    //mainWin.location.replace(redirect);
}

module.exports.FastLaunch = function (win, callback, updates, prompt) {
    const token = {
        client_id: "00000000402b5328",
        redirect: "https://login.live.com/oauth20_desktop.srf",
        prompt: prompt
    }
    this.WindowLogin(token, win, callback, updates)
}