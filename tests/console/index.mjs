import msmc from "msmc";
console.log(msmc)
const auth = new msmc.auth({
    "client_id":"9263b99c-b7c7-4c98-ac73-3dd90bc1fa2e",
    "redirect":"http://localhost"
});
auth.setServer((xbla=>{
  console.log(xbla)
}))


//assets.loadLexiPack("..","..","lexipacks","afrikaans.json")
//console.log(auth.createLink())
//auth.on('load', console.log).luanch('raw').then(async e => {

//  const t = await e.getMinecraft()
//  console.log(t.mclc())
//}).catch((e) => {
//  console.log(wrapError(e))
//})
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

