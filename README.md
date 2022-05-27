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

<h1>UNDER CONSTRUCTION; 4.0.0 is still in an alpha state!</h1>

# Modules 
## auth
This module is the starting point of msmc. It will be the first msmc object you create. It is also the object that'll handle all of msmc's events for you. Mainly the load event. 
```ts
class auth extends EventEmitter {
    token: MStoken;
    constructor(prompt?: prompt);
    constructor(token: MStoken);
    createLink(): string;
    login(code: string): Promise<xbox>;
    refresh(MS: msAuthToken): Promise<xbox>;
    refresh(refreshToken: string): Promise<xbox>;
    luanch(framework: framework, windowProperties?: windowProperties): Promise<xbox>;
    server(port?: number): Promise<void>;

    on(event: "load", listener: (asset: lexcodes, message: string) => void): this;
    once(event: "load", listener: (asset: lexcodes, message: string) => void): this;
    emit(event: "load", asset: lexcodes): boolean;
}
```
>### `constructor(prompt?: prompt)`
This version of the constructor will generate an auth object with the vanilla minecraft launcher token. The prompt variable is a string that provides the prompt field in the vanilla token as that is not provided by default. 

```ts
type prompt = "login" | "none" | "consent" | "select_account";
```

To learn more about the prompt type, check out <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code">Microsoft's support page</a>. It will provide more details for the possible value of this field. 
>### `constructor(token: MStoken)` \<advanced>
This version of the constructor is for use with custom microsoft tokens.  
```ts
interface MStoken {
    client_id: string,
    redirect: string,
    clientSecret?: string,
    prompt?: prompt
}
```
The Oauth2 token details needed for you to log people in with Microsoft's service.  

Resources:
  1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
  2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
  3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
>### `createLink(): string` \<advance>
Creates a login link using the given Token. Can be used if you're forgoing MSMC's default gui based login flow for something custom. In essence you should use this link as a redirect, then capture the returning code url-parameter and feed it into the login function   
>### `login(code: string): Promise<xbox>` \<advance>;
The low level login function msmc uses. The returning promise is for the next stage in the login chain. Mainly the xbox module. I'd refer you to the next module to learn more! 
>### `refresh(MS: msAuthToken): Promise<xbox>`
The low level refresh function msmc uses. This will attempt to refresh the microsoft token at the core of msmc and return an xbox object as a result. Please see the msToken variable under the xbox module.
```ts
interface msAuthToken {
    token_type: string,
    expires_in: number,
    scope: string,
    access_token: string,
    refresh_token: string,
    user_id: string,
    foci: string
}
```
The 'refresh_token' and the 'access_token' are the only two fields of note to this project.
>### `refresh(refreshToken: string): Promise<xbox>`
Refreshes a user solely based on the refresh token of a set user's refresh_token. 
<hr>

## xbox
## minecraft
## social 
## assets

