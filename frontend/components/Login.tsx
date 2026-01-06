'use client';
import React, { useState } from 'react';
import { useAuthActions } from '../lib/logic/auth';
import { Mail, Github, Eye, EyeOff } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../lib/zodSchema/authSchema';
import { toast } from 'sonner';
import Link from 'next/link';
import ToastClick from '@/lib/toastHandler';

export function Login() {
  const { emailPasswordLogin } = useAuthActions();
  const googleRedirectUrl = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL;
  const githubRedirectUrl = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URL;
  if (!googleRedirectUrl || !githubRedirectUrl) {
    toast.error('Network error: OAuth Login Failed');
  }
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<'google' | 'github' | 'email' | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  // Always use window.location.href for OAuth login
  const handleGoogleLogin = () => {
    if (loading) return;
    setLoading('google');
    window.location.href = googleRedirectUrl as string;
  };
  const handleGithubLogin = () => {
    if (loading) return;
    setLoading('github');
    window.location.href = githubRedirectUrl as string;
  };

  return (
    <>
      <ToastClick />
      <div className="max-w-md mx-auto mt-16 p-8 rounded-xl shadow-lg bg-navbar dark:bg-navbar-dark text-text-primary dark:text-text-primary-dark">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to TechKnows</h2>
        <div className="flex flex-col gap-4 mb-6">
          <button
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-white/10 hover:bg-footer dark:hover:bg-white/20 transition text-zinc-900 dark:text-white font-semibold disabled:opacity-50"
            disabled={loading !== null}
            // onClick={async () => {
            //   if(loading) return;
            //   setLoading('google');
            //   await oauthLogin('google');
            //   setLoading(null);
            // }}
            onClick={handleGoogleLogin}

          >
            <FaGoogle className="w-5 h-5 text-primary dark:text-primary-dark" />
            {loading === 'google' ? 'Signing in with Google...' : 'Continue with Google'}
          </button>
          <button
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-white/10 hover:bg-footer dark:hover:bg-white/20 transition text-zinc-900 dark:text-white font-semibold disabled:opacity-50"
            disabled={loading !== null}
            // onClick={async () => {
            //   if(loading) return;
            //   setLoading('github');
            //   await oauthLogin('github');
            //   setLoading(null);
            // }}
            onClick={handleGithubLogin}
          >
            <Github className="w-5 h-5 text-primary dark:text-primary-dark" />
            {loading === 'github' ? 'Signing in with GitHub...' : 'Continue with GitHub'}
          </button>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted dark:text-text-muted-dark">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async (data: LoginFormData) => {
            if (loading === null) {
              setLoading('email');
              await emailPasswordLogin(data.email, data.password);
              setLoading(null);
            }
          })}
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@email.com"
                disabled={loading !== null}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message || 'Invalid email'}
                </span>
              )}
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-text-muted-dark" />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-2 rounded-lg border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Password"
                disabled={loading !== null}
                {...register('password')}
              />
              {errors.password && (
                <span className="text-xs text-red-500">
                  {errors.password.message || 'Invalid password'}
                </span>
              )}
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-text-muted dark:text-text-muted-dark" />
                ) : (
                  <Eye className="w-4 h-4 text-text-muted dark:text-text-muted-dark" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Link
              href="/forgotpassword"
              className="text-sm text-primary dark:text-primary-dark hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full mt-2 px-4 py-2 rounded-lg bg-primary dark:bg-primary-dark text-white font-semibold hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition disabled:opacity-50"
            disabled={loading !== null}
          >
            {loading === 'email' ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
