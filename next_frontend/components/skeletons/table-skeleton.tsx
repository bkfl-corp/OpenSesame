import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  hasHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  columns = 4,
  rows = 5,
  hasHeader = true,
  className = "",
}: TableSkeletonProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-md border">
        <div className="w-full">
          {hasHeader && (
            <div
              className="border-b grid"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: columns }).map((_, index) => (
                <div key={`header-${index}`} className="p-3">
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          )}
          <div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className={`grid ${rowIndex !== rows - 1 ? "border-b" : ""}`}
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`} className="p-3">
                    <Skeleton
                      className={`h-4 w-${
                        Math.floor(Math.random() * 3) + 7
                      }/12`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}
