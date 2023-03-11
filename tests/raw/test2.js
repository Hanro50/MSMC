import { Client } from "minecraft-launcher-core";
const launcher = new Client();
//Import the auth class
import { auth } from "msmc";
//Create a new auth manager
const authManager = new auth("select_account");
//Launch using the 'raw' gui framework (can be 'electron' or 'nwjs')
const xboxManager = await authManager.launch("raw")
//Generate the minecraft login token
const token = await xboxManager.getMinecraft();
// Pulled from the Minecraft Launcher core docs.
let opts = {
    clientPackage: null,
    // Simply call this function to convert the msmc minecraft object into a mclc authorization object
    authorization: token.mclc(),
    root: "./.minecraft",
    version: {
        number: "1.18.2",
        type: "release"
    },
    memory: {
        max: "6G",
        min: "4G"
    }
};
console.log("Starting!");
launcher.launch(opts);

launcher.on('debug', (e) => console.log(e));
launcher.on('data', (e) => console.log(e));
