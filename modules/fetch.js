/**Our stupid and overly complex fetch wrapper. 
 * We'll switch over to ES6 when we see a demand. 
 * Also technically this is a commonjs wrapper for a ES6 module. 
 * Fudge the wiki who said this shouldn't be possible*/
async function get(module) {
    try {
        const def = require(module)
        return def.default || def;
    } catch {
        return await import(module);
    }
}

async function fw() {
    var fetchImp = ["node-fetch", "electron-fetch", "cross-fetch"]
    for (var i = 0; i < fetchImp.length; i++) {
        const key = fetchImp[i]
        try {
            module.exports = await get(key);
            console.log("[MSMC]: Loaded " + key);
            return;
        } catch { }
    }
    try {
        module.exports = fetch;
        console.warn("[MSMC]: Loaded native Fetch");
    } catch {
        console.warn("[MSMC]: Could not automatically determine which version of fetch to use");
        console.warn("[MSMC]: Please use 'setFetch' to set this property manually [" + (process ? process.version : navigator.userAgent) + "]");
    }
}

const loader = fw();
module.exports = async (input, init) => {
    console.warn("[MSMC]: Waiting for fetch module to load");
    try {
        (await loader);
        module.exports(input, init);
    } catch {
        console.error("[MSMC]: No Fetch implementation present");
    }
}