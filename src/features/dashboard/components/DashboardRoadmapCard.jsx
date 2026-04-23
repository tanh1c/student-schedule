import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";

const CAT_MARK_LOTTIE_URL = "https://lottie.host/54788f45-e825-4a15-b41d-552d56542bac/BCicficDD7.lottie";

export function DashboardRoadmapCard() {
  return (
    <DashboardCard
      title="Coming soon"
      headerActions={<span className="h-8 w-8" aria-hidden="true" />}
      className="h-full"
      contentClassName="h-full"
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-4 dark:from-teal-950/25 dark:via-cyan-950/15 dark:to-slate-950">
        <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col items-start gap-2 opacity-70 sm:flex" aria-hidden="true">
          <span className="h-2 w-14 rounded-full bg-teal-300/45 dark:bg-teal-500/20" />
          <span className="h-2 w-9 rounded-full bg-cyan-300/45 dark:bg-cyan-500/20" />
          <span className="h-2 w-12 rounded-full bg-sky-300/35 dark:bg-sky-500/15" />
        </div>
        <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2 opacity-70 sm:flex" aria-hidden="true">
          <span className="h-2 w-12 rounded-full bg-sky-300/35 dark:bg-sky-500/15" />
          <span className="h-2 w-9 rounded-full bg-cyan-300/45 dark:bg-cyan-500/20" />
          <span className="h-2 w-14 rounded-full bg-teal-300/45 dark:bg-teal-500/20" />
        </div>

        <div className="relative z-10 grid place-items-center">
          <div className="relative flex aspect-square h-[152px] w-[152px] items-center justify-center overflow-hidden rounded-[2rem] bg-white/75 shadow-inner dark:bg-slate-950/35">
            <div className="absolute inset-x-6 bottom-5 h-10 rounded-full bg-teal-300/25 blur-xl" />
            <DotLottieReact
              src={CAT_MARK_LOTTIE_URL}
              loop
              autoplay
              className="relative z-10 h-[132px] w-[132px]"
              style={{ width: 132, height: 132 }}
            />
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
