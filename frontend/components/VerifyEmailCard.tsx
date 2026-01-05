'use client';
import React, { useLayoutEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/apiClient';

export default function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Email Verification in progress...');

  useLayoutEffect(() => {
      let timeout: NodeJS.Timeout;
      if (!token) {
        timeout = setTimeout(() => {
          setStatus('error');
          setMessage('No verification token provided.');
          router.replace('/?status=error&message=No verification token provided.');
        }, 0);
        return () => clearTimeout(timeout);
      }
      const verifyEmail = async () => {
        setStatus('loading');
        setMessage('Email Verification in progress...');
        try {
          const res = await apiRequest('/auth/verifyemail?token=' + encodeURIComponent(token), { method: 'GET' });
          if (res.status === 200) {
            setStatus('success');
            setMessage('Email verified successfully. You can now login.');
            setTimeout(() => {
              router.replace('/?status=success&message=Email verified successfully. You can now login.');
            }, 1000);
          } else {
            setStatus('error');
            setMessage(res.message || 'Email could not be verified.');
            setTimeout(() => {
              router.replace(`/?status=error&message=${encodeURIComponent(res.message || 'Email could not be verified.')}`);
            }, 2000);
          }
        } catch {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          setTimeout(() => {
            router.replace('/?status=error&message=Verification failed. Please try again.');
          }, 2000);
        }
      };
      verifyEmail();
      return () => clearTimeout(timeout);
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-navbar-dark shadow-lg rounded-lg p-8 flex flex-col items-center w-full max-w-md transition-colors">
        {status === 'loading' && (
          <>
            <div className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Email Verification
            </h2>
            <p className="text-gray-700 dark:text-gray-200">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 text-4xl mb-4">&#10004;</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Email Verified
            </h2>
            <p className="text-gray-700 dark:text-gray-200">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 text-4xl mb-4">&#10006;</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Verification Failed
            </h2>
            <p className="text-gray-700 dark:text-gray-200">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
