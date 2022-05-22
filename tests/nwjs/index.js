const { auth, wrapError } = require("msmc");

console.log("Testing NWJS. This should test most of the underlying code")
new auth('select_account').on('load',console.log).luanch('nwjs').then(async e => {
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

