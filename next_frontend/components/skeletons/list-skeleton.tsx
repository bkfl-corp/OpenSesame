import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  items?: number;
  withAvatar?: boolean;
  withActions?: boolean;
  className?: string;
}

export function ListSkeleton({
  items = 5,
  withAvatar = false,
  withActions = false,
  className = "",
}: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-md"
        >
          <div className="flex items-center space-x-3">
            {withAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          {withActions && (
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
