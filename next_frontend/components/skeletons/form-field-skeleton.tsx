import { Skeleton } from "@/components/ui/skeleton";

interface FormFieldSkeletonProps {
  label?: boolean;
  helper?: boolean;
  type?: "input" | "textarea" | "select" | "checkbox" | "radio";
  className?: string;
}

export function FormFieldSkeleton({
  label = true,
  helper = false,
  type = "input",
  className = "",
}: FormFieldSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Skeleton className="h-4 w-24" />}
      {type === "input" && <Skeleton className="h-10 w-full rounded" />}
      {type === "textarea" && <Skeleton className="h-24 w-full rounded" />}
      {type === "select" && <Skeleton className="h-10 w-full rounded" />}
      {type === "checkbox" && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      )}
      {type === "radio" && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      )}
      {helper && <Skeleton className="h-3 w-36" />}
    </div>
  );
}
