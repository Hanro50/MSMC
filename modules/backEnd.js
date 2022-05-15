var http;
const FETCH = require("node-fetch");
//try { FETCH = typeof fetch == 'function' ? fetch : require("node-fetch"); } catch (er) { console.log(er); console.warn("[MSMC]: Could not load fetch, please use setFetch to define it manually!"); }
try { http = require("http"); } catch (er) { console.warn("[MSMC]: Some sign in methods may not work due to missing http server support in enviroment"); }
//This needs to be apart or we could end up with a memory leak!
var app;

function loadBar(update, percent, data) {
    update({ type: "Loading", data, percent })
}
function error(reason, translationString, data, getXbox) {
    return { type: "Authentication", reason: reason, data: data, translationString: translationString, getXbox }
}
function webCheck(response) {
    return (response.status >= 400)
}
module.exports = {
    //Used for the old/generic method of authentication
    setCallback(callback) {
        if (!http) { console.error("[MSMC]: Could not define http server, please use a different method!"); return; }
        try { if (app) { app.close(); } } catch { /*Ignore*/ }
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
    },
    //Used to set the version of fetch used manually
    setFetch(fetchIn) {
        FETCH = fetchIn;
    },
    //Used internally to get fetch when needed

    getFetch() {
        return FETCH;
    },

    //Load constants 
    errorCheck() {

        if (typeof FETCH !== "function") {
            console.error("[MSMC]: The version of fetch provided is not a function!");
            return true;
        }

        return false;
    },

    parseUsr(user, auth) {
        console.log(user)
        return {
            xuid: user.id,
            gamerTag: user.settings.find(s => s.id == "Gamertag")?.value,
            name: user.settings.find(s => s.id == "GameDisplayName")?.value,
            profilePictureURL: user.settings.find(s => s.id == "GameDisplayPicRaw").value,
            score: user.settings.find(s => s.id == "Gamerscore").value,
            getFriends: () => self.getFriendList(auth, user.id)
        }
    },

    async getFriendList(auth, xuid) {
        const friends = await self.xGet("/profile/settings/people/people?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag", auth, xuid)
        let R = [];
        friends.profileUsers.forEach(element => {
            R.push(self.parseUsr(element, auth));
        });
        return R;
    },
    //Used to get xbox profile information
    async xProfile(XBLToken, updates = () => { }) {
        const lbar = 100 / 2.5;
        updates({ type: "Loading", data: "Authenticating", percent: 0 });
        const json = await self.xLogin(XBLToken);
        const xui = json.DisplayClaims.xui[0];
        //console.log(xui)
        const auth = `XBL3.0 x=${xui.uhs};${json.Token}`
        console.log(json.Token)
        updates({ type: "Loading", data: "Getting profile info", percent: lbar * 1 });
        const profile = await self.xGet("/profile/settings?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag", auth)

        updates({ type: "Loading", data: "Parsing profile info", percent: lbar * 2 });

        const user = self.parseUsr(profile.profileUsers[0], auth);
        //user.friends = await self.getFriendList(auth, user.xuid)
        user.getAuth = () => auth;
        updates({ type: "Loading", data: "Done!", percent: 100 });
        return user
    },

    async xGet(enpoint, auth, xuid) {
        const target = xuid ? `xuid(${xuid})` : "me";
        if (typeof auth == "function") auth = auth();
        let profileRaw = await FETCH(`https://profile.xboxlive.com/users/${target}/${enpoint}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-xbl-contract-version": 2,
                    Authorization: auth,
                },
            });
        return await profileRaw.json();
    },

    async xAuth(XBLToken, RelyingParty = "http://xboxlive.com") {
        var rxsts = await FETCH("https://xsts.auth.xboxlive.com/xsts/authorize", {
            method: "post",
            body: JSON.stringify({
                Properties: { SandboxId: "RETAIL", UserTokens: [XBLToken] },
                RelyingParty,
                TokenType: "JWT",
            }),
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        if (webCheck(rxsts)) return error("Could authenticate with xbox live", "Login.Fail.MC", rlogin_with_xbox);

        var XSTS = await rxsts.json();
        if (XSTS.XErr) {
            var reason = "Unknown reason";
            var ts = "Unknown";
            switch (XSTS.XErr) {
                case 2148916233:
                    reason = "The account doesn't have an Xbox account.";
                    ts = "UserNotFound";
                    break;
                case 2148916235:
                    reason = "The account is from a country where Xbox live is not available";
                    ts = "BannedCountry";
                    break;
                case 2148916236:
                case 2148916237:
                    //I have no idea if this translates correctly. I don't even know what has to be done...Korean law is strange
                    reason = "South Korean law: Go to the Xbox page and grant parental rights to continue logging in.";
                    ts = "ChildInSouthKorea";
                    break;
                case 2148916238:
                    //Check MSMC's wiki pages on github if you keep getting this error
                    reason =
                        "The account is a child (under 18) and cannot proceed unless the account is added to a Family account by an adult.";
                    ts = "UserNotAdult";
                    break;

            }
            return error(reason, `Account.${ts}`);
        }
        console.log(XSTS.DisplayClaims)
        return `XBL3.0 x=${XSTS.DisplayClaims.xui[0].uhs};${XSTS.Token}`
    },

    async xLogin(body, updates = console.log) {
        const percent = 100 / 4;
        updates({ type: "Starting" });
        loadBar(updates, percent * 1, "Authenticating with Microsoft");
        var MS_Raw = await FETCH("https://login.live.com/oauth20_token.srf", {
            method: "post", body: body, headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        if (webCheck(MS_Raw)) return error("Could not authenticate with Microsoft", "Login.Fail.MC", MS_Raw);

        var MS = await MS_Raw.json();
        loadBar(updates, percent * 3, "Getting Xbox live Login Token");
        var rxboxlive = await FETCH("https://user.auth.xboxlive.com/user/authenticate", {
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
        if (webCheck(rxboxlive)) return error("Could get Xbox live token", "Login.Fail.MC", rxboxlive);

        var token = await rxboxlive.json();
        var XBLToken = token.Token;

        loadBar(updates, 100, "Done!");
        const ms_xp = Math.floor(Date.now() / 1000) + MS["expires_in"] - 100

        return { MS, XBLToken, ms_xp }
    },

async mcLogin(xToken){

},


    //Main Login flow implementation
    async get(body, updates = console.log) {
        const percent = 100 / 4;
        if (self.errorCheck()) { return Promise.reject("[MSMC]: Error : no or invalid version of fetch available!"); }
        updates({ type: "Starting" });

        //console.log(Params); //debug
        // function loadBar,updates(number, asset) { updates({ type: "Loading", data: asset, percent: number }); }

        const xToken = await this.xLogin(body, updates)
        if (xToken.type) return xToken;
        const auth = await this.xAuth(xToken.XBLToken, "rp://api.minecraftservices.com/")
        if (auth.type) return xToken;
        const getXbox = () => {
            const auth = this.xAuth(xToken.XBLToken)
            return {
                xToken,
                getXProfile: async () => await this.xGet('/profile/settings?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag', auth)
            }

        }

        loadBar(updates, percent * 1, "Logging into Minecraft");
        var rlogin_with_xbox = await FETCH(
            "https://api.minecraftservices.com/authentication/login_with_xbox",
            {
                method: "post",
                body: JSON.stringify({
                    identityToken: auth
                }),
                headers: { "Content-Type": "application/json", Accept: "application/json" },
            }
        );
        if (webCheck(rlogin_with_xbox)) return error("Could not log into Minecraft", "Login.Fail.MC", rlogin_with_xbox, getXbox);

        var MCauth = await rlogin_with_xbox.json();
        //console.log(MCauth) //debug
        const experationDate = Math.floor(Date.now() / 1000) + MCauth["expires_in"] - 100

        loadBar(updates, percent * 2, "Fetching player profile");
        var r998 = await FETCH("https://api.minecraftservices.com/minecraft/profile", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${MCauth.access_token}`,
            },
        });

        loadBar(updates, percent * 3, "Extracting XUID and parsing player object");
        var MCprofile = await r998.json();
        const xuid = self.parseJwt(MCauth.access_token).xuid;

        const _msmc = { refresh: xToken.MS.refresh_token, expires_by: experationDate, mcToken: MCauth.access_token };
        if (MCprofile.error) {
            _msmc.demo = true;
            const profile = { xuid: xuid, _msmc: profile._msmc, id: MCauth.username, name: 'Player', _msmc };

            return ({ type: "DemoUser", access_token: MCauth.access_token, profile: Demoprofile, translationString: "Login.Success.DemoUser", reason: "User does not own minecraft", getXbox });
        }
        const profile = { ...MCprofile, _msmc }
        loadBar(updates, 100, "Done!");
        //   console.log(XBLToken);
        return ({ type: "Success", access_token: MCauth.access_token, profile: profile, translationString: "Login.Success.User", getXbox });
    },
    parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(Buffer.from(base64, "base64").toString("utf8").split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    },
}

const self = module.exports;