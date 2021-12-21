# MSMC
<a href="https://github.com/Hanro50/MSMC/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/msmc" alt="MIT license"/></a>
<a href="https://www.npmjs.com/package/msmc"><img src="https://img.shields.io/npm/v/msmc" alt="Version Number"/></a>
<a href="https://github.com/Hanro50/MSMC/"><img src="https://img.shields.io/github/stars/hanro50/msmc" alt="Github Stars"/></a>

> A bare bones login library for Minecraft based projects to authenticate individuals with a Microsoft account.

# Support
<div>
   <a href="https://discord.gg/3hM8H7nQMA">
   <img src="https://img.shields.io/discord/861839919655944213?logo=discord"
      alt="chat on Discord"></a>
</div>

 At the momement you can get support via Discord (link above).

   
# Supported gui frameworks
> If you're using MSMC with one of the frameworks below. The behaviour each framework displays should be identical. 
Mainly each will generate a pop-up that can be used by the end user to login. In-line logins, where the main window of your app is redirected to allow a user to log in should be implemented manually. Check the wiki page for more information! {Coming soon!}
## "Auto"
> This framework is not a framework. Instead it tells MSMC to attempt detecting the optimal framework it should be using itself. Still in testing.
```js
...
const msmc = require("msmc");
msmc.fastLaunch("auto"...
```


## "Raw"

> This is not a framework as this method takes advantage off the chromium based web browsers a user will likely already have on their machine. 
Windows already ships with one, Microsoft edge, and you're in full control of you launcher’s dependencies on Linux.

> Chromium based web browser that are compatible with this method:
Google Chrome, Microsoft Edge, Vivaldi, Blisk, Brave Browser, Yandex (Only Mac/Linux), Chromium (Linux only)
No additional dependencies needed! 

### Example 

   ```js
const msmc = require("msmc");
const fetch = require("node-fetch");
//msmc's testing enviroment sometimes runs into this issue that it can't load node fetch
msmc.setFetch(fetch)
msmc.fastLaunch("raw", 
   (update) => {
        //A hook for catching loading bar events and errors, standard with MSMC
        console.log("CallBack!!!!!")
        console.log(update)
    }).then(result => {
        //If the login works
        if (msmc.errorCheck(result)){
            console.log("We failed to log someone in because : "+result.reason)
            return;
        }
        console.log("Player profile and mojang token : "+result);
    }).catch(reason=>{
        //If the login fails
        console.log("We failed to log someone in because : "+reason);
    })
```
###### 1) Raw was tested running under pure node 
###### 2) Raw doesn't respect the "resizable" window property
## NW.js
> You should use the require method to load this module. Loading it by linking directly to the index.js file from the browser side of things may lead to unintended 
errors and glitches our testing did not account for. 
### Example 
> If you noticed that this and the raw gui framework has the same example bar the change of the word "raw" to "nwjs". That's more due to the new architecture in 2.2.0 allowing us to streamline documentation. 
   ```js
const msmc = require("msmc");
const fetch = require("node-fetch");
//msmc's testing enviroment sometimes runs into this issue that it can't load node fetch
msmc.setFetch(fetch)
msmc.fastLaunch("nwjs", 
    (update) => {
        //A hook for catching loading bar events and errors, standard with MSMC
        console.log("CallBack!!!!!")
        console.log(update)
    }).then(result => {
        //If the login works
        if (msmc.errorCheck(result)){
            console.log("We failed to log someone in because : "+result.reason)
            return;
        }
        console.log("Player profile and mojang token : "+result);
    }).catch(reason=>{
        //If the login fails
        console.log("We failed to log someone in because : "+reason);
    })
```
## Electron
> It is recommended to run the code for this library on the back-end side of electron. This is mainly due to security and the fast launch methods using functions and objects not available on the front end of electron. 
> 
> Do note that some frameworks that use electron as a base might not have these issues, but it is still something you should consider if you're having issues.
### Example 
> This is a code sample for electron should be added to your main.js file. 
> NOTE: Only pass the profile object and the raw xprofile object you get back from the "getXbox" command included in the final object returned by msmc. Passing the entire object returned by msmc may cause issues. 
```js
app.whenReady().then(() => {
  ...
    require("msmc").fastLaunch("electron", 
        (update) => {
            //A hook for catching loading bar events and errors, standard with MSMC
            console.log("CallBack!!!!!")
            console.log(update)
        }).then(result => {
            //If the login works
             if (msmc.errorCheck(result)){
                console.log("We failed to log someone in because : "+result.reason)
                return;
            }
            console.log("Player profile and mojang token : "+result);
        }).catch(reason=>{
            //If the login fails
            console.log("We failed to log someone in because : "+reason);
        })
 ...
})
```

# Examples

## MCLC example

> A basic example of how to hook this library into <a href="https://github.com/Pierce01/MinecraftLauncher-core#readme">Mincraft Launcher core</a> to launch Minecraft

```js
const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const msmc = require("msmc");
const fetch = require("node-fetch");
//msmc's testing enviroment sometimes runs into this issue that it can't load node fetch
msmc.setFetch(fetch)
msmc.fastLaunch("raw",
    (update) => {
        //A hook for catching loading bar events and errors, standard with MSMC
        console.log("CallBack!!!!!")
        console.log(update)
    }).then(result => {
        //Let's check if we logged in?
        if (msmc.errorCheck(result)){
            console.log(result.reason)
            return;
        }
        //If the login works
        let opts = {
            clientPackage: null,
            // Pulled from the Minecraft Launcher core docs , this function is the star of the show
            authorization: msmc.getMCLC().getAuth(result),
            root: "./minecraft",
            version: {
                number: "1.17.1",
                type: "release"
            },
            memory: {
                max: "6G",
                min: "4G"
            }
        }
        console.log("Starting!")
        launcher.launch(opts);

        launcher.on('debug', (e) => console.log(e));
        launcher.on('data', (e) => console.log(e));
    }).catch(reason => {
        //If the login fails
        console.log("We failed to log someone in because : " + reason);
    })

```

## Pure Node Example:
> This is the set-up you'd use if you where only using node or an incompatible gui framework. Like writing a terminal based minecraft launcher!
```js
const MSMC = require("msmc");
MSMC.login({ client_id: "<token>" }, 
    (link) => {
            //This is the link to the login page
        console.log("Click ME!!!!");
        console.log(link);
        },(update) => {
            //A hook for catching loading bar events and errors
            console.log("CallBack!!!!!");
            console.log(update);
        }
    ).then((result) => {
           //Let's check if we logged in?
        if (msmc.errorCheck(result)){
            //We had an error? Lets see what it was. 
            console.log("Failed!!!!!!!");
            console.log(result)
            return;
        }
        console.log("Logged in!!!!!!!");
        //Else, lets continue
        console.log(result)
    }).catch(reason=>{
        //If the login fails
        console.log("We failed to log someone in because : "+reason);
    })
```

# Docs: Types

## prompt
> Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the fastLaunch or Launch functions under either Electron or NW.js

###### For more information. Check out <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code">Microsoft's support page</a>: 
```ts
type prompt = "login" | "none" | "consent" | "select_account";
```


## mclcUser
> A copy of the user object mclc uses
```ts
type mclcUser = {
    access_token: string;
    client_token?: string;
    uuid: string;

    name?: string;
    meta?: { 
        type: "mojang" | "xbox", 
        xuid?: string, 
        demo?: boolean 
    };
    user_properties?: Partial<any>;
}
```
## framework
> A list of gui frameworks supported by this library.
Used by the launch and fastLaunch functions to figure out what functions they should target.
```ts
type framework = "electron" | "nwjs" | "raw";
```

## ts 
> This is mostly used to aid translators. In theory one could create an add-on package that took in these codes and translated the given output accordingly.
```ts
export type ts =  "Login.Success.User" | "Login.Success.DemoUser" | "Login.Fail.Relog" | "Login.Fail.Xbox" | "Login.Fail.MC" | "Account.Unknown" | "Account.UserNotFound" | "Account.UserNotAdult" | "Cancelled.GUI" | "Cancelled.Back";
```

<table>
    <tr>
        <th>Value</th>
        <th>English translation</th>
    </tr>
    <tr>
        <td>Login.Success.User</td>
        <td>Success</td>
   </tr>
   <tr>
        <td>Login.Success.DemoUser</td>
        <td>You do not own Minecraft on this Microsoft Account</td>
    </tr>
    <tr>
        <td>Login.Fail.Relog</td>
        <td>Please relog</td>
    </tr>
    <tr>
        <td>Login.Fail.Xbox</td>
        <td>We failed to log you into your Xbox Account</td>
    </tr>
     <tr>
        <td>Login.Fail.MC</td>
        <td>We failed to log you into Minecraft with the given Xbox Account</td>
    </tr>
    <tr>
        <td>Account.Unknown</td>
        <td>We encountered an unknown error Attempting to get your Xbox One Security Token</td>
    </tr>
    <tr>
        <td>Account.UserNotFound</td>
        <td>The given Microsoft Account is not connected to a given Xbox Account</td>
    </tr>
    <tr>
        <td>Account.UserNotAdult</td>
        <td>According to Microsoft. You need to be an adult to log in from your current location.</td>
    </tr>
    <tr>
        <td>Cancelled.GUI</td>
        <td>The user dismissed the Login popup without logging in.</td>
    </tr>
    <tr>
        <td>Cancelled.Back</td>
        <td>The user dismissed the Login popup without logging in by clicking the back option or an error occured.</td>
    </tr>
</table>

# Docs: Interfaces

## token

> The Oauth2 details needed to log you in.

### Resources
> 
> 1. https://docs.microsoft.com/en-us/graph/auth-register-app-v2
> 2. https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
> 3. https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps

### Recommendations:
> 
> 1. If all of this seems confusing. Use the <a href="#fastlaunch">fastLaunch</a> method. Since doing so will allow you to skip this mess!
>
> 2. Use "Mobile and desktop applications" as your type setting and make sure to set it up to only use "Personal Microsoft accounts only". <b>You're not a university!</b>
> 
> 3. set the redirect to "http://localhost/...", With localhost specifically Microsoft does not check port numbers.
   This means that http://localhost:1/... to http://localhost:65535/... are all the same redirect to MS. (http://localhost/... == http://localhost:80/... btw)
> 
> 4. If you set the redirect to, for example, "http://localhost/Rainbow/Puppy/Unicorns/hl3/confirmed" then the variable {redirect} needs to equal "Rainbow/Puppy/Unicorns/hl3/confirmed".
>
> 5. Basically the redirect field is equal to your redirect URL you gave Microsoft without the "http://localhost/" part.
   Please keep this in mind or you'll get weird errors as a mismatch here will still work...sort of.
###### This library does not allow you to set the port manually, due to the extreme risk of unforeseen bugs popping up.
```ts
interface token {
    client_id: string;
    clientSecret?: string;
    redirect?: string;
    prompt?: prompt;
}
```
## profile 
> A version of a Minecraft profile you'd get from the auth end points
```ts
interface profile {
    id: string, name: string, skins?: [], capes?: [],xuid: string;
}
```
## xprofile 
> This is an xbox account object. Used to allow for intergration with xbox related services and features. 
For example getting a user's xbox profile picture.   

```ts
interface xprofile {
    /**The xuid that belongs to this user */
    xuid: string,
    /**The user's gamer tag */
    gamerTag: string,
    /**The user's username */
    name: string,
    /**The user's profile picture's url */
    profilePictureURL: string,
    /**The user's "Gamer score"*/
    score: string,
    /**The auth token you need for an "Authorization" header non of the ms docs tell you about, 
     * but which you absolutely need if you want to hit up any xbox live end points. 
     * 
     * I swear I will fork those fudging documents one of these days and make them a whole lot clearer then they are!!!! -Hanro50
     */
    getAuth?: () => string
}
```

## result
>The return object that all the async login procedures return<br>

>Possible values for the 'type' parameter in this interface:

<table>
    <tr>
        <th>Value</th>
        <th>Cause</th>
        <th>Other fields</th>
    </tr>
    <tr>
        <td>Success</td>
        <td>The user has been logged in and it has been verified that the user owns a licence to the game</td>
        <td>
            access_token&nbsp;:&nbsp;string<br>
            profile&nbsp;:&nbsp;profile<br>
            getXbox&nbsp;:&nbsp;{function}
        </td> 
    </tr>
    <tr>
        <td>DemoUser</td>
        <td>The user has been logged in, but does not appear to own the game.
        <br>THIS IS ONLY MEANT TO BE USED FOR LAUNCHING THE GAME IN DEMO MODE</td>
        <td>
            access_token&nbsp;:&nbsp;string<br>
            reason&nbsp;:&nbsp;string<br>
            getXbox&nbsp;:&nbsp;{function}
        </td>
    </tr>
    <tr>
        <td>Authentication</td>
        <td>The user could not be logged into their Microsoft account</td>
        <td>
            reason&nbsp;:&nbsp;string<br>
            data&nbsp;:&nbsp;Response
        </td>
    </tr>
    <tr>
        <td>Cancelled</td>
        <td>The user closed the login prompt (Gui based login flows)</td>
        <td>
            No added fields. 
        </td>
    </tr>
    <tr>
        <td>Unknown</td>
        <td>This unused at the moment</td>
        <td>
            No added fields. 
        </td>
    </tr>
</table>

> The resulting typescript object.<br> 

```ts
    interface result {
        type: "Success" | "DemoUser" | "Authentication" | "Cancelled" | "Unknown"
        /**Your classic Mojang auth token.*/
        "access_token"?: string, 
        /**Player profile. Similar to the one you'd normally get with the Mojang login*/
        profile?: profile,
        /**Used with the error types */
        reason?: string,
        /**Used to make translation easier */
        translationString?: ts,
        /**Used when there was a fetch rejection.*/
        data?: Response,
        /**Get Xbox profile of user */
        getXbox?: (updates?: (info: update) => void) => Promise<xprofile>;
    }
```
## update
> Used in the callback that is fired multiple times during the login process to give the user feedback on how far along the login process is

```ts
interface update {
    type:  "Starting" | "Loading" | "Error"; //See table below!
    /**Some information about the call. Like the component that's loading or the cause of the error. */
    data?: string;
    /**Used by the Error type.*/
    error?: result;
    /**Used to show how far along the object is in terms of loading*/
    percent?: number;
}
```

> Possible values for the 'type' parameter:

<table>
        <tr>
            <th>Value</th>
            <th>Cause</th>
        </tr>
         <tr>
            <td>"Starting"</td>
            <td>This is fired once when the whole loading process is started. This is mainly for setting up loading bars and stuff like that. </td>
        </tr>
        <tr>
            <td>"Loading" </td>
            <td>This gives input with regards to how far along the login process is.</td>
        </tr>
        <tr>
            <td>"Error"</td>
            <td>This is given with a normal MC account error and will give you some user readable feedback.<br>
            [Only thrown with the versions of the auth functions returned by the "<a href=#getcallback>getCallback()</a>" wrapper] </td>
        </tr>
    </table>

## windowProperties

> Window properties is set to any to avoid needing both nw.js and electron loaded as developer dependencies<br>
The common properties between both libraries has been backed into the type information for this interface however<br>
>
> See <a href="https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions">this</a> resource for Electron, if you want to know what options are available <br>
> 
> See <a href="https://nwjs.readthedocs.io/en/latest/References/Manifest%20Format/#window-subfields">this</a> resource for NW.js, if you want to know the available options<br>

```ts
interface windowProperties {
    width: number;
    height: number;
    resizable?: boolean; 
    [key: string]: any;
}
```
# Docs: Functions
## setFetch
> An override to manually define which version of fetch should be used <br>

fetchIn => A version of fetch 
```ts
function setFetch(fetchIn: any): void;
```
## mojangAuthToken \<Advance users only>
> Gets a premade token with mojang's auth token already set up . <br>

prompt => See the type definition for "prompt" for more information
###### This token is owned and controlled by Mojang. Using it for anything other then Minecraft might get you an angry email from a lawyer eventually. 
 ```ts
export declare function mojangAuthToken(prompt: prompt): token;
```
## createLink
> This function will create a login link based on the inputs provided. <br>
> 
> Note that this function is called internally after the redirect has been formatted. Aka after "http://localhost:\<port\>/" is appended to the redirect. <br>
> 
> This is done to allow us to create the "fastLaunch" methods which don't rely on an internal http server<br>

token => Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect;<br>
returns => A link you can plug into a web browser to send a user to a ms login page
```ts
function createLink(token: token): String;
```
## authenticate \<Advance users only>
> Used when you want to implement your own login code, but still want msmc to handle authentication for you. <br>

code => The code gotten from a successful login <br>
MStoken => The Microsoft token object used to obtain the login code <br>
updates => A callback that one can hook into to get updates on the login process<br>
returns => A promise that will grant you a user profile and Mojang login token<br>
```ts
function authenticate(code: string, MStoken: token, updates?: (info: update) => void): Promise<result>;
```
## refresh
> Used to refresh login tokens. It is recommended to do this at start up after calling validate to check if the client token needs a refresh<br>

profile => Player profile. Similar to the one you'd normally get with the Mojang login<br>
updates => A callback that one can hook into to get updates on the login process<br>
MStoken => Microsoft token object used to obtain the login code  (Optional, will use the vanilla client token if it doesn't have anything)<br>
returns => A promise that will grant you an updated user profile and Mojang login token<br>
```ts
function refresh(profile: profile, updates?: (info: update) => void, MStoken?: token): Promise<result>;
```
## validate
> Checks if a profile object is still valid<br>

profile => Player profile. Similar to the one you'd normally get with the Mojang login<br>
return => Returns a boolean stating whether a set account is still valid <br>
```ts
 function validate(profile: profile): Boolean;
```
## login
> A generic login method. Useful if you aren't using electron or NW.js and want to make a terminal launcher or are using an unsupported framework<br>

token => Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect (Do not include http://localhost:<port\>/ as that's added for you!)<br>
getlink => The callback will give you a link you can redirect a user to. <br>
updates => A callback that one can hook into to get updates on the login process <br>
returns => A promise that will grant you a user profile and Mojang login token<br>
```ts
 function login(token: token, getlink: (info: string) => void, updates?: (info: update) => void): Promise<result>;
```
## launch
> Used with electron or nwjs to launch a popup that a user can use to sign in with<br>

type => The GUI framework this is compatible with <br>
token => Your MS Login token. Mainly your client ID, client secret<br>
updates => A callback that one can hook into to get updates on the login process<br>
properties => See windowProperties interface for more information<br>
returns => A promise that will grant you a user profile and mojang login token<br>
```ts
 function launch(type: framework, token: token, updates?: (info: update) => void, properties?: windowProperties): Promise<result>;
```
## fastLaunch
> Mimics the vanilla launcher in how it works. Like launch in creates a pop-up a user can log in with

type => The GUI framework this is compatible with <br>
updates => A callback that one can hook into to get updates on the login process<br>
prompt => See the type definition for "prompt" for more information<br>
properties => See windowProperties interface for more information<br>
returns => A promise that will grant you a user profile and mojang login token<br>
```ts
function fastLaunch(type: framework, updates?: (info: update) => void, prompt?: prompt, properties?: windowProperties): Promise<result>;
```
## getMCLC

> Replaces some of the functions the Authenticator component in MCLC.

### getAuth

> This serves as a MSMC friendly version of getAuth function in MCLC's Authenticator component. Translating the information MSMC gets into something mclc can comprehend. This does however not work with normal Mojang accounts

### validate

> This serves as a drop in replacement for the validate function in MCLC's Authenticator component. This works with Mojang and Microsoft accounts. 

### refresh
> This serves as a drop in replacement for the refreshAuth function in MCLC's Authenticator component. This will refresh vanilla and MSMC accounts. A hidden \_msmc variable is used to determine how an account should be refreshed so please avoid removing that somehow since the Mojang method of refreshing accounts is not compatible with MSMC signed in accounts.

### toProfile \<Advance users only>
> This converts mclc profile objects back into msmc ones. It should be noted that mclc profile objects created with mclc's native authenticator module should not be passed to this function as it will likely result in an error upon converting them back to mclc profile objects. 

```ts
export declare function getMCLC(): {
    getAuth: (info: result) => mclcUser
    validate: (profile: mclcUser) => Promise<Boolean>
    refresh: (profile: mclcUser, updates?: (info: update) => void, MStoken?: token) => Promise<mclcUser>
    toProfile: (profile: mclcUser) => profile
}
```
## errorCheck
> Checks if a return value is valid and if the login procedure has been successful
###### Demo accounts will cause this function to return false. 
```ts
function errorCheck(result: result): Boolean;
```

## isDemoUser
> Checks if a player object was created with a demo account. Useful for if you're using msmc without mclc and still want to implement demo account support.
###### This function shouldn't be needed with MCLC as the profile object MSMC creates for MCLC contains some meta data that tells MCLC to launch the game in demo mode. 
```ts
function isDemoUser(profile: profile | result): Boolean;
```

## getExceptional
> Wraps the following functions and causes each to throw a result object as an error on a failed login instead of passing back said result object
###### See the docs for the normal async versions of these functions for a better idea of what they do
```ts
function getExceptional(): {
    authenticate: (code: string, MStoken: token, updates?: (info: update) => void) => Promise<result>
    refresh: (profile: profile, updates?: (info: update) => void, MStoken?: token) => Promise<result>
    login: (token: token, getlink: (info: string) => void, updates?: (info: update) => void) => Promise<result>
    launch: (type: framework, token: token, updates?: (info: update) => void, properties?: windowProperties) => Promise<result>
    fastLaunch: (type: framework, updates?: (info: update) => void, prompt?: prompt, properties?: windowProperties) => Promise<result>
}
```
## getCallback
> Wraps the following functions and presents them in a similar style to the old 2.1.x series of msmc. 
In that you must provide the set of functions a callback function as a variable. 
> 
> Also errors are sent to the update funtion that you provide similarly to the 2.1.x series of msmc. 
###### See the docs for the normal async versions of these functions for a better idea of what they do
```ts
export declare function getCallback(): {
    authenticate: (callback: (r: result) => void, code: string, MStoken: token, updates?: (info: update) => void) => void
    refresh: (callback: (r: result) => void, profile: profile, updates?: (info: update) => void, MStoken?: token) => void
    login: (callback: (r: result) => void, token: token, getlink: (info: string) => void, updates?: (info: update) => void) => void
    launch: (callback: (r: result) => void, type: framework, token: token, updates?: (info: update) => void, properties?: windowProperties) => void
    fastLaunch: (callback: (r: result) => void, type: framework, updates?: (info: update) => void, prompt?: prompt, properties?: windowProperties) => void
}
```
### NWJS
> If you're already using this GUI framework. A variant of Fetch is already available in global scope and will thus be selected by msmc automatically. <b>You do not need to manually add fetch.</b>
### Electron 
> Electron does not provide an implementation of fetch to the node backend. It is recommended not to use the implementation of fetch provided by the frontend. This is mostly due to potential issues with cores you'll have if you ignore this warning. 
### Recommended
> Two fetch implementations msmc is tested against is <a href="https://www.npmjs.com/package/node-fetch">node-fetch</a> and <a href="https://www.npmjs.com/package/electron-fetch">electron-fetch</a>. If either are present then MSMC will pull them down automatically. If you however want to specify an implementation of fetch msmc should use. Please see the <a href="#setfetch">setFetch</a> function for more information!.  

# Final notes
> This module includes a ES6 layer.
# Credit
> Based off the Oauth2 flow outline on <a href="https://wiki.vg/Microsoft_Authentication_Scheme"> this site</a>
###### Please report any type file bugs asap

