'use client';

import { ApiResponse } from '@workspace/shared-types';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Handle API response and show appropriate toast
 *
 * Rules:
 * - 400,403,500,404 → toast.error()
 * - 401 → toast.info() (show what's happening during refresh)
 * - 201 → toast.warning() or toast.info() based on 'status' field
 * - 200 → toast.success()
 */
export function handleApiResponse(response: ApiResponse) {
  const { status, message } = response;
  if (!status && !message) return;

  switch (status) {
    case 200:
      // Success
      if (message) {
        toast.success(message);
      }
      break;

    case 201:
      // Warning or Info (user decides via 'status' field)
      if (message) {
        if (message.includes('warning')) {
          toast.info(message);
        } else {
          // Default to warning for 201
          toast.warning(message);
        }
      }
      break;

    case 400:
    case 403:
    case 404:
    case 500:
      // Error
      if (message) {
        toast.error(message);
      }
      break;

      // case 401:
      //   // Info (for refresh/validation feedback to user)
      //   if (message) {
      //     toast.info(message)
      //   }
      break;

    default:
      if (message) {
        toast.info(message);
      }
  }
}
export default function ToastClick() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    // console.log('ToastClick params:', { status, message });

    if (status && message) {
      // Show toast based on status code
      switch (status) {
        case 'success':
        case '200':
          toast.success(message);
          break;
        case '201':
        case 'warning':
        case 'info':
          if (message.toLowerCase().includes('warning')) {
            toast.warning(message);
          } else {
            toast.info(message);
          }
          break;
        case '400':
        // case "401":
        case '403':
        case '404':
        case '500':
        case 'error':
          toast.error(message);
          break;
        default:
          toast(message); // Default toast for other status codes
      }

      // Clean up URL parameters after showing toast
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      url.searchParams.delete('message');
      if (url.searchParams.get('user')) {
        url.searchParams.delete('user');
      }

      // Replace URL without the parameters
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}
