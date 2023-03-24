const { readFileSync } = require("fs");
const { auth, wrapError } = require("msmc");
const { assets } = require("msmc");

assets.loadLexiPack("../../lexipacks/french.json")
console.log("Testing NWJS. This should test most of the underlying code")
new Auth('select_account').on('load', console.log).launch('nwjs').then(async e => {
    const t = await e.getMinecraft()
    console.log(t.mclc())
    const a = await t.refresh(true)
    console.log(t.mclc())
}).catch(e => {
    console.log(wrapError(e))
})

/*

fastLaunch('nwjs', console.log).then(async L => {
    console.log(L);

    const mclc = getMCLC().getAuth(L);
    console.log(mclc);
    const r = await getMCLC().refresh(mclc, console.log);
    console.log(r);

    console.log("Completed tests!");

})
*/

