/*Copyright 2021 Hanro50
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
End license text.*/

const BE = require("./modules/backEnd");

module.exports = {
    //Pass through to set fetch 
    setFetch(fetchIn) {
        BE.setFetch(fetchIn);
    },
    //Creates a login link
    createLink(token) {
        if (typeof token == String) {
            token = BE.mojangAuthToken(token);
        }
        return (
            "https://login.live.com/oauth20_authorize.srf" +
            "?client_id=" +
            token.client_id +
            "&response_type=code" +
            "&redirect_uri=" + encodeURIComponent(token.redirect) +
            "&scope=XboxLive.signin%20offline_access" +
            (token.prompt ? "&prompt=" + token.prompt : "")
        );
    },
    //Callback function used with custom login flows
    authenticate(code, MStoken, updates = () => { }) {
        const body = (
            "client_id=" + MStoken.client_id +
            (MStoken.clientSecret ? "&client_secret=" + MStoken.clientSecret : "") +
            "&code=" + code +
            "&grant_type=authorization_code" +
            "&redirect_uri=" + MStoken.redirect)
        return BE.get(body, updates);
    },
    //Used to refresh the login token of a msmc account 
    refresh(profile, updates = () => { }, authToken) {
        if (!profile._msmc) {
            console.error("[MSMC]: This is not an msmc style profile object");
            return;
        };
        const refreshToken = profile._msmc.refresh ? profile._msmc.refresh : profile._msmc;
        authToken = authToken ? authToken : BE.mojangAuthToken();
        const body = (
            "client_id=" + authToken.client_id +
            (authToken.clientSecret ? "&client_secret=" + authToken.clientSecret : "") +
            "&refresh_token=" + refreshToken +
            "&grant_type=refresh_token")
        return BE.get(body, updates);
    },
    //Used to check if tokens are still valid
    validate(profile) {
        return profile._msmc.expires_by && profile._msmc.mcToken && ((profile._msmc.expires_by - Math.floor(Date.now() / 1000)) > 0);
    },
    //Generic ms login flow
    login(token, callback, updates) {
        return new Promise((resolve) => {
            const app = BE.setCallback((Params) => {
                this.authenticate(Params.get("code"), token, updates).then(c => { resolve(c); });
            })
            app.addListener("listening", () => {
                if (String(token.redirect).startsWith("/")) {
                    token.redirect = String(token.redirect).substr(1);
                }
                if (!token.redirect || !(token.redirect.startsWith("http")))
                    token.redirect =
                        "http://localhost:" +
                        app.address().port +
                        "/" +
                        (token.redirect ? token.redirect : "");
                callback(this.createLink(token));
            });
        });
    },

    fastLaunch(type, updates, prompt = "select_account", properties) {
        return this.launch(type, BE.mojangAuthToken(prompt), updates, properties)
    },

    launch(type, token, updates, Windowproperties) {
        switch (type) {
            case ("electron"): {
                return require("./modules/electron")(token, updates, Windowproperties);
            }
            case ("nwjs"): {
                return require("./modules/nwjs")(token, updates, Windowproperties);
            }
            case ("raw"): {
                return require("./modules/raw")(token, updates, Windowproperties);
            }
            default: {
                throw new Error('[MSMC]: Unknown library type');
            }
        }
    },
    //MCLC integration
    getMCLC() {
        return require("./modules/mclc");
    },
    errorCheck(result) {
        return !(result.type == "Success" || result.type == "DemoUser")
    },
    isDemoUser(result) {
        result = result.profile ? result.profile : result;
        return result._msmc && !!result._msmc.demo;
    },
    loadLegacy() {
        console.warn("[MSMC]:: This adds compatibility for launchers that implement the callback structure of 2.1.x and earlier. \n" +
            "New implementations should avoid using this as it will be removed with the 2.4.x series!");
        const legacy = require('./modules/legacy');
        Object.keys(legacy).forEach(e => {
            module.exports[e] = legacy[e];
        });
    },
    getExceptional() {
        return require("./modules/wrapper").exceptional;
    },
    getCallback() {
        return require("./modules/wrapper").callback;
    }
    ,
    default: module.exports
}

//ES6 compatibility 
