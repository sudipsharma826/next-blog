

import Login from '@/components/Login';
import { Suspense } from 'react';
import LoginSkeleton from '@/components/skeletons/LoginSkeleton';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}> 
      <Login />
    </Suspense>
  );
}
