const msmc = require('..');
const methods = ["authenticate", "refresh", "login", "fastLaunch", "launch"];
methods.forEach(e => {
    module.exports[e] = async (...arguments) => {
        const result = await msmc[e](...arguments);
        if (msmc.errorCheck(result)) throw result;
        return result;
    }
})