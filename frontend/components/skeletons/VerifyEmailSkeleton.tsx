import { Skeleton } from '@/components/ui/skeleton';

export default function VerifyEmailSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-navbar-dark shadow-lg rounded-lg p-8 flex flex-col items-center w-full max-w-md transition-colors">
        <Skeleton className="h-10 w-10 rounded-full mb-4" />
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-5 w-full mb-2" />
      </div>
    </div>
  );
}
