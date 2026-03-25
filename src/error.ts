import { xstsErrorResponse } from "./types";

export class LoginError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "LoginError";
    this.code = code;
  }
}
export function getXErrMessage(response: xstsErrorResponse): [string, string] {
  if (!("XErr" in response)) {
    return [
      "error.auth.xsts",
      "Unknown error occurred when attempting to obtain an Xbox Live Security Token",
    ];
  }
  switch (response.XErr) {
    case 2148916227:
      return ["error.auth.xsts.banned", "The user is banned from Xbox Live"];
    case 2148916233:
      return [
        "error.auth.xsts.userNotFound",
        "The given Microsoft account doesn't have an Xbox account",
      ];
    case 2148916235:
      return [
        "error.auth.xsts.bannedCountry",
        "The account is from a country where Xbox Live is not available/banned",
      ];
    case 2148916236:
    case 2148916237:
      return [
        "error.auth.xsts.child.SK",
        "The account needs adult verification on Xbox page",
      ];
    case 2148916238:
      return [
        "error.auth.xsts.child",
        "The account is a child (under 18) and cannot proceed unless the account is added to a Family by an adult. ",
      ];

    default:
      console.warn(
        "Unknown XErr: ",
        response.XErr,
        " - Contact MSMC devs to fix this"
      );
      return [
        "error.auth.xsts." + response.XErr,
        "Unknown error occurred when attempting to obtain an Xbox Live Security Token",
      ];
  }
}
export class XSTSError extends LoginError {
  response: xstsErrorResponse;
  constructor(response: xstsErrorResponse) {
    super(...getXErrMessage(response));
    this.name = "XSTSError";
    this.response = response;
  }

  getRedirect(): string {
    return this.response.Redirect;
  }

  getMessage(): string {
    return this.response.Message;
  }

  getXErr(): number {
    return this.response.XErr;
  }
  getIdentity(): string {
    return this.response.Identity;
  }
}
