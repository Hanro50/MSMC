import EventEmitter from "events";
import type { Server } from "http";
import fetch from "node-fetch";

import type {
  Prompt,
  AuthEvents,
  MSToken,
  MSAuthToken,
  Framework,
  Lexcodes,
  WindowProperties,
} from "../types.js";
import { Xbox } from "./xbox.js";
import { errorResponse, getCode } from "../util/lexicon.js";
import { launch } from "../gui/common.js";

function mojangAuthToken(prompt?: Prompt) {
  const token = {
    client_id: "00000000402b5328",
    redirect: "https://login.live.com/oauth20_desktop.srf",
    prompt: prompt,
  };
  return token;
}

export class Auth extends EventEmitter implements AuthEvents {
  token: MSToken;
  private app: Server;
  constructor(prompt?: Prompt);
  constructor(token: MSToken);
  constructor(token?: MSToken | Prompt) {
    super();
    if (!token)
      console.warn(
        "[MSMC]: Just a note. No prompt variable was specified. Assuming value to be 'login' to remain consistent with older releases",
      );
    this.token =
      !token || typeof token == "string"
        ? mojangAuthToken((token as Prompt) || "login")
        : token;
  }
  createLink(redirect?: string) {
    return (
      "https://login.live.com/oauth20_authorize.srf" +
      "?client_id=" +
      this.token.client_id +
      "&response_type=code" +
      "&redirect_uri=" +
      encodeURIComponent(redirect ? redirect : this.token.redirect) +
      "&scope=XboxLive.signin%20offline_access" +
      (this.token.prompt ? "&prompt=" + this.token.prompt : "") +
      "&mkt=" +
      getCode("gui.market")
    );
  }
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, args[0], getCode(args[0]));
  }
  load(code: Lexcodes) {
    this.emit("load", code);
  }
  login(code: string, redirect?: string) {
    const body =
      "client_id=" +
      this.token.client_id +
      (this.token.clientSecret
        ? "&client_secret=" + this.token.clientSecret
        : "") +
      "&code=" +
      code +
      "&grant_type=authorization_code" +
      "&redirect_uri=" +
      (redirect ? redirect : this.token.redirect);
    return this._get(body);
  }
  refresh(MS: MSAuthToken): Promise<Xbox>;
  refresh(refreshToken: string): Promise<Xbox>;
  refresh(MS: MSAuthToken | string) {
    const refresh = typeof MS == "string" ? MS : MS.refresh_token;
    const body =
      "client_id=" +
      this.token.client_id +
      (this.token.clientSecret
        ? "&client_secret=" + this.token.clientSecret
        : "") +
      "&refresh_token=" +
      refresh +
      "&grant_type=refresh_token";
    return this._get(body);
  }

  async launch(framework: Framework, windowProperties?: WindowProperties) {
    return await launch(this, framework, windowProperties);
  }
  /**
   * Used for a console like login experience.
   * @param callback
   * @param port
   * @returns
   */
  setServer(
    callback: (xbox: Xbox) => void,
    redirect: string = "Thank you!",
    port = 0,
  ): Promise<{ link: string; port: number; server: Server; auth: Auth }> {
    if (typeof redirect == "number") port = redirect;

    return new Promise(async (suc, err) => {
      let http: typeof import("http");
      try {
        http = await import("http");
      } catch (er) {
        err("error.state.invalid.http");
      }
      if (this.token.redirect.startsWith("http://localhost/"))
        err("error.state.invalid.redirect");
      try {
        if (this.app) {
          this.app.close();
        }
      } catch {
        /*Ignore*/
      }
      this.app = http.createServer(async (req, res) => {
        const lnk = `http://localhost:${req.socket.localPort}`;
        if (req.url.startsWith(`/link`)) {
          res.writeHead(302, {
            Location: this.createLink(lnk),
          });
          return res.end();
        }

        if (typeof redirect == "string" && redirect.startsWith("http")) {
          res.writeHead(302, { Location: redirect });
          res.end();
        } else {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Thank you!");
        }
        if (req.url.includes("?")) {
          const code = new URLSearchParams(
            req.url.substr(req.url.indexOf("?") + 1),
          ).get("code");
          console.log(code);
          try {
            callback(await this.login(code, lnk));
          } catch (e) {
            console.error(e);
          }
        }
      });
      this.app.on("listening", () => {
        let f: { port: number } | string = this.app.address();
        if (typeof f == "string") f = { port };
        console.log(
          `Use 'http://localhost:${
            f.port || port
          }/link' to automatically get redirected`,
        );
        suc({
          link: `http://localhost:${f.port || port}/link`,
          port: f.port || port,
          server: this.app,
          auth: this,
        });
      });
      this.app.listen(port);
    });
  }

  private async _get(body: string): Promise<Xbox> {
    this.load("load.auth.microsoft");
    var MS_Raw = await fetch("https://login.live.com/oauth20_token.srf", {
      method: "post",
      body: body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    // console.log(await MS_Raw.text())
    errorResponse(MS_Raw, "error.auth.microsoft");

    var MS = await MS_Raw.json();
    this.load("load.auth.xboxLive.1");
    var rxboxlive = await fetch(
      "https://user.auth.xboxlive.com/user/authenticate",
      {
        method: "post",
        body: JSON.stringify({
          Properties: {
            AuthMethod: "RPS",
            SiteName: "user.auth.xboxlive.com",
            RpsTicket: `d=${MS.access_token}`, // your access token from step 2 here
          },
          RelyingParty: "http://auth.xboxlive.com",
          TokenType: "JWT",
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    errorResponse(rxboxlive, "error.auth.xboxLive");
    var token = await rxboxlive.json();
    return new Xbox(this, MS, token);
  }
}
export default Auth;