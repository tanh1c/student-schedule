import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import { navigateToTab } from "@/features/dashboard/components/DashboardHelpers";
import { cn } from "@lib/utils";

const GPA_CARD_HIDDEN_KEY = "dashboard_gpa_card_hidden";
const GPA_HIDDEN_LOTTIE_URL = "https://lottie.host/40aa4f34-df5a-41f4-828d-29d2e450d905/pTK9Pq8fMc.lottie";

function getScorePercent(score, maxScore) {
  if (!Number.isFinite(score) || maxScore <= 0) return 0;
  return Math.min(100, Math.max(0, (score / maxScore) * 100));
}

export function DashboardGpaCard({ snapshot, compact = false }) {
  const gpa4Value = Number(snapshot.gpa.snapshot?.gpa4);
  const gpa10Value = Number(snapshot.gpa.snapshot?.gpa10);
  const gpa4 = Number.isFinite(gpa4Value) ? gpa4Value.toFixed(2) : "--";
  const gpa10 = Number.isFinite(gpa10Value) ? gpa10Value.toFixed(2) : "--";
  const gpa4Progress = getScorePercent(gpa4Value, 4);
  const gpa10Progress = getScorePercent(gpa10Value, 10);
  const [isScoreHidden, setIsScoreHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(GPA_CARD_HIDDEN_KEY) === "true";
  });
  const [canRenderHiddenLottie, setCanRenderHiddenLottie] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(GPA_CARD_HIDDEN_KEY, isScoreHidden ? "true" : "false");
  }, [isScoreHidden]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateCapability = () => {
      setCanRenderHiddenLottie(mediaQuery.matches && !compact);
    };

    updateCapability();
    mediaQuery.addEventListener("change", updateCapability);

    return () => {
      mediaQuery.removeEventListener("change", updateCapability);
    };
  }, [compact]);

  const scoreTextClassName = compact ? "text-3xl font-extrabold" : "text-5xl font-extrabold";
  const gpa10ScoreTextClassName = compact ? "text-3xl font-extrabold" : "text-4xl font-extrabold";
  const insetCardClassName = compact ? "rounded-2xl px-3 py-3.5" : "rounded-3xl px-5 py-4";

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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col py-0.5">
        {isScoreHidden ? (
          <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-zinc-50 p-5 dark:from-slate-900/65 dark:via-blue-950/25 dark:to-zinc-950">
            <div className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col items-start gap-2 opacity-65 sm:flex" aria-hidden="true">
              <span className="h-2 w-12 rounded-full bg-slate-300/55 dark:bg-slate-500/25" />
              <span className="h-2 w-8 rounded-full bg-blue-300/45 dark:bg-blue-500/20" />
              <span className="h-2 w-10 rounded-full bg-zinc-300/45 dark:bg-zinc-500/20" />
            </div>
            <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2 opacity-65 sm:flex" aria-hidden="true">
              <span className="h-2 w-10 rounded-full bg-zinc-300/45 dark:bg-zinc-500/20" />
              <span className="h-2 w-8 rounded-full bg-blue-300/45 dark:bg-blue-500/20" />
              <span className="h-2 w-12 rounded-full bg-slate-300/55 dark:bg-slate-500/25" />
            </div>

            <div className="relative z-10 grid place-items-center">
              <div className="relative flex h-[132px] w-[132px] max-w-full items-center justify-center overflow-hidden rounded-[2rem] bg-white/75 shadow-inner dark:bg-slate-950/35 sm:h-[144px] sm:w-[144px]">
                <div className="absolute inset-x-5 bottom-4 h-10 rounded-full bg-slate-400/20 blur-xl dark:bg-blue-400/15" />
                {canRenderHiddenLottie ? (
                  <DotLottieReact
                    src={GPA_HIDDEN_LOTTIE_URL}
                    loop
                    autoplay
                    className="relative z-10 h-[116px] w-[116px] sm:h-[128px] sm:w-[128px]"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                ) : (
                  <div className="relative z-10 flex h-[104px] w-[104px] items-center justify-center rounded-[1.75rem] bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
                    <Lock className="h-10 w-10 opacity-90" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={compact ? "grid min-h-0 min-w-0 flex-1 grid-cols-2 gap-3 p-0.5" : "grid min-h-0 min-w-0 flex-1 grid-cols-2 gap-4 p-0.5"}>
            <div className={cn(insetCardClassName, "relative flex min-h-[116px] min-w-0 flex-col justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-white dark:from-sky-950/35 dark:via-blue-950/20 dark:to-slate-950")}>
              <span className="pointer-events-none absolute bottom-1 right-4 text-4xl font-black tracking-tighter text-sky-200/45 dark:text-sky-500/10" aria-hidden="true">
                /4
              </span>
              <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600 dark:text-sky-300">Hệ 4</p>
              <div className="relative z-10 mt-3 flex min-w-0 items-end gap-1.5 tracking-tight">
                <span className={cn(scoreTextClassName, "text-slate-900 dark:text-slate-50")}>{gpa4}</span>
                <span className={compact ? "mb-1 text-sm font-semibold text-sky-500/70 dark:text-sky-300/70" : "mb-1 text-lg font-semibold text-sky-500/70 dark:text-sky-300/70"}>/ 4.0</span>
              </div>
              <div className="relative z-10 mt-4 h-1.5 overflow-hidden rounded-full bg-white/80 dark:bg-slate-800/80">
                <div className="h-full rounded-full bg-sky-500/75 dark:bg-sky-400/80" style={{ width: `${gpa4Progress}%` }} />
              </div>
            </div>

            <div className={cn(insetCardClassName, "relative flex min-h-[116px] min-w-0 flex-col justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white dark:from-violet-950/35 dark:via-fuchsia-950/15 dark:to-slate-950")}>
              <span className="pointer-events-none absolute bottom-1 right-4 text-4xl font-black tracking-tighter text-violet-200/45 dark:text-violet-500/10" aria-hidden="true">
                /10
              </span>
              <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-600 dark:text-violet-300">Hệ 10</p>
              <div className="relative z-10 mt-3 flex min-w-0 items-end gap-1.5 tracking-tight">
                <span className={cn(gpa10ScoreTextClassName, "text-slate-900 dark:text-slate-50")}>{gpa10}</span>
                <span className={compact ? "mb-1 text-sm font-semibold text-violet-500/70 dark:text-violet-300/70" : "mb-1 text-lg font-semibold text-violet-500/70 dark:text-violet-300/70"}>/ 10</span>
              </div>
              <div className="relative z-10 mt-4 h-1.5 overflow-hidden rounded-full bg-white/80 dark:bg-slate-800/80">
                <div className="h-full rounded-full bg-violet-500/75 dark:bg-violet-400/80" style={{ width: `${gpa10Progress}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
