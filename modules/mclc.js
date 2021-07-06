const msmc = require("..");
const BE = require("./backEnd");
exports.getAuth = async (info) => {
    if (!info.profile) {
        return Promise.reject("No player object in attached callback object!");
    };
    const userProfile = {
        access_token: info.access_token,
        client_token: null,
        uuid: info.profile.id,
        name: info.profile.name,
        _msmc: info.profile._msmc,
        user_properties: "{}"
    };
    return userProfile;
}

exports.toProfile = (profile) => {
    return { "name": profile.name, "id": profile.uuid, "_msmc": profile._msmc };
}

exports.validate = async (profile) => {
    if (profile._msmc) {
        return msmc.Validate(his.toProfile(profile));
    }

    const req = {
        "accessToken": profile.access_token,
        "clientToken": profile.client_token
    };

    const r = await FETCH("https://authserver.mojang.com/validate", {
        "body": JSON.stringify(req),
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        }

    });

    return r.status == 204
}

exports.refresh = async (profile, updates = (info) => { console.log(info) }, authToken) => {
    const FETCH = BE.getFetch();
    if (profile._msmc) {
        return await this.getAuth(await new Promise(res => {
            res(msmc.refresh(this.toProfile(profile)
                , updates, authToken));
        }));
    } else {
        updates({ type: "Starting" });
        updates({ type: "Loading", data: "Refreshing Mojang account", percent: 50 });
        const req = {
            "accessToken": profile.access_token,
            "clientToken": profile.client_token,
            "requestUser": true
        };

        const user = await FETCH("https://authserver.mojang.com/refresh", {
            "body": JSON.stringify(req),
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            }

        });
        updates({ type: "Loading", data: "Getting user data", percent: 85 });
        const data = await user.json();

        if (data.error) {
            updates({ type: "Error", data: data });
            return null;
        };

        const userProfile = {
            access_token: data.accessToken,
            client_token: data.clientToken,
            uuid: data.selectedProfile.id,
            name: data.selectedProfile.name,
            user_properties: data.user ? data.user.properties : "{}"
        };

        updates({ type: "Loading", data: "Done!", percent: 100 });
        return userProfile;
    }
}