"use strict";
exports.__esModule = true;
var microsoft_1 = require("./microsoft");
microsoft_1.MSLogin({ client_id: "<client id>" }, function (call) {
    //The function called when the login has been a success
    console.log("");
    console.log("CallBack!!!!!");
    console.log(call);
    console.log("");
}, function (update) {
    //A hook for catching loading bar events and errors
    console.log("");
    console.log("CallBack!!!!!");
    console.log(update);
    console.log("");
}).then(function (link) {
    //This is the link to the login page
    console.log("Click ME!!!!");
    console.log(link);
});
