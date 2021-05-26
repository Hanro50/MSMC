"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
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
var updateTypes;
(function (updateTypes) {
    /** This gives input with regards to how far along the login process is */
    updateTypes["Loading"] = "Loading";
    /** This is given with a fetch error. You are given the fetch item as a data object.  */
    updateTypes["Rejection"] = "Rejection";
    /**This is given with a normal MC account error and will give you some user readable feedback.  */
    updateTypes["Error"] = "Error";
    /**This is fired once when the whole loading process is started. This is mainly for setting up loading bars and stuff like that */
    updateTypes["Starting"] = "Starting";
})(updateTypes || (updateTypes = {}));
//This could be running in a hybrid browser context (NW.js) or node context (Electron)
function FETCHGet() {
    if (typeof fetch === "function") {
        //hybrid browser context
        return fetch;
    }
    else {
        try {
            //node context (Electron)
            return require("node-fetch");
        }
        catch (_a) {
            //And the user no longer has a required dependency - If someone wants to. I'd be open for a wrapper to work with request.js 
            console.error("No version of fetch is a available in this enviroment!");
        }
    }
}
/** We need an http server of some description to get the callback */
var http_1 = require("http");
var FETCH = FETCHGet();
/**
 * @param {URLSearchParams} Params
 * @returns
 */
function MSCallBack(Params, token, callback, updates) {
    if (updates === void 0) { updates = function () { }; }
    return __awaiter(this, void 0, void 0, function () {
        function loadBar(number, asset) {
            updates({ type: updateTypes.Loading, data: asset, percent: number });
        }
        function error(reason) {
            updates({ type: updateTypes.Error, data: reason });
        }
        function webCheck(response) {
            if (response.status > 400) {
                updates({ type: updateTypes.Rejection, response: response });
            }
        }
        var code, percent, MS, rxboxlive, xboxtoken, XBLToken, UserHash, rxsts, XSTS, reason, rlogin_with_xbox, MCauth, rmcstore, MCPurchaseCheck, r998, profile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updates({ type: updateTypes.Starting });
                    code = Params.get('code');
                    console.log(Params); //debug
                    percent = 100 / 8;
                    loadBar(percent * 1, "Getting Login Token");
                    return [4 /*yield*/, FETCH("https://login.live.com/oauth20_token.srf", {
                            method: "post", body: "client_id=" + token.client_id +
                                "&code=" + code +
                                "&grant_type=authorization_code" +
                                "&redirect_uri=" + token.redirect +
                                (token.clientSecret ? "&client_secret=" + token.clientSecret : ""),
                            headers: { "Content-Type": "application/x-www-form-urlencoded" }
                        })];
                case 1: return [4 /*yield*/, (_a.sent()).json()];
                case 2:
                    MS = _a.sent();
                    console.log(MS); //debug
                    webCheck(MS);
                    loadBar(percent * 2, "Logging into Xbox Live");
                    return [4 /*yield*/, FETCH("https://user.auth.xboxlive.com/user/authenticate", {
                            method: "post", body: JSON.stringify({
                                "Properties": {
                                    "AuthMethod": "RPS",
                                    "SiteName": "user.auth.xboxlive.com",
                                    "RpsTicket": "d=" + MS.access_token // your access token from step 2 here
                                },
                                "RelyingParty": "http://auth.xboxlive.com",
                                "TokenType": "JWT"
                            }),
                            headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
                        })];
                case 3:
                    rxboxlive = _a.sent();
                    console.log(rxboxlive); //debug
                    webCheck(rxboxlive);
                    return [4 /*yield*/, (rxboxlive).json()];
                case 4:
                    xboxtoken = _a.sent();
                    console.log(token); //debug
                    XBLToken = xboxtoken.Token;
                    UserHash = xboxtoken.DisplayClaims.xui[0].uhs;
                    loadBar(percent * 3, "Getting a Xbox One Security Token");
                    return [4 /*yield*/, FETCH("https://xsts.auth.xboxlive.com/xsts/authorize", {
                            method: "post", body: JSON.stringify({
                                "Properties": {
                                    "SandboxId": "RETAIL",
                                    "UserTokens": [
                                        XBLToken // from above
                                    ]
                                },
                                "RelyingParty": "rp://api.minecraftservices.com/",
                                "TokenType": "JWT"
                            }),
                            headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
                        })];
                case 5:
                    rxsts = _a.sent();
                    webCheck(rxsts);
                    console.log(rxsts); //debug
                    return [4 /*yield*/, (rxsts).json()];
                case 6:
                    XSTS = _a.sent();
                    console.log(XSTS);
                    loadBar(percent * 4, "Checking for errors");
                    if (XSTS.XErr) {
                        reason = "Unknown reason";
                        switch (XSTS.XErr) {
                            case "2148916233": {
                                reason = "The account doesn't have an Xbox account.";
                                break;
                            }
                            case "2148916238": {
                                reason = "The account is a child (under 18) and cannot proceed unless the account is added to a Family by an adult";
                                break;
                            }
                        }
                        return [2 /*return*/, error(reason)];
                    }
                    loadBar(percent * 5, "Logging into Minecraft");
                    return [4 /*yield*/, FETCH("https://api.minecraftservices.com/authentication/login_with_xbox", {
                            method: "post", body: JSON.stringify({
                                "identityToken": "XBL3.0 x=" + UserHash + ";" + XSTS.Token
                            }),
                            headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
                        })];
                case 7:
                    rlogin_with_xbox = _a.sent();
                    webCheck(rlogin_with_xbox);
                    loadBar(percent * 6, "Checking game ownership");
                    return [4 /*yield*/, rlogin_with_xbox.json()];
                case 8:
                    MCauth = _a.sent();
                    console.log(MCauth); //debug
                    return [4 /*yield*/, FETCH("https://api.minecraftservices.com/entitlements/mcstore", {
                            headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': "Bearer " + MCauth.access_token }
                        })];
                case 9:
                    rmcstore = _a.sent();
                    return [4 /*yield*/, rmcstore.json()];
                case 10:
                    MCPurchaseCheck = _a.sent();
                    console.log(MCPurchaseCheck); //debug
                    if (MCPurchaseCheck.items.length < 1) {
                        return [2 /*return*/, error("You do not seem to own minecraft.")];
                    }
                    loadBar(percent * 7, "Fetching player profile");
                    return [4 /*yield*/, FETCH("https://api.minecraftservices.com/minecraft/profile", {
                            headers: { "Content-Type": "application/json", 'Accept': 'application/json', 'Authorization': "Bearer " + MCauth.access_token }
                        })];
                case 11:
                    r998 = _a.sent();
                    return [4 /*yield*/, r998.json()];
                case 12:
                    profile = _a.sent();
                    console.log(profile); //debug
                    if (profile.error) {
                        return [2 /*return*/, error("You do not seem to have a minecraft account.")];
                    }
                    loadBar(100, "Done!");
                    callback({ access_token: MCauth.access_token, profile: profile });
                    return [2 /*return*/];
            }
        });
    });
}
//This needs to be apart or we could end up with a memory leak!
var app;
/**
* @param {(URLCallback:URLSearchParams,App:any)=>void} callback
* This is needed for the oauth 2 callback
*/
function setCallback(callback) {
    try {
        if (app) {
            app.close();
        }
    }
    catch (_a) { }
    app = http_1.createServer(function (req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Thank you!');
        app.close();
        console.log(req.url);
        console.log(req.url.substr(req.url.indexOf("?") + 1));
        if (req.url.includes("?")) {
            var urlParams = new URLSearchParams(req.url.substr(req.url.indexOf("?") + 1));
            callback(urlParams, app);
        }
    });
    return app.listen();
}
function MSLogin(token, callback, updates) {
    setCallback(function (Params) { return MSCallBack(Params, token, callback, updates); });
    return new Promise(function (resolve) { return app.addListener('listening', function () {
        var address = app.address();
        token.redirect = "http%3A%2F%2Flocalhost%3A" + (address.port) + "%2F" + (token.redirect ? encodeURIComponent(token.redirect) : "");
        resolve("https://login.live.com/oauth20_authorize.srf" +
            "?client_id=" + token.client_id +
            "&response_type=code" +
            "&redirect_uri=" + token.redirect +
            "&scope=XboxLive.signin%20offline_access");
    }); });
}
exports.MSLogin = MSLogin;
