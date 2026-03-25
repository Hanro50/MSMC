export class LoginError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "LoginError";
    this.code = code;
  }
}
