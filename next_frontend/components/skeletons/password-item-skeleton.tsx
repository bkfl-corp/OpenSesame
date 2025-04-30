import { Skeleton } from "@/components/ui/skeleton";

interface PasswordItemSkeletonProps {
  count?: number;
  className?: string;
}

export function PasswordItemSkeleton({
  count = 5,
  className = "",
}: PasswordItemSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 border rounded-md bg-card flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted-foreground/10">
            <Skeleton className="h-6 w-6 rounded" />
          </div>

          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
