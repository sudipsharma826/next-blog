import { Skeleton } from '@/components/ui/skeleton';

export default function NavbarSkeleton() {
  return (
    <div className="flex items-center gap-2 min-w-30 justify-end">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-8" />
    </div>
  );
}
