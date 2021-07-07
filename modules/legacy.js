/**
 * This is to enable backwards compatibility with launchers built against the 2.1.x series of msmc. 
 * New Launchers should avoid implementing functions from this module!
 */

const msmc = require("..")

//Creates a login link
module.exports.CreateLink = function (token) {
    console.warn("[MSMC] deprecation warning: Use createLink instead of CreateLink");
    return msmc.createLink(token);
}
//Callback function used with custom login flows
module.exports.MSCallBack = function (code, MStoken, callback, updates = () => { }) {
    console.warn("[MSMC] deprecation warning: MSCallBack got renamed to authenticate and is an async based function!");
    msmc.authenticate(code, MStoken, updates).then(callback);
}
//Used to refresh the login token of a msmc account 
module.exports.MSRefresh = function (profile, callback, updates = () => { }, authToken) {
    console.warn("[MSMC] deprecation warning: MSRefresh got renamed to refresh and is an async based function!");
    msmc.refresh(profile, updates, authToken).then(callback);
}
//Used to check if tokens are still valid
module.exports.Validate = (profile) => {
    console.warn("[MSMC] deprecation warning: Use validate instead of Validate");
    return msmc.validate(profile);
}
//Generic ms login flow
module.exports.MSLogin = function (token, callback, updates) {
    console.warn("[MSMC] deprecation warning: MSLogin got renamed to login and got changed a fair bit!");
    return new Promise(rep => {
        msmc.login(token, rep, updates).then(callback);
    })
}

class GuiModule {
    constructor(type){
        this.type = type;
    }
     Launch(token, callback, updates, properties) {
        msmc.luanch(this.type , token, updates, prompt, properties).then(callback)
    }
     FastLaunch(callback, updates, prompt, properties) {
        msmc.fastLuanch(this.type , updates, prompt, properties).then(callback)
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
