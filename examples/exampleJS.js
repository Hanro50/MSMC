const MSMC = require('msmc');
/**
 * Do this if you get the following waring message
 * "
 * MSMC: Could not automatically determine which version of fetch to use.
 * MSMC: Please use 'setFetch' to set this property manually
 * "
 */
MSMC.setFetch(require("node-fetch"));
MSMC.MSLogin({ client_id: "9263b99c-b7c7-4c98-ac73-3dd90bc1fa2e"},
    (call) => {
        //The function called when the login has been a success
        console.log("")
        console.log("CallBack!!!!!")
        console.log(call)
        console.log("")
    },
    (update) => {
        //A hook for catching loading bar events and errors
        console.log("")
        console.log("CallBack!!!!!")
        console.log(update)
        console.log("")
    }
).then((link) => {
    //This is the link to the login page
    console.log("Click ME!!!!")
    console.log(link)
})
