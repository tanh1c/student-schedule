import { AlertCircle, Clock, FlaskConical, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BetaWarningBanner({ onDismiss }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-900/50 p-4 sm:p-5 shadow-sm">
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-amber-200/20 dark:bg-amber-900/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-orange-200/20 dark:bg-orange-900/20 rounded-full blur-2xl" />

            <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-amber-200/50 dark:shadow-amber-950/40">
                    <FlaskConical className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-amber-900 dark:text-amber-400/90 text-base sm:text-lg">
                            Tính năng đang thử nghiệm
                        </h3>
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-500 dark:bg-amber-900/40 border-none text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                            Beta
                        </Badge>
                    </div>

                    <p className="text-sm text-amber-800/80 dark:text-amber-400/70 leading-relaxed mb-3">
                        Trang đăng ký môn học đang trong giai đoạn <strong>phát triển</strong>.
                        Một số tính năng có thể <strong>chưa ổn định</strong> hoặc thay đổi trong tương lai.
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/60 dark:bg-amber-950/50 text-amber-700 dark:text-amber-500/90 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Có thể gặp lỗi
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100/60 dark:bg-orange-950/50 text-orange-700 dark:text-orange-500/90 font-medium">
                            <Clock className="h-3 w-3" />
                            Đang cải tiến
                        </span>
                    </div>
                </div>

                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/70 flex items-center justify-center text-amber-600 dark:text-amber-500 transition-colors"
                    title="Ẩn thông báo này"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
