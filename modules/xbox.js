const BE = require("./backEnd");

console.warn("[MSMC]: The Xbox endpoint function calls are in a beta stage!")
console.warn("[MSMC]: They may experience slight change till they're stabilized.")
console.warn("[MSMC]: Update with care. They will be finalized by version 3.2.0 .")
module.exports = {
    /**
     * @param {import('..').result } result 
     * @returns 
     */
    validate(result) {
        let profile = result.profile;
        return result.getXbox && profile && profile._msmc.ms_exp && ((profile._msmc.ms_exp - Math.floor(Date.now() / 1000)) > 0);
    },
    async refresh(result, authToken) {
        function webCheck(response) {
            return (response.status >= 400)
        }
        function error(reason, translationString, data) {
            return { type: "Authentication", reason: reason, data: data, translationString: translationString }
        }
        if (!profile._msmc) {
            console.error("[MSMC]: This is not an msmc style profile object");
            return;
        }
        const refreshToken = profile._msmc.refresh ? profile._msmc.refresh : profile._msmc;
        authToken = authToken ? authToken : self.mojangAuthToken();

        var MS_Raw = await BE.getFetch()("https://login.live.com/oauth20_token.srf", {
            method: "post", body: "client_id=" + authToken.client_id +
                (authToken.clientSecret ? "&client_secret=" + authToken.clientSecret : "") +
                "&refresh_token=" + refreshToken +
                "&grant_type=refresh_token", headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })

        if (webCheck(MS_Raw)) return error("Could not log into Microsoft", "Login.Fail.MS", rxboxlive);
        var MS = await MS_Raw.json();
        var rxboxlive = await BE.getFetch()("https://user.auth.xboxlive.com/user/authenticate", {
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

        if (webCheck(rxboxlive)) return error("Could not log into xbox", "Login.Fail.Xbox", rxboxlive);
        var token = await rxboxlive.json();
        console.log(token); //debug
        var XBLToken = token.Token;
        if (!profile._msmc.refresh) {
            profile._msmc = {};
        }
        profile._msmc.refresh = MS.refresh_token;
        const experationDate = Math.floor(Date.now() / 1000) + MS["expires_in"] - 100
        profile._msmc.ms_exp = experationDate;
        result.getXbox = (updates) => self.xboxProfile(XBLToken, updates);
        return (result);

    },
    getFriendlist(auth, xuid) {
        if (typeof auth == "object") {
            if (!auth.auth) throw "[MSMC]: The provided xprofile object does not have a auth header!"
            xuid = auth.xuid;
            auth = auth.auth;
        }
        else if (xuid && xuid.xuid) { xuid = xuid.xuid }
        return BE.getFriendList(auth, xuid);
    },
    async getXProfile(auth, xuid) {
        const profile = await BE.getXProfile("/profile/settings?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag", xuid);
        return BE.parseUsr(profile.profileUsers[0], auth);
    },
}