import HeroSection from '@/components/HeroSection';
import { Suspense } from 'react';

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <HeroSection />
        </Suspense>
      </main>
    </>
  );
}
