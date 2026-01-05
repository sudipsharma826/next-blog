export class AccessTokenRevalidate extends Error {
  constructor(message = 'Access token expired, please re-authenticate') {
    super(message);
    this.name = 'AccessTokenRevalidate';
  }
}
