const msmc = require("..");
const BE = require("./backEnd");
module.exports = {
    //Converts a result or player profile object to a mclc login object
    getAuth(profile) {
        if (profile.type) {
            if (!profile.profile) {
                throw { error: "Invalid profile" }
            }
            profile = profile.profile;
        }
        
        return {
            access_token: profile._msmc.mcToken,
            client_token: null,
            uuid: profile.id,
            name: profile.name,
            meta:{
                type:"msa",
                demo:profile._msmc.demo
            },
            _msmc: profile._msmc,
            user_properties: "{}"
        };
    },
    //Converts a mclc login object to a msmc profile object
    toProfile(profile) {
        return { "name": profile.name, "id": profile.uuid, "_msmc": profile._msmc };
    },
    //Checks if a mclc login object is still valid
    async validate(profile) {
        const FETCH = BE.getFetch();
        if (profile._msmc) {
            return msmc.validate(this.toProfile(profile));
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
    },

    async refresh(profile, updates = (info) => { console.log(info) }, authToken) {
        const FETCH = BE.getFetch();
        if (profile._msmc) {
            return this.getAuth(await msmc.refresh(this.toProfile(profile), updates, authToken));
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
                throw data;
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
}
