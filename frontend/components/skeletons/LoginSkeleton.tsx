import { Skeleton } from '@/components/ui/skeleton';

export default function LoginSkeleton() {
  return (
    <div className="max-w-md mx-auto mt-16 p-8 rounded-xl shadow-lg bg-navbar dark:bg-navbar-dark">
      <Skeleton className="h-8 w-2/3 mb-6" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-12 w-full mb-6" />
      <Skeleton className="h-10 w-1/2 mx-auto" />
    </div>
  );
}
