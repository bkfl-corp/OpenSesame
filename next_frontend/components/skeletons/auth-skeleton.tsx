import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center justify-center w-full max-w-md flex-1 px-4 sm:px-6 md:px-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-6 w-72 mb-6" />

        <div className="w-full">
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <Skeleton className="h-10 w-full rounded mt-4" />
          </div>
          <div className="mt-4 text-center">
            <Skeleton className="h-5 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
