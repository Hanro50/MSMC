const msmc = require("msmc");
exports.getAuth = async (info) => {
    console.log(info)
    const userProfile = {
        access_token: info.access_token,
        client_token: null,
        uuid: info.profile.id,
        name: info.profile.name,
        _msmc: info.profile._msmc,
        user_properties: "{}"
    }
    return userProfile;
}
/**
 * @param {{
 *   access_token: string;
 *   client_token: string;
 *   uuid: string;
 *   name: string;
 *   user_properties: Partial<any>;}} profile 
 * @param {
 *     { client_id: string,
 *   clientSecret?: string,
 *   redirect?: string,
 *   prompt?: prompt}} authToken
 * 
 * 
  */
exports.refresh = async (profile, updates = (info) => { console.log(info) }, authToken) => {
    const FETCH = msmc.getFetch();
    console.log(profile);
    if (profile._msmc) {
        return await this.getAuth(await new Promise(res => {
            msmc.MSRefresh({ "name": profile.name, "id": profile.uuid, "_msmc": profile._msmc }, async (callback) => {
                res(await this.getAuth(callback))
            }, updates, authToken);
        }))
    } else {
        updates({ type: "Starting" });
        updates({ type: "Loading", data: "Refreshing Mojang account", percent: 0.5 });
        const req = {
            "accessToken": profile.access_token,
            "clientToken": profile.client_token,
            "requestUser": true
        }

        const user = await FETCH("https://authserver.mojang.com/refresh", {
            "body": JSON.stringify(req),
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            }

        });
        updates({ type: "Loading", data: "Getting user data", percent: 0.9 });
        const data = await user.json()

        if (data.error) {
            updates({ type: "Error", data: data });
            return null;
        }

        const userProfile = {
            access_token: data.accessToken,
            client_token: data.clientToken,
            uuid: data.selectedProfile.id,
            name: data.selectedProfile.name,
            user_properties: data.user ? data.user.properties : "{}"
        }
        updates({ type: "Loading", data: "Done!", percent: 1 });
        return userProfile;

    }
}
