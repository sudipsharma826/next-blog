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
          setMessage('Error to verifying email');
          router.replace('/?status=error&message=Error to verifying email');
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
    <div className="flex items-center justify-center min-h-[60vh] px-2">
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8 flex flex-col items-center transition-colors bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700"
        style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
      >
        {status === 'loading' && (
          <>
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
              Email Verification
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 text-center max-w-xs">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 dark:text-green-400 text-4xl mb-4">&#10004;</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
              Email Verified
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 text-center max-w-xs">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 dark:text-red-400 text-4xl mb-4">&#10006;</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
              Verification Failed
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 text-center max-w-xs">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
