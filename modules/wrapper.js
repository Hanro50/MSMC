const msmc = require('..');
//Value one: Method name, Value two: Which arg is the update callback function [counting from 0].  
const methods = [["authenticate", 2], ["refresh", 1], ["login", 2], ["launch", 2], ["fastLaunch", 1]];
module.exports.exceptional = {};
module.exports.callback = {};
methods.forEach((method) => {
    module.exports.exceptional[method[0]] = async (...argz) => {
        const result = await msmc[method[0]](...argz);
        if (msmc.errorCheck(result)) throw result;
        return result;
    }
    module.exports.callback[method[0]] = (callback, ...argz) => {
        this.exceptional[method[0]](...argz).then(callback).catch(err => {
            if (argz.length > method[1]) {
                argz[method[1]]({ type: "Error", error: err })
            }
        });
    }
})