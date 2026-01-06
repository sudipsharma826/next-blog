'use client';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../apiClient';
import { useUserStore } from '../store/userStore';
import { handleApiResponse } from '../toastHandler';
import { redirectTo } from '@workspace/shared-utils';

export function useAuthActions() {
  const router = useRouter();
  const { setUser, clearUser, user } = useUserStore();
  async function emailPasswordLogin(email: string, password: string) {
    const redirect = redirectTo();
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password, provider: 'Credentials' },
    });

    if (res.status === 200 && res.user) {
      setUser({
        ...res.user,
        roles: Array.isArray(res.user.roles)
          ? res.user.roles
          : res.user.roles.split(',').map((role) => role.trim()),
      });
      // Redirect to previous route or home if redirect is provided
      if (redirect) {
        router.push(`${redirect}?status=success&message=Login successful`);
      } else {
        handleApiResponse(res);
      }
    } else {
      // On failure, stay on the same page and show toast
      handleApiResponse(res);
    }
  }
  // Outh login (Google, GitHub) didnot work alawys blocked by cors , solution is to direct redirect to the provider link.
  // export async function oauthLogin(provider: 'google' | 'github') {
  //   const redirect = redirectTo();
  //   // Show loading state in UI (handled in component)
  //   const res = await apiRequest(`/auth/${provider}`, { method: 'GET' });

  //   if (res.status === 200 && res.user) {
  //     useUserStore.getState().setUser({
  //       ...res.user,
  //       roles: Array.isArray(res.user.roles) ? res.user.roles : res.user.roles.split(',').map(role => role.trim()),
  //     });
  //     // Redirect to previous route or home if redirectTo is provided
  //     if (redirect) {
  //       window.location.href = `${redirect}?status=success&message=Login successful`;
  //     } else {
  //       handleApiResponse(res);
  //     }
  //   } else {
  //     // On failure, stay on the same page and show toast
  //     handleApiResponse(res);
  //   }
  // }
  async function singleSessionLogout() {
    const redirect = redirectTo();
    const res = await apiRequest('/auth/logout', { method: 'POST' });
    // console.log('Logout Response:', res);
    if (res.status === 200) {
      // clear user state
      clearUser();
      console.log('User info cleared from store on logout', user);
      router.push(`${redirect}?status=200&message=Logged out successfully`);
    }
    if (res.status !== 200) {
      handleApiResponse(res);
    }
  }

  // Forgot Password Step 1: Request OTP
  async function requestForgotPasswordOtp(email: string) {
    const res = await apiRequest('/auth/forgotpassword', {
      method: 'POST',
      body: { email },
    });
    // // defautl message (user friendly)
    // res.message="Network error occured.Please try again later.";
    handleApiResponse(res);
    return res;
  }

  // Forgot Password Step 2: Verify OTP
  async function verifyForgotPasswordOtp(email: string, otp: string) {
    const res = await apiRequest('/auth/verifyotp', {
      method: 'POST',
      body: { email, otp },
    });
    handleApiResponse(res);
    return res;
  }

  // Forgot Password Step 3: Reset Password
  async function resetForgotPassword(email: string, otp: string, password: string) {
    const res = await apiRequest('/auth/resetpassword', {
      method: 'POST',
      body: { email, otp, password },
    });
    handleApiResponse(res);
    return res;
  }

  return {
    emailPasswordLogin,
    // oauthLogin,
    singleSessionLogout,
    requestForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetForgotPassword,
  };
}
