import { Skeleton } from "@/components/ui/skeleton";

export function SetupSkeleton() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <Skeleton className="h-8 w-64 mx-auto mb-6" />
        <Skeleton className="h-5 w-80 mx-auto mb-6" />

        <div className="flex border-b mb-6">
          <Skeleton className="flex-1 h-10 mx-2" />
          <Skeleton className="flex-1 h-10 mx-2" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
