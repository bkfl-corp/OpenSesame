import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="w-full py-4 px-6 border-b border-border flex items-center justify-between">
      <div className="flex items-center">
        <Skeleton className="h-7 w-36" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
}
