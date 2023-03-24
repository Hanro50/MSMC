import { Client } from "minecraft-launcher-core";
const launcher = new Client();
//Import the auth class
import msmc from "msmc";
//Create a new auth manager
const authManager = new msmc.Auth("select_account");
//Launch using the 'raw' gui framework (can be 'electron' or 'nwjs')
const xboxManager = await authManager.launch("raw")
//Generate the Minecraft login token
const token = await xboxManager.getMinecraft();
// Pulled from the Minecraft Launcher core docs.
let opts = {
    clientPackage: null,
    // Simply call this function to convert the msmc Minecraft object into a mclc authorization object
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
console.log(JSON.stringify(msmc.mcTokenToolbox.fromMclcToken(authManager,token.mclc()).validate()))
//mcTokenToolkit.fromToken(authManager,token.mclc()).mclc()
console.log("Starting!");
launcher.launch(opts);

launcher.on('debug', (e) => console.log(e));
launcher.on('data', (e) => console.log(e));
