const { fastLaunch, getMCLC } = require("msmc");

console.log("Testing NWJS. This should test most of the underlying code")
fastLaunch('nwjs', console.log).then(async L => {
    console.log(L);

    const mclc = getMCLC().getAuth(L);
    console.log(mclc);
    const r = await getMCLC().refresh(mclc, console.log);
    console.log(r);

    console.log("Completed tests!");

})


