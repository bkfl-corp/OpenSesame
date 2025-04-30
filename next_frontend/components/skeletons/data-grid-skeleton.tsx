import { Skeleton } from "@/components/ui/skeleton";

interface DataGridSkeletonProps {
  cols?: number;
  rows?: number;
  className?: string;
}

export function DataGridSkeleton({
  cols = 3,
  rows = 2,
  className = "",
}: DataGridSkeletonProps) {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, index) => (
        <div key={index} className="bg-card rounded-lg shadow-sm border p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between items-end pt-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
