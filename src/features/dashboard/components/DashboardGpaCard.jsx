import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import { navigateToTab } from "@/features/dashboard/components/DashboardHelpers";
import { cn } from "@lib/utils";

const GPA_CARD_HIDDEN_KEY = "dashboard_gpa_card_hidden";

export function DashboardGpaCard({ snapshot, compact = false }) {
  const gpa4 = snapshot.gpa.snapshot?.gpa4?.toFixed(2) ?? "--";
  const gpa10 = snapshot.gpa.snapshot?.gpa10?.toFixed(2) ?? "--";
  const hasGpaData = Boolean(snapshot.gpa.snapshot);
  const [isScoreHidden, setIsScoreHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(GPA_CARD_HIDDEN_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(GPA_CARD_HIDDEN_KEY, isScoreHidden ? "true" : "false");
  }, [isScoreHidden]);

  const statusText = hasGpaData ? "Đã sync GPA" : "Chưa có dữ liệu";
  const maskedText = "--.--";
  const scoreTextClassName = compact ? "text-4xl font-extrabold" : "text-5xl font-extrabold";
  const insetCardClassName = compact ? "rounded-2xl p-3" : "rounded-2xl p-4";

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => navigateToTab("gpa")}
        className="text-[13px] font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Xem chi tiết
      </button>
      <button
        type="button"
        onClick={() => setIsScoreHidden((currentValue) => !currentValue)}
        className="inline-flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label={isScoreHidden ? "Hiện điểm GPA" : "Ẩn điểm GPA"}
        title={isScoreHidden ? "Hiện điểm GPA" : "Ẩn điểm GPA"}
      >
        {isScoreHidden ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
    </>
  );

  return (
    <DashboardCard title="GPA hiện tại" headerActions={headerActions} className="h-full" contentClassName="h-full">
      <div className="flex flex-1 flex-col">
        <div className={compact ? "grid gap-3 px-0.5 pb-0.5" : "grid gap-4 px-0.5 pb-0.5"}>
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(insetCardClassName, "overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-white dark:from-sky-950/35 dark:via-blue-950/20 dark:to-slate-950")}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600 dark:text-sky-300">Hệ 4</p>
              <div className="relative mt-2 flex items-end gap-2 tracking-tight">
                <span
                  className={cn(
                    scoreTextClassName,
                    "text-slate-900 transition-all duration-300 dark:text-slate-50",
                    isScoreHidden && "select-none text-slate-500/85 dark:text-slate-300/80",
                  )}
                >
                  {isScoreHidden ? maskedText : gpa4}
                </span>
                <span className={compact ? "mb-1 text-base font-semibold text-sky-500/70 dark:text-sky-300/70" : "mb-1 text-lg font-semibold text-sky-500/70 dark:text-sky-300/70"}>/ 4.0</span>
                {isScoreHidden ? (
                  <span className="pointer-events-none absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 rounded-lg bg-[repeating-linear-gradient(-55deg,rgba(125,211,252,0.14)_0px,rgba(125,211,252,0.14)_7px,rgba(255,255,255,0.7)_7px,rgba(255,255,255,0.7)_14px)] dark:bg-[repeating-linear-gradient(-55deg,rgba(56,189,248,0.18)_0px,rgba(56,189,248,0.18)_7px,rgba(15,23,42,0.45)_7px,rgba(15,23,42,0.45)_14px)]" />
                ) : null}
              </div>
            </div>

            <div className={cn(insetCardClassName, "overflow-hidden bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white dark:from-violet-950/35 dark:via-fuchsia-950/15 dark:to-slate-950")}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-600 dark:text-violet-300">Hệ 10</p>
              <div className="relative mt-2">
                <p
                  className={cn(
                    "text-2xl font-bold tracking-tight text-slate-900 transition-all duration-300 dark:text-slate-50",
                    isScoreHidden && "select-none text-slate-500/85 dark:text-slate-300/80",
                  )}
                >
                  {isScoreHidden ? maskedText : gpa10}
                </p>
                {isScoreHidden ? (
                  <span className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 rounded-lg bg-[repeating-linear-gradient(-55deg,rgba(192,132,252,0.16)_0px,rgba(192,132,252,0.16)_7px,rgba(255,255,255,0.7)_7px,rgba(255,255,255,0.7)_14px)] dark:bg-[repeating-linear-gradient(-55deg,rgba(167,139,250,0.18)_0px,rgba(167,139,250,0.18)_7px,rgba(15,23,42,0.45)_7px,rgba(15,23,42,0.45)_14px)]" />
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className={cn(insetCardClassName, "self-start bg-slate-50 dark:bg-slate-900")}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Trạng thái</p>
              <p className="mt-2 text-[13px] font-semibold leading-5 text-slate-700 dark:text-slate-200">{statusText}</p>
            </div>

            <div className={compact ? "flex min-w-[96px] self-start items-center justify-center rounded-2xl bg-emerald-50 px-3 py-3 dark:bg-emerald-950/20" : "flex min-w-[110px] self-start items-center justify-center rounded-2xl bg-emerald-50 px-4 py-4 dark:bg-emerald-950/20"}>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-300">
                {isScoreHidden ? "Đang ẩn điểm" : "Đang hiển thị"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
