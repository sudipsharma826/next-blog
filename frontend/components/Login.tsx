'use client';
import React, { useState } from 'react';
import { Mail, Github, Eye, EyeOff } from 'lucide-react';
import {FaGoogle} from "react-icons/fa"

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="max-w-md mx-auto mt-16 p-8 rounded-xl shadow-lg bg-navbar dark:bg-navbar-dark text-text-primary dark:text-text-primary-dark">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to TechKnows</h2>
      <div className="flex flex-col gap-4 mb-6">
        <button className="flex items-center gap-2 w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-white/10 hover:bg-footer dark:hover:bg-white/20 transition text-zinc-900 dark:text-white font-semibold">
          <FaGoogle className="w-5 h-5 text-primary dark:text-primary-dark" />
          Continue with Google
        </button>
        <button className="flex items-center gap-2 w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-white/10 hover:bg-footer dark:hover:bg-white/20 transition text-zinc-900 dark:text-white font-semibold">
          <Github className="w-5 h-5 text-primary dark:text-primary-dark" />
          Continue with GitHub
        </button>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted dark:text-text-muted-dark">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <form className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary dark:text-text-primary-dark">Email</label>
          <div className="relative">
            <input type="email" className="w-full px-4 py-2 rounded-lg border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" placeholder="you@email.com" />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-text-muted-dark" />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary dark:text-text-primary-dark">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className="w-full px-4 py-2 rounded-lg border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Password" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <EyeOff className="w-4 h-4 text-text-muted dark:text-text-muted-dark" /> : <Eye className="w-4 h-4 text-text-muted dark:text-text-muted-dark" />}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <a href="/forgot-password" className="text-sm text-primary dark:text-primary-dark hover:underline">Forgot password?</a>
        </div>
        <button type="submit" className="w-full mt-2 px-4 py-2 rounded-lg bg-primary dark:bg-primary-dark text-white font-semibold hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition">Login</button>
      </form>
    </div>
  );
}
