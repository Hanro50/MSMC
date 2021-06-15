require('./microsoft').MSLogin({ client_id: "<client id>"},
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
