import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded bg-slate-200/80", className)}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ className?: string; width?: string }> = ({
  className,
  width = "w-full",
}) => {
  return <Skeleton className={cn("h-3.5", width, className)} />;
};

export const SkeletonNumber: React.FC<{ className?: string; width?: string }> = ({
  className,
  width = "w-16",
}) => {
  return <Skeleton className={cn("h-7", width, className)} />;
};

export const SkeletonRow: React.FC<{
  cols?: number;
  className?: string;
}> = ({ cols = 4, className }) => {
  return (
    <div
      className={cn(
        "py-2.5 px-3 flex items-center justify-between gap-3 animate-pulse border-b border-slate-100",
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <Skeleton className="w-5 h-5 rounded shrink-0 bg-slate-200" />
        <Skeleton className="h-3.5 w-1/3 bg-slate-200" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-3.5 w-16 bg-slate-200" />
        <Skeleton className="h-3.5 w-10 bg-slate-200" />
      </div>
    </div>
  );
};
