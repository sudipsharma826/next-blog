'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  return (
    <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl bg-navbar dark:bg-navbar-dark backdrop-blur shadow-xl border border-border dark:border-border-dark">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
      <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); toast('Reset link sent (demo)!'); }}>
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <div className="relative">
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="pr-10" />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-text-muted-dark" />
          </div>
        </div>
        <Button type="submit" className="w-full mt-2 bg-primary dark:bg-primary-dark text-white hover:bg-primary/90 dark:hover:bg-primary-dark/90">Send Reset Link</Button>
      </form>
      <div className="mt-4 text-center">
        <a href="/login" className="text-sm text-primary dark:text-primary-dark hover:underline">Back to Login</a>
      </div>
    </div>
  );
}
