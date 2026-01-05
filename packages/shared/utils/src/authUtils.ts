export function createUserNameFromEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return email;
  }
  return email.substring(0, atIndex);
}
