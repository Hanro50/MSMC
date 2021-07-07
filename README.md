# 2.2.0 branch
1) <strike>Async functions</strike><br>
2) <strike>Legacy mode</strike><br>
3) Update documentation <br>
4) Do a whole lot of bug testing <br>
5) Update examples 

NOTICE => 2.2.0 is not ready for production yet

# MSMC

A bare bones login library for Minecraft based projects to authenticate individuals with a Microsoft account.

# Support
Atm you can get support via Discord (link below).
<p>
   <a href="https://discord.gg/3hM8H7nQMA">
   <img src="https://img.shields.io/discord/861839919655944213?logo=discord"
      alt="chat on Discord"></a>
</p>

# Credit
Based off the Oauth2 flow outline on <a href="https://wiki.vg/Microsoft_Authentication_Scheme"> this site</a>
   
# Examples

### MCLC example

A basic example of how to hook this library into <a href="https://github.com/Pierce01/MinecraftLauncher-core#readme">Mincraft Launcher core</a> to launch minecraft

```js
//Import just the client package, MSMC replaces the Auth package in Minecraft Launcher core in this example
const { Client } = require("minecraft-launcher-core");
const launcher = new Client();
const msmc = require("msmc");

//Just using NWjs for this example, any function that gives the callback parameter type will work 
msmc.default.fastLaunch("nwjs", (update) => {
    //A hook for catching loading bar events and errors, standard with MSMC 
    console.log("")
    console.log("CallBack!!!!!")
    console.log(update)
    console.log("")
}).then(callback => {
    let opts = {
        clientPackage: null,
        // Pulled from the Minecraft Launcher core docs , this function is the star of the show
        authorization: msmc.getMCLC().getAuth(callback),
        root: "./minecraft",
        version: {
            number: "1.17.1",
            type: "release"
        },
        memory: {
            max: "6G",
            min: "4G"
        },
    }
    console.log("Starting")
    launcher.launch(opts);
    
    launcher.on('debug', (e) => console.log(e));
    launcher.on('data', (e) => console.log(e));
})
```

### Pure Node Example:

This is the set-up you'd use if you where only using node or an incompatible gui framework

```js
const MSMC = require("msmc");
MSMC.login({ client_id: "<token>" }, 
   (link) => {
        //This is the link to the login page
       console.log("Click ME!!!!");
       console.log(link);
    },(update) => {
        //A hook for catching loading bar events and errors
        console.log("");
        console.log("CallBack!!!!!");
        console.log(update);
        console.log("");
    }
).then((call) => {
    //The function called when the login has been a success
        console.log("");
        console.log("CallBack!!!!!");
        console.log(call);
        console.log("");
});
```

### Electron code sample:

This is a code sample for electron. It should be added to your main.js file. This will launch a pop-up that allows a user to log in with their Microsoft account as soon as possible. fastLaunch actually emulates the vanilla Minecraft launcher, meaning that we can use Mojangs own client ID to login. In-line login windows should use the older method.

```js
app.whenReady().then(() => {
  ...
  require("msmc").fastLaunch("electron",(update) => {
      // A hook for catching loading bar events and errors
      // Possible types are: Starting, Loading, Rejection, Error
      switch (update.type) {
        case "Starting":
          console.log("Checking user started!");
          break;
        case "Loading":
          console.log("Loading:", update.data, "-", update.percent + "%");
          break;
        case "Rejection":
          console.error("Fetch rejected!", update.data);
          break;
        case "Error":
          console.error("MC-Account error:", update.data);
          break;
        case "Cancelled":
          console.error("User clicked cancel!");
          break;
      }
    }
  ).then((call) => {
      console.log("Login successful");
   }).catch(e => console.trace(e));
 ...
})
```

### NW.js code sample:

It is recommended to run this in NW.js's node context. Basically in a library that is called via a "require" call in a browser thread.

```js
msmc.fastLaunch("nwjs", (update) => {
    //A hook for catching loading bar events and errors, standard with MSMC 
    console.log("")
    console.log("CallBack!!!!!")
    console.log(update)
    console.log("")
}).then(callback => {
     console.log("Login successful");
}).catch(e => console.trace(e));
```

# Docs

## types

### prompt

For more information. Check out Microsoft's support page: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code

Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the fastLaunch or Launch functions under either Electron or NW.js

```ts
type prompt = "login" | "none" | "consent" | "select_account";
```

### mclcUser
 A copy of the user object mclc uses
```ts
type mclcUser = {
    access_token: string;
    client_token?: string;
    uuid?: string;
    name?: string;
    user_properties?: Partial<any>;
}
```
 ### framework
A list of gui frameworks supported by this library.
Used by the launch and fastLaunch functions to figure out what functions they should target.

```ts
type framework = "electron" | "nwjs";
```

## Functions

### setFetch
An override to manually define which version of fetch should be used <br>
fetchIn => A version of fetch 
```ts
function setFetch(fetchIn: any): void;
```
### createLink
This function will create a login link based on the inputs provided. <br>
Note that this function is called internally after the redirect has been formatted. Aka after "http://localhost:\<port\>/" is appended to the redirect. <br>
This is done to allow us to create the "fastLaunch" methods which don't rely on an internal http server<br>
token => Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect;
```ts
function createLink(token: token): String;
```
### authenticate
Used when you want to implement your own login code, but still want msmc to handle authentication for you. <br>
code => The code gotten from a successful login <br>
MStoken => The Microsoft token object used to obtain the login code <br>
updates => A callback that one can hook into to get updates on the login process<br>
```ts
function authenticate(code: string, MStoken: token, updates?: (info: update) => void): Promise<result>;
```
### refresh
Used to refresh login tokens. It is recommended to do this at start up after calling validate to check if the client token needs a refresh<br>
profile => Player profile. Similar to the one you'd normaly get with the mojang login<br>
updates => A callback that one can hook into to get updates on the login process<br>
MStoken =>Microsoft token object used to obtain the login code  (Optional, will use the vanilla client token if it doesn't have anything)<br>
```ts
function refresh(profile: profile, updates?: (info: update) => void, MStoken?: token): Promise<result>;
```
### validate
Checks if a profile object is still valid<br>
profile => Player profile. Similar to the one you'd normally get with the Mojang login<br>
```ts
 function validate(profile: profile): Boolean;
```
### login
A generic login method. Useful if you aren't using electron or NW.js and want to make a terminal launcher or are using an unsupported framework<br>
token => Your MS Login token. Mainly your client ID, client secret (optional  | Depends how azure is set up) and a redirect (Do not include http://localhost:<port\>/ as that's added for you!)<br>
callback => The callback will give you a link you can redirect a user to. <br>
updates => A callback that one can hook into to get updates on the login process <br>
```ts
 function login(token: token, callback: (info: string) => void, updates?: (info: update) => void): Promise<result>;
```
### launch
Used with electron or nwjs to launch a popup that a user can use to sign in with<br>
type => The GUI framework this is compatible with <br>
token => Your MS Login token. Mainly your client ID, client secret<br>
updates => A callback that one can hook into to get updates on the login process<br>
properties => See windowProperties interface for more information<br>
```ts
 function launch(type: framework, token: token, updates?: (info: update) => void, properties?: windowProperties): Promise<result>;
```
### fastLaunch
Mimics the vanilla launcher in how it works. Like launch in creates a pop-up a user can log in with
type => The GUI framework this is compatible with <br>
updates => A callback that one can hook into to get updates on the login process<br>
prompt => See the type definition for "prompt" for more information<br>
properties => See windowProperties interface for more information<br>
```ts
function fastLaunch(type: framework, updates?: (info: update) => void, prompt?: prompt, properties?: windowProperties): Promise<result>;
```
### getMCLC

Replaces some of the functions the Authenticator component in MCLC.

#### getAuth

This serves as a msmc friendly version of getAuth function in MCLC's Authenticator component. Translating the information msmc gets into something mclc can comprehend. This does however not work with normal Mojang accounts

#### validate

This serves as a drop in replacement for the validate function in MCLC's Authenticator component. This works with Mojang and Microsoft accounts. 

#### refresh

This serves as a drop in replacement for the refreshAuth function in MCLC's Authenticator component. This will refresh vanilla and msmc accounts. A hidden \_msmc variable is used to determine how an account should be refreshed so please avoid removing that somehow since the Mojang method of refreshing accounts is not compatible with msmc signed in accounts.

```ts
function getMCLC(): {
    getAuth: (info: result) => Promise<mclcUser>
    validate: (profile: mclcUser) => Promise<Boolean>
    refresh: (profile: mclcUser) => Promise<mclcUser>
};
```

### loadLegacy
For launchers built against version 2.1.x series of this gui. <br>
This is here to allow you to update without rewriting everything. New launchers should avoid using it! <br>
Will be removed by version 2.4.0<br>
```ts
function loadLegacy(): void;
```


## interfaces

### token

The Oauth2 details needed to log you in.

Resources

1. https://docs.microsoft.com/en-us/graph/auth-register-app-v2
2. https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
3. https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps

Recommendations:

1. Use "Mobile and desktop applications" as your type setting and make sure to set it up to only use "Personal Microsoft accounts only".
   You're not a university!

2. set the redirect to "http://localhost/...", With localhost specifically Microsoft does not check port numbers.
   This means that http://localhost:1/... to http://localhost:65535/... are all the same redirect to MS. (http://localhost/... == http://localhost:80/... btw)
   This app does not allow you to set the port manually, due to the extreme risk of unforseen bugs popping up.

3. If you set the ridirect to, for example, "http://localhost/Rainbow/Puppy/Unicorns/hl3/confirmed" then the variable {redirect} needs to equal "Rainbow/Puppy/Unicorns/hl3/confirmed".

4. Basically the redirect field is equal to your redirect URL you gave microsoft without the "http://localhost/" part.
   Please keep this in mind or you'll get weird errors as a mismatch here will still work...sort of.

```ts
interface token {
    client_id: string;
    clientSecret?: string;
    redirect?: string;
    prompt?: prompt;
}
```
### profile 
A version of a Minecraft profile you'd get from the auth end points
```ts
interface profile {
    id: string, name: string, skins?: [], capes?: []
}
```

### result

The return object that all the async login procedures return

access_token": string => Your classic Mojang auth token. You can do anything with this that you could do with the normal Minecraft login token <br>
profile: profile => Player profile. Similar to the one you'd normally get with the Mojang login

```ts
interface result {
    access_token: string;
    profile: profile;
}
```

### update

Used in the callback that is fired multiple times during the login process to give the user feedback on how far along the login process is

```ts
interface update {
    type: "Loading" | "Rejection" | "Error" | "Starting" | "Cancelled"; //See table below!
    /**Some information about the call. Like the component that's loading or the cause of the error. */
    data?: string;
    /**Used by the rejection type.*/
    response?: Response;
    /**Used to show how far along the object is in terms of loading*/
    percent?: number;
}
```

Possible values for the 'type' parameter:

 <table>
    <tr>
 <th>Value</th>
 <th>Cause</th>
  </tr>
 <td>"Loading" </td>
 <td>This gives input with regards to how far along the login process is </td>
  </tr>
   <tr>
<td> "Rejection" </td>
 <td>This is given with a fetch error. You are given the fetch item as a data object.  </td>
  </tr>
   <tr>
 <td>"Error"</td>
  <td>This is given with a normal MC account error and will give you some user readable feedback. </td>
      </tr>
        <tr>
 <td>"Starting"</td>
  <td>This is fired once when the whole loading process is started. This is mainly for setting up loading bars and stuff like that. </td>
      <tr>
  <tr>
   <tr>
 <td>"Cancelled"</td>
  <td>When the user closes out of a pop-up (Electron / NV.js / methods that involve a GUI only) . </td>
      </tr>
   </table>

### windowProperties

Window properties is set to any to avoid needing both nw.js and electron loaded as dev dependencies<br>
The common properties between both libraries has been backed into the type information for this interface however<br>
See <a href="https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions">this</a> resource for Electron, if you want to know what options are available <br>
See <a href="https://nwjs.readthedocs.io/en/latest/References/Manifest%20Format/#window-subfields">this</a> resource for NW.js, if you want to know the available options<br>

```ts
interface windowProperties {
    width: number;
    height: number;
    resizable?: boolean; 
    [key: string]: any;
}
```
###### Please report any type file bugs asap
