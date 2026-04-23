import React from "react";
import { Card, CardContent } from "@components/ui/card";
import { cn } from "@lib/utils";

export function DashboardCard({
  title,
  actionLabel,
  onAction,
  headerActions,
  children,
  className,
  contentClassName,
}) {
  return (
    <Card className={cn("overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950", className)}>
      <CardContent className={cn("flex h-full min-h-0 flex-col p-4 xl:p-5", contentClassName)}>
        {(title || actionLabel || headerActions) && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
            {headerActions ? (
              <div className="flex items-center gap-2">{headerActions}</div>
            ) : onAction && actionLabel ? (
              <button
                type="button"
                onClick={onAction}
                className="text-[13px] font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
