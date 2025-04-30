import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  hasHeader?: boolean;
  headerSize?: "sm" | "md" | "lg";
  contentItems?: number;
  footerActions?: number;
  className?: string;
}

export function CardSkeleton({
  hasHeader = true,
  headerSize = "md",
  contentItems = 3,
  footerActions = 0,
  className = "",
}: CardSkeletonProps) {
  const headerSizeClasses = {
    sm: "h-5 w-24",
    md: "h-6 w-32",
    lg: "h-7 w-40",
  };

  return (
    <div className={`bg-card rounded-lg shadow-sm border p-6 ${className}`}>
      {hasHeader && (
        <div className="mb-4 space-y-2">
          <Skeleton className={headerSizeClasses[headerSize]} />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: contentItems }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-5 w-${Math.floor(Math.random() * 3) + 8}/12`}
          />
        ))}
      </div>

      {footerActions > 0 && (
        <div className="mt-4 flex justify-end space-x-2">
          {Array.from({ length: footerActions }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-20 rounded" />
          ))}
        </div>
      )}
    </div>
  );
}
