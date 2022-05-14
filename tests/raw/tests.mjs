import { fastLaunch, getMCLC} from "msmc";
import msmc from "msmc";
console.log("Testing Raw. This should test most of the underlying code")
const L = await fastLaunch('raw', console.log);
console.log(await L.getXbox(console.log));
/*
console.log(L);

const mclc = getMCLC().getAuth(L);
console.log(mclc);
const r = await getMCLC().refresh(mclc, console.log);
console.log(r);

console.log("Completed tests!");
/**Hidden in type files. Here to make keeping the ES6 shim up to date far less of a hassle. */
msmc.mkES6();

