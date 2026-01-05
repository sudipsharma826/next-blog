

import VerifyEmailCard from '@/components/VerifyEmailCard';
import { Suspense } from 'react';
import VerifyEmailSkeleton from '@/components/skeletons/VerifyEmailSkeleton';

export default function VerifyLinkPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}> 
      <VerifyEmailCard />
    </Suspense>
  );
}
