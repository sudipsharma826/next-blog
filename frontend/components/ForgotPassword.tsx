'use client';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordEmailSchema,
  forgotPasswordOtpSchema,
  forgotPasswordResetSchema,
} from '../lib/zodSchema/authSchema';
import { useAuthActions } from '../lib/logic/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ToastClick from '@/lib/toastHandler';

type EmailForm = { email: string };
type OtpForm = { otp: string };
type ResetForm = { password: string; confirmPassword: string };

const PasswordStrength = ({ value }: { value: string }) => {
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  return (
    <div className="flex gap-2 text-xs mt-1">
      <span className={hasSpecial ? 'text-green-500' : 'text-gray-400'}>Special Character</span>
      <span className={/[A-Z]/.test(value) ? 'text-green-500' : 'text-gray-400'}>
        Uppercase Letter
      </span>
      <span className={/[a-z]/.test(value) ? 'text-green-500' : 'text-gray-400'}>
        Lowercase Letter
      </span>
      <span className={/[0-9]/.test(value) ? 'text-green-500' : 'text-gray-400'}>Number</span>
    </div>
  );
};

export const ForgotPassword = () => {
  const router = useRouter();
  const { requestForgotPasswordOtp, verifyForgotPasswordOtp, resetForgotPassword } =
    useAuthActions();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Email
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailForm>({
    resolver: zodResolver(forgotPasswordEmailSchema),
  });

  // Step 2: OTP
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpForm>({
    resolver: zodResolver(forgotPasswordOtpSchema),
  });

  // Step 3: Reset Password
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    control: resetControl,
    formState: { errors: resetErrors },
  } = useForm<ResetForm>({
    resolver: zodResolver(forgotPasswordResetSchema),
  });

  // Watch password for strength (using useWatch to avoid React Compiler warning)
  const watchedPassword = useWatch({ control: resetControl, name: 'password', defaultValue: '' });

  // Handlers
  const onEmailSubmit = async (data: EmailForm) => {
    setLoading(true);
    try {
      const res = await requestForgotPasswordOtp(data.email);
      if (res.status === 200) {
        setEmail(data.email);
        setStep(2);
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e) {
        toast.error((e as { message?: string }).message || 'Failed to send OTP. Please try again.');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    }
    setLoading(false);
  };

  const onOtpSubmit = async (data: OtpForm) => {
    setLoading(true);

    try {
      const res = await verifyForgotPasswordOtp(email, data.otp);
      if (res.status === 200) {
        setOtp(data.otp);
        setStep(3);
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e) {
        toast.error((e as { message?: string }).message || 'OTP verification failed. Please try again.');
      } else {
        toast.error('OTP verification failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const onResetSubmit = async (data: ResetForm) => {
    setLoading(true);
    try {
      const res = await resetForgotPassword(email, otp, data.password);
      if (res.status === 200) {
        router.push('/login?status=200&message=Password reset successful. Please log in.');
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e) {
        toast.error((e as { message?: string }).message || 'Password reset failed. Please try again.');
      } else {
        toast.error('Password reset failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ToastClick />
      <div className="max-w-md mx-auto mt-16 p-8 rounded-xl shadow-lg bg-navbar dark:bg-navbar-dark text-text-primary dark:text-text-primary-dark">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {step === 1 && (
          <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="flex flex-col gap-4">
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg border border-border bg-transparent"
              placeholder="you@email.com"
              {...registerEmail('email')}
            />
            {emailErrors.email && (
              <span className="text-xs text-red-500">{emailErrors.email.message}</span>
            )}
            <button
              type="submit"
              className="w-full mt-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
        {step === 2 && (
          <>
            <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="flex flex-col gap-4">
              <label className="block mb-1 text-sm font-medium">Enter 6-digit OTP</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-border bg-transparent"
                placeholder="123456"
                maxLength={6}
                {...registerOtp('otp')}
              />
              {otpErrors.otp && (
                <span className="text-xs text-red-500">{otpErrors.otp.message}</span>
              )}
              <button
                type="submit"
                className="w-full mt-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <button
              type="button"
              className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
              onClick={() => setStep(1)}
            >
              Back to Email
            </button>
          </>
        )}
        {step === 3 && (
          <form onSubmit={handleSubmitReset(onResetSubmit)} className="flex flex-col gap-4">
            <label className="block mb-1 text-sm font-medium">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-border bg-transparent"
              placeholder="New password"
              {...registerReset('password')}
            />
            <PasswordStrength value={watchedPassword} />
            {resetErrors.password && (
              <span className="text-xs text-red-500">{resetErrors.password.message}</span>
            )}
            <label className="block mb-1 text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-border bg-transparent"
              placeholder="Confirm password"
              {...registerReset('confirmPassword')}
            />
            {resetErrors.confirmPassword && (
              <span className="text-xs text-red-500">{resetErrors.confirmPassword.message}</span>
            )}
            <button
              type="submit"
              className="w-full mt-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default ForgotPassword;
