import { NextRequest, NextResponse } from 'next/server';
import { redirectTo } from '@workspace/shared-utils';

// List of auth pages to protect
const AUTH_PAGES = ['/login', '/forgotpassword', '/verifyemail'];

export function proxy(request: NextRequest) {
  const redirect = redirectTo(request);
  const { pathname } = request.nextUrl;
  // Only run on auth pages
  if (AUTH_PAGES.some((page) => pathname.startsWith(page))) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (accessToken || refreshToken) {
      // User is logged in, redirect to previous page or home
      const redirectUrl = redirect || '/';
      const redirectUrlWithParams = new URL(redirectUrl, request.url);
      redirectUrlWithParams.searchParams.set('status', 'info');
      redirectUrlWithParams.searchParams.set(
        'message',
        'You are already logged in.Cannot access the page.',
      );
      return NextResponse.redirect(redirectUrlWithParams);
    }
  }
  // Allow request to proceed
  return NextResponse.next();
}

// Optionally, only run middleware on these routes
export const config = {
  matcher: ['/login', '/forgotpassword', '/verifyemail'],
};
