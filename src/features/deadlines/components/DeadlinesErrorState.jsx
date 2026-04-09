import React from "react";
import { AlertCircle, CalendarClock, LogIn, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MyBKLoginCard from "@/components/MyBKLoginCard";

export default function DeadlinesErrorState({
  error,
  showLoginForm,
  loginJustCompleted,
  onShowLoginForm,
  onHideLoginForm,
  onRefresh,
  onReloadDeadlines,
  onLoginSuccess,
}) {
  const isTokenError =
    error.toLowerCase().includes("token") ||
    error.toLowerCase().includes("expired") ||
    error.toLowerCase().includes("session") ||
    error.toLowerCase().includes("đăng nhập");

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <ScrollArea className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-md space-y-6">
          {loginJustCompleted && showLoginForm ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                <CalendarClock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                Đăng nhập thành công!
              </h3>
              <p className="text-sm text-muted-foreground">
                Bấm nút bên dưới để tải deadline LMS.
              </p>
              <Button
                onClick={onReloadDeadlines}
                className="w-full gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                Tải Deadline LMS
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 shadow-lg">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  Không thể kết nối LMS
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">{error}</p>
              </div>

              {isTokenError ? (
                <div className="space-y-4">
                  {!showLoginForm ? (
                    <div className="space-y-3">
                      <p className="text-center text-sm text-muted-foreground">
                        Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp
                        tục.
                      </p>
                      <Button
                        onClick={onShowLoginForm}
                        className="w-full gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                        size="lg"
                      >
                        <LogIn className="h-4 w-4" />
                        Đăng nhập MyBK
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onRefresh}
                        className="w-full gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Thử lại không đăng nhập
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <MyBKLoginCard
                        onScheduleFetched={() => {}}
                        onError={(currentError) =>
                          console.log("Login error:", currentError)
                        }
                        onLoginSuccess={onLoginSuccess}
                      />
                      <Button
                        variant="ghost"
                        onClick={onHideLoginForm}
                        className="w-full text-muted-foreground"
                      >
                        Quay lại
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={onRefresh} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Thử lại
                </Button>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
