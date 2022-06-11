import msmc, { wrapError,assets } from "msmc";
console.log(msmc)
const auth = new msmc.auth();
//assets.loadLexiPack("..","..","lexipacks","afrikaans.json")
console.log(auth.createLink())
auth.on('load', console.log).luanch('raw').then(async e => {

  const t = await e.getMinecraft()
  console.log(t.mclc())
}).catch((e) => {
  console.log(wrapError(e))
})
let R = [];

//console.log(msmc.getXbox().getXProfile(P.getAuth))
/*
console.log(L);

const mclc = getMCLC().getAuth(L);
console.log(mclc);
const r = await getMCLC().refresh(mclc, console.log);
console.log(r);

console.log("Completed tests!");
/**Hidden in type files. Here to make keeping the ES6 shim up to date far less of a hassle. */
//msmc.mkES6();

