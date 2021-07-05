/*Copyright 2021 Hanro50
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
End license text.*/

const BE = require("./modules/backEnd");
module.exports.setFetch = (fetchIn) => {
    BE.setFetch(fetchIn);
};

//Creates a login link
module.exports.CreateLink = function (token) {
    return (
        "https://login.live.com/oauth20_authorize.srf" +
        "?client_id=" +
        token.client_id +
        "&response_type=code" +
        "&redirect_uri=" + encodeURIComponent(token.redirect) +
        "&scope=XboxLive.signin%20offline_access" +
        (token.prompt ? "&prompt=" + token.prompt : "")
    );
};

//Callback function used with custom login flows
module.exports.MSCallBack = async function (code, MStoken, callback, updates = () => { }) {
    const body = (
        "client_id=" + MStoken.client_id +
        (MStoken.clientSecret ? "&client_secret=" + MStoken.clientSecret : "") +
        "&code=" + code +
        "&grant_type=authorization_code" +
        "&redirect_uri=" + MStoken.redirect)
    BE.MSget(body, callback, updates);
};



//Used to refresh the login token of a msmc account 
module.exports.MSRefresh = async function (profile, callback, updates = () => { }, authToken) {
    if (!profile._msmc) {
        console.error("[MSMC] This is not an msmc style profile object");
        return;
    };
    const refreshToken = profile._msmc.refresh ? profile._msmc.refresh : profile._msmc;
    authToken = authToken ? authToken : BE.MojangAuthToken();
    const body = (
        "client_id=" + authToken.client_id +
        (authToken.clientSecret ? "&client_secret=" + authToken.clientSecret : "") +
        "&refresh_token=" + refreshToken +
        "&grant_type=refresh_token")
    BE.MSget(body, callback, updates);
};

module.exports.Validate = (profile) => {
    return profile._msmc.expires_by && ((profile._msmc.expires_by - Math.floor(Date.now())) > 0);
}

//Generic ms login flow
module.exports.MSLogin = function (token, callback, updates) {
    return new Promise((resolve) => {
        const app = BE.setCallback((Params) => {
            this.MSCallBack(Params.get("code"), token, callback, updates)
        })
        app.addListener("listening", () => {
            if (String(token.redirect).startsWith("/")) {
                token.redirect = String(token.redirect).substr(1);
            }
            token.redirect =
                "http://localhost:" +
                app.address().port +
                "/" +
                (token.redirect ? token.redirect : "");
            resolve(this.CreateLink(token));
        });
    });
};

//Electron integration
module.exports.getElectron = () => {
    return require("./modules/electron");
};

//NWjs integration
module.exports.getNWjs = () => {
    return require("./modules/nwjs");
};

//MCLC integration
module.exports.getMCLC = () => {
    return require("./modules/mclc");
};

//ES6 compatibility 
module.exports.default = module.exports;