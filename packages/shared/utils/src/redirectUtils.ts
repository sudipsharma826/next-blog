// export function redirectTo(){
// const url = new URL(document.referrer);
// const previousPath = url.pathname + url.search;
// return previousPath;
// }
// the as only for the clinet side
// Below one is for both client and server side
export function redirectTo(request?: { headers?: { get: (name: string) => string | null } }) {
  // Use referer header if available
  const referer = request?.headers?.get?.('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      return url.pathname + url.search;
    } catch {
      // If referer is not a valid URL, fallback to home
      return '/';
    }
  }
  // Fallback to home if no referer
  return '/';
}
