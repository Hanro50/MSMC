require('./microsoft').MSLogin({ client_id: "376d02f1-be18-4828-bc7e-2c336844f0a9" , redirect:"/login/oauth2/ms"},
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