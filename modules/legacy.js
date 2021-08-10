/**
 * This is to enable backwards compatibility with launchers built against the 2.1.x series of msmc. 
 * New Launchers should avoid implementing functions from this module!
 */

const msmc = require("..")
const call = (cb, callback, updates) => {
    switch (cb.type) {
        case "Success":
            callback(e); break;
        case "Authentication":
            if (e.data) {
                updates({ type: "Rejection", data: e.reason, response: e.data }); break;
            }
        case "Unknown":
        case "DemoUser":
            updates({ type: "Error", data: e.reason }); break;
        case "Cancelled":
            updates({ type: "Cancelled", data: e.reason });
    }
}
//Creates a login link
module.exports.CreateLink = function (token) {
    console.warn("[MSMC]: deprecation warning: Use createLink instead of CreateLink");
    return msmc.createLink(token);
}
//Callback function used with custom login flows
module.exports.MSCallBack = function (code, MStoken, callback, updates = () => { }) {
    console.warn("[MSMC]: deprecation warning: MSCallBack got renamed to authenticate and is an async based function!");
    msmc.authenticate(code, MStoken, updates).then(e => call(e, callback, updates)).catch(reason => updates({ type: "Error", data: reason }));
}
//Used to refresh the login token of a msmc account 
module.exports.MSRefresh = function (profile, callback, updates = () => { }, authToken) {
    console.warn("[MSMC]: deprecation warning: MSRefresh got renamed to refresh and is an async based function!");
    msmc.refresh(profile, updates, authToken).then(callback).catch(reason => updates({ type: "Error", data: reason }));
}
//Used to check if tokens are still valid
module.exports.Validate = (profile) => {
    console.warn("[MSMC]: deprecation warning: Use validate instead of Validate");
    return msmc.validate(profile);
}
//Generic ms login flow
module.exports.MSLogin = function (token, callback, updates) {
    console.warn("[MSMC]: deprecation warning: MSLogin got renamed to login and got changed a fair bit!");
    return new Promise(rep => {
        msmc.login(token, rep, updates).then(e => call(e, callback, updates)).catch(reason => updates({ type: "Error", data: reason }));
    })
}

class GuiModule {
    constructor(type) {
        this.type = type;
    }
    Launch(token, callback, updates, properties) {
        msmc.launch(this.type, token, updates, prompt, properties).then(e => call(e, callback, updates)).catch(reason => updates({ type: "Error", data: reason }));
    }
    FastLaunch(callback, updates, prompt, properties) {
        msmc.fastLaunch(this.type, updates, prompt, properties).then(e => call(e, callback, updates)).catch(reason => updates({ type: "Error", data: reason }));
    }
}

//Electron integration
module.exports.getElectron = () => {
    return new GuiModule("electron");
}

//NWjs integration
module.exports.getNWjs = () => {
    return new GuiModule("nwjs");
}

//raw integration
module.exports.getRaw = () => {
    return new GuiModule("raw");
}