

import ForgotPassword from '@/components/ForgotPassword';
import { Suspense } from 'react';
import ForgotPasswordSkeleton from '@/components/skeletons/ForgotPasswordSkeleton';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}> 
      <ForgotPassword />
    </Suspense>
  );
}
