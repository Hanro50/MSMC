# MSMC
A bare bones login library for Minecraft based projects to authenticate individuals with a Microsoft account. 

# Example 
```
require('./microsoft').MSLogin({ client_id: "{client ID}", redirect: "{redirect}" },
    (call) => {
        console.log(call) // will fire when a successful login has been processed
    },
    (update) => {
        console.log(update) // will fire periodically to give you updates about the state of the login
    }
).then((link) => {
    console.log(link) // The login link
})
```
# Docs 
 ## Function
 token => Basic MS token info<br>
 callback => The callback that is fired on a successful login. It contains a mojang access token and a user profile<br>
 updates => A callback that one can hook into to get updates on the login process<br>
 returns => The URL needed to log in your user in the form of a promise. You need to send this to a web browser or something similar to that!<br>
 
`MSLogin(token: MSToken, callback: (info: callback) => void, updates?: (info: update) => void): Promise<string>`

### token: MSToken: 
 The Oauth2 details needed to log you in. 
  
  Resources
  1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
  2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
  3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
  
 
  Recommendations: 
  
  1) Use "Mobile and desktop applications" as your type setting and make sure to set it up to only use "Personal Microsoft accounts only". 
  You're not a university!
  
  2) set the redirect to "http://localhost/...", With localhost specifically Microsoft does not check port numbers. 
  This means that  http://localhost:1/... to http://localhost:65535/... are all the same redirect to MS. (http://localhost/... == http://localhost:80/... btw)
  This app does not allow you to set the port manually, due to the extreme risk of unforseen bugs popping up. 
 * 
  3) If you set the ridirect to, for example, "http://localhost/Rainbow/Puppy/Unicorns/hl3/confirmed" then the variable {redirect} needs to equal "Rainbow/Puppy/Unicorns/hl3/confirmed".
  
  4) Basically the redirect field is equal to your redirect URL you gave microsoft without the "http://localhost/" part. 
  Please keep this in mind or you'll get weird errors as a mismatch here will still work...sort of. 
 

```
interface MSToken {
    client_id: string,
    clientSecret?: string,
    redirect: string
}
```
 ### callback: (info: callback) => void :
  The callback that is fired on a successful login. It contains a mojang access token and a user profile
 
 Callback object
 ###### The callback given on a successful login!
 
 access_token": string => Your classic Mojang auth token. You can do anything with this that you could do with the normal MC login token <br>
 profile: { "id": string, "name": string, "skins": [], "capes": [] } => Player profile. Similar to the one you'd normaly get with the mojang login
```
interface callback {
    "access_token": string, 
    profile: { "id": string, "name": string, "skins": [], "capes": [] } 
}
```
 * @param updates A callback that one can hook into to get updates on the login process
 * @returns The URL needed to log in your user. You need to send this to a web browser or something similar to that!


### updates?: (info: update) => void) 
An optional callback that one can hook into to get updates on the login process

  Update object
 ###### Used with the update callback to get some info on the login process
 
```
interface update {
    type: string, // Either "Loading" , "Rejection" or "Error".
    data: string | Response, // Some information about the call. Like the component that's loading or the cause of the error. 
    percent?: Number // Used to show how far along the object is in terms of loading
}
```
Possible values for the 'type' parameter:
 <table>
    <tr>
 <th>Value</th>
 <th>Cause</th>
  </tr>
  <tr>
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
      <tr>
   </table>
 
