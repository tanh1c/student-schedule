import React from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeadlinesOfflineBanner({ onRefresh }) {
  return (
    <div className="mx-1.5 mt-2 sm:mx-4">
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 dark:border-amber-800 dark:from-amber-950/50 dark:to-orange-950/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
          <WifiOff className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Chế độ Offline
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Đang xem deadline đã lưu. Kết nối server để cập nhật mới nhất.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Thử lại
        </Button>
      </div>
    </div>
  );
}
