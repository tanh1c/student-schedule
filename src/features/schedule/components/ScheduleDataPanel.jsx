import React from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Link as LinkIcon,
  Settings2,
} from "lucide-react";
import MyBKLoginCard from "@components/MyBKLoginCard";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Textarea } from "@components/ui/textarea";
import { cn } from "@lib/utils";

export default function ScheduleDataPanel({
  scheduleDataCount,
  scheduleStatusText,
  isExpanded,
  inputMethod,
  showManualInput,
  scheduleInput,
  onScheduleInputChange,
  onOpenDataPanel,
  onToggleExpanded,
  onOpenMyBK,
  onSmartPaste,
  onToggleManualInput,
  onGenerateSchedule,
  onScheduleFetched,
  viewSwitcher,
}) {
  return (
    <Card className="w-full min-w-0 overflow-hidden border border-border/70 bg-card/95 shadow-sm backdrop-blur">
      <CardHeader className={cn("p-3 sm:p-4", isExpanded && "border-b")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex min-w-0 cursor-pointer items-center gap-3"
            onClick={onToggleExpanded}
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg">Cài đặt & Dữ liệu</CardTitle>
              <CardDescription className="mt-1 line-clamp-2 text-xs sm:text-sm">
                {scheduleStatusText}
              </CardDescription>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2 lg:items-end">
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Badge
                variant="secondary"
                className="rounded-full bg-primary/8 px-2.5 py-1 text-primary"
              >
                {scheduleDataCount > 0 ? `${scheduleDataCount} môn` : "Chưa có dữ liệu"}
              </Badge>
              <Button
                type="button"
                size="sm"
                variant={isExpanded && inputMethod === "sync" ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => onOpenDataPanel("sync")}
              >
                Đồng bộ MyBK
              </Button>
              <Button
                type="button"
                size="sm"
                variant={isExpanded && inputMethod === "manual" ? "default" : "ghost"}
                className="rounded-xl"
                onClick={() => onOpenDataPanel("manual")}
              >
                Nhập thủ công
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={onToggleExpanded}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>

            {scheduleDataCount > 0 && (
              <div className="hidden w-full md:block lg:max-w-fit">{viewSwitcher}</div>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="animate-in slide-in-from-top-2 p-3 sm:p-4">
          <div className="space-y-4">
            {inputMethod === "sync" ? (
              <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Đồng bộ nhanh từ MyBK
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Dùng tài khoản MyBK để lấy dữ liệu mới nhất mà không cần copy thủ công.
                  </p>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="rounded-xl bg-background px-3 py-2 ring-1 ring-border/60">
                      Cách phù hợp nhất khi bạn muốn cập nhật lịch mới hoặc kiểm tra thay đổi theo tuần.
                    </div>
                    {scheduleDataCount > 0 && (
                      <div className="rounded-xl bg-primary/5 px-3 py-2 text-primary ring-1 ring-primary/10">
                        Dữ liệu hiện tại đang có {scheduleDataCount} môn học.
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <MyBKLoginCard
                    onScheduleFetched={onScheduleFetched}
                    onError={(error) => console.error(error)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div
                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                    onClick={onOpenMyBK}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Mở MyBK & Copy</div>
                      <div className="text-xs text-muted-foreground">
                        Ctrl+A sau đó Ctrl+C toàn bộ trang
                      </div>
                    </div>
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div
                    className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 transition-all hover:border-primary/40 hover:bg-primary/10"
                    onClick={onSmartPaste}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-background font-bold text-primary shadow-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-primary">Tự động phân tích</div>
                      <div className="text-xs text-primary/80">
                        Nhấn để đọc từ Clipboard
                      </div>
                    </div>
                    <ClipboardPaste className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/15 p-3 sm:p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Dán dữ liệu nếu cần kiểm soát thủ công
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Hữu ích khi clipboard bị chặn hoặc bạn muốn chỉnh nội dung trước khi xử lý.
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-muted-foreground hover:text-foreground sm:justify-center"
                      onClick={onToggleManualInput}
                    >
                      {showManualInput ? "Ẩn ô nhập" : "Mở ô nhập"}
                      {showManualInput ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {showManualInput && (
                    <div className="animate-in fade-in slide-in-from-top-2 mt-3 space-y-2 duration-300">
                      <Textarea
                        placeholder="Dán dữ liệu thời khóa biểu từ MyBK vào đây..."
                        className="min-h-[100px]"
                        value={scheduleInput}
                        onChange={(event) => onScheduleInputChange(event.target.value)}
                      />
                      <Button
                        className="w-full"
                        onClick={() => onGenerateSchedule(scheduleInput)}
                        disabled={!scheduleInput.trim()}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Xử lý dữ liệu
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
