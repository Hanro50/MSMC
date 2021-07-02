//Load optional dependencies
try {
    /** We need an http server of some description to get the callback */
    var http = require("http");
} catch (er) {
    console.warn("Some sign in methods may not work due to missing http server support in enviroment")
}

try {
    var FETCH = require("node-fetch");
} catch (err) {
    try {
        FETCH = fetch;
    } catch { }
}
if (!FETCH) {
    console.warn(
        "MSMC: Could not automatically determine which version of fetch to use.\nMSMC: Please use 'setFetch' to set this property manually"
    );
}
const percent = 100 / 8;
//This needs to be apart or we could end up with a memory leak!
var app;
/**
 * @param {(URLCallback:URLSearchParams)=>void} callback
 * @param {(App:any)=>void}
 * This is needed for the oauth 2 callback
 */
module.exports.setCallback = (callback) => {
    if (!http) {
        console.error("Could not define http server, please use a different method!");
        return;
    }
    try {
        if (app) {
            app.close();
        }
    } catch { }
    app = http.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Thank you!");
        app.close();

        if (req.url.includes("?")) {
            const urlParams = new URLSearchParams(req.url.substr(req.url.indexOf("?") + 1));
            callback(urlParams);
        }
    });
    return app.listen();
}


//Load module methods 
module.exports.setFetch = (fetchIn) => {
    FETCH = fetchIn;
};

module.exports.getFetch = () => {
    return FETCH;
}

//Load helper methods 
module.exports.MojangAuthToken = (prompt) => {
    const token = {
        client_id: "00000000402b5328",
        redirect: "https://login.live.com/oauth20_desktop.srf",
        scope: "XboxLive.signin%20offline_access"
    }
    if (prompt)
        token.prompt = prompt;
    return token;
};

//Load constants 
module.exports.errorCheck = () => {
    if (!FETCH) {
        console.error(
            "MSMC: Could not automatically determine which version of fetch to use.\nMSMC: Please use 'setFetch' to set this property manually"
        );
        return true;
    }
    if (typeof FETCH !== "function") {
        console.error("MSMC: The version of fetch provided is not a function!");
        return true;
    }

    return false;
}

//Load account logic 
module.exports.MSget = async function (body, callback, updates = () => { }) {
    if (this.errorCheck()) { return }
    updates({ type: "Starting" });

    //console.log(Params); //debug
    var percent = 100 / 8;
    function loadBar(number, asset) {
        updates({ type: "Loading", data: asset, percent: number });
    }

    function error(reason) {
        updates({ type: "Error", data: reason });
    }

    function webCheck(response) {
        if (response.status > 400) {
            updates({ type: "Rejection", response: response });
        }
    }

    loadBar(percent * 1, "Getting Login Token");
    var MS = await (
        await FETCH("https://login.live.com/oauth20_token.srf", {
            method: "post",
            body: body,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
    ).json();
    //console.log(MS); //debug
    webCheck(MS);

    loadBar(percent * 2, "Logging into Xbox Live");
    var rxboxlive = await FETCH("https://user.auth.xboxlive.com/user/authenticate", {
        method: "post",
        body: JSON.stringify({
            Properties: {
                AuthMethod: "RPS",
                SiteName: "user.auth.xboxlive.com",
                RpsTicket: "d=" + MS.access_token, // your access token from step 2 here
            },
            RelyingParty: "http://auth.xboxlive.com",
            TokenType: "JWT",
        }),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    //console.log(rxboxlive); //debug
    webCheck(rxboxlive);
    var token = await rxboxlive.json();

    //console.log(token); //debug

    var XBLToken = token.Token;
    var UserHash = token.DisplayClaims.xui[0].uhs;
    loadBar(percent * 3, "Getting a Xbox One Security Token");
    var rxsts = await FETCH("https://xsts.auth.xboxlive.com/xsts/authorize", {
        method: "post",
        body: JSON.stringify({
            Properties: {
                SandboxId: "RETAIL",
                UserTokens: [
                    XBLToken, // from above
                ],
            },
            RelyingParty: "rp://api.minecraftservices.com/",
            TokenType: "JWT",
        }),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    webCheck(rxsts);
    //console.log(rxsts) //debug
    var XSTS = await rxsts.json();

    //console.log(XSTS);
    loadBar(percent * 4, "Checking for errors");

    if (XSTS.XErr) {
        var reason = "Unknown reason";
        switch (XSTS.XErr) {
            case "2148916233": {
                reason = "The account doesn't have an Xbox account.";
                break;
            }
            case "2148916238": {
                reason =
                    "The account is a child (under 18) and cannot proceed unless the account is added to a Family by an adult. (FIX ME: This error should in theory never happen if the launcher's oauth token is set up correctly)";
                break;
            }
        }
        return error(reason);
    }

    loadBar(percent * 5, "Logging into Minecraft");
    var rlogin_with_xbox = await FETCH(
        "https://api.minecraftservices.com/authentication/login_with_xbox",
        {
            method: "post",
            body: JSON.stringify({
                identityToken: "XBL3.0 x=" + UserHash + ";" + XSTS.Token,
            }),
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        }
    );
    webCheck(rlogin_with_xbox);

    loadBar(percent * 6, "Checking game ownership");
    var MCauth = await rlogin_with_xbox.json();
    //console.log(MCauth) //debug
    var rmcstore = await FETCH("https://api.minecraftservices.com/entitlements/mcstore", {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + MCauth.access_token,
        },
    });

    var MCPurchaseCheck = await rmcstore.json();
    //console.log(MCPurchaseCheck) //debug
    if (MCPurchaseCheck.items.length < 1) {
        return error("You do not seem to own minecraft.");
    }

    loadBar(percent * 7, "Fetching player profile");
    var r998 = await FETCH("https://api.minecraftservices.com/minecraft/profile", {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + MCauth.access_token,
        },
    });

    var profile = await r998.json();
    //console.log(profile) //debug
    if (profile.error) {
        return error("You do not seem to have a minecraft account.");
    }


    profile._msmc = MS.refresh_token;
    loadBar(100, "Done!");
    callback({ access_token: MCauth.access_token, profile: profile });
}

