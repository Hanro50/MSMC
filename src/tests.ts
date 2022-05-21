import { exception } from "./assets.js";
import auth from "./auth.js";

new auth().on('load',console.log).luanch('raw').then(async e => {

  const t = await (await e.minecraft()).social()
  console.log(t);
}).catch((e: exception) => {
    console.log(e)
})