const msmc = require('..');
//Value one: Method name, Value two: Which arg is the update callback function [counting from 0].  
const methods = [["authenticate", 2], ["refresh", 1], ["login", 2], ["launch", 2], ["fastLaunch", 1]];
module.exports.exceptional = {};
module.exports.callback = {};
methods.forEach((method) => {
    module.exports.exceptional[method[0]] = async (...arguments) => {
        const result = await msmc[method[0]](...arguments);
        if (msmc.errorCheck(result)) throw result;
        return result;
    }
    module.exports.callback[method[0]] = (callback, ...arguments) => {
        this.exceptional[method[0]](...arguments).then(callback).catch(err => {
            if (arguments.length > method[1]) {
                arguments[method[1]]({ type: "Error", error: err })
            }
        });
    }
})