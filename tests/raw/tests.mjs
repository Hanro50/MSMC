import { fastLaunch, getFriendlist, getMCLC } from "msmc";
import msmc from "msmc";
msmc.mkES6();
console.log("Testing Raw. This should test most of the underlying code")
const L = await fastLaunch('raw', console.log);
const P = await L.getXbox(console.log);
console.log(P, await P.getFriends(), await getFriendlist(P.getAuth));


let R = [];
console.log(msmc.getXbox().getXProfile(P.getAuth))
/*
console.log(L);

const mclc = getMCLC().getAuth(L);
console.log(mclc);
const r = await getMCLC().refresh(mclc, console.log);
console.log(r);

console.log("Completed tests!");
/**Hidden in type files. Here to make keeping the ES6 shim up to date far less of a hassle. */
//msmc.mkES6();

