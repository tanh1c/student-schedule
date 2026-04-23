import React from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  LogOut,
  UserRound,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import mybkApi from "@/services/mybkApi";
import { MYBK_AUTH_CHANGE_EVENT, dispatchMybkAuthChange } from "@shared/constants/mybkAuth";

function getDisplayName(studentInfo) {
  if (!studentInfo) return "MyBK";
  const fullName = `${studentInfo.lastName || ""} ${studentInfo.firstName || ""}`.trim();
  return fullName || studentInfo.fullName || "MyBK";
}

function getStudentCode(studentInfo) {
  return studentInfo?.code || studentInfo?.id || "Đăng nhập MyBK";
}

export default function MyBKHeaderAuth({ compact = false, desktopHeader = false }) {
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(() => mybkApi.hasSavedCredentials());
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [studentInfo, setStudentInfo] = React.useState(() => mybkApi.getUserData());
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => mybkApi.isAuthenticated());
  const [error, setError] = React.useState("");
  const [autoLoginAttempted, setAutoLoginAttempted] = React.useState(false);

  const loadStudentProfile = React.useCallback(async () => {
    if (!mybkApi.isAuthenticated()) {
      setIsAuthenticated(false);
      setStudentInfo(null);
      return;
    }

    setIsAuthenticated(true);
    const cachedUser = mybkApi.getUserData();
    if (cachedUser) {
      setStudentInfo(cachedUser);
    }

    const result = await mybkApi.getStudentInfo();
    if (result.success && result.data) {
      setStudentInfo(result.data);
      setIsAuthenticated(true);
    }
  }, []);

  const performLogin = React.useCallback(
    async ({ loginUsername, loginPassword, saveCredentials = rememberMe, silent = false }) => {
      setLoading(true);
      if (!silent) {
        setError("");
      }

      try {
        const result = await mybkApi.login(loginUsername, loginPassword);
        if (!result.success) {
          if (!silent) {
            setError(result.error || "Đăng nhập thất bại");
          }
          return false;
        }

        if (saveCredentials) {
          mybkApi.saveCredentials(loginUsername, loginPassword);
        } else {
          mybkApi.clearSavedCredentials();
        }

        setPassword("");
        await loadStudentProfile();
        dispatchMybkAuthChange({ authenticated: true });
        return true;
      } catch (_error) {
        if (!silent) {
          setError("Không thể kết nối đến server");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadStudentProfile, rememberMe],
  );

  React.useEffect(() => {
    void loadStudentProfile();

    const savedCredentials = mybkApi.getSavedCredentials();
    if (savedCredentials) {
      setUsername(savedCredentials.username);
      setRememberMe(true);
    }

    const handleAuthChange = () => {
      void loadStudentProfile();
    };

    window.addEventListener(MYBK_AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("focus", handleAuthChange);

    return () => {
      window.removeEventListener(MYBK_AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("focus", handleAuthChange);
    };
  }, [loadStudentProfile]);

  React.useEffect(() => {
    const tryAutoLogin = async () => {
      if (autoLoginAttempted || isAuthenticated || loading) return;

      const savedCredentials = mybkApi.getSavedCredentials();
      if (!savedCredentials) {
        setAutoLoginAttempted(true);
        return;
      }

      setAutoLoginAttempted(true);
      const success = await performLogin({
        loginUsername: savedCredentials.username,
        loginPassword: savedCredentials.password,
        saveCredentials: true,
        silent: true,
      });

      if (!success) {
        setPassword("");
      }
    };

    void tryAutoLogin();
  }, [autoLoginAttempted, isAuthenticated, loading, performLogin]);

  const handleLogin = async (event) => {
    event?.preventDefault();
    const success = await performLogin({
      loginUsername: username,
      loginPassword: password,
      saveCredentials: rememberMe,
      silent: false,
    });
    if (success) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    await mybkApi.logout(true);
    setStudentInfo(null);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setRememberMe(false);
    dispatchMybkAuthChange({ authenticated: false });
  };

  if (isAuthenticated) {
    const displayName = getDisplayName(studentInfo);
    const studentCode = getStudentCode(studentInfo);
    const initials = displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");

    if (desktopHeader) {
      return (
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-semibold text-white shadow-sm">
            {initials || "SV"}
          </div>
          <div className="hidden min-w-0 sm:flex sm:flex-col">
            <p className="max-w-[140px] truncate text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">
              {displayName}
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {studentCode}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={handleLogout}
            title="Đăng xuất MyBK"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className={compact ? "flex items-center gap-2" : "flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-2.5 py-1.5 shadow-sm"}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-semibold text-white shadow-sm">
          {initials || "SV"}
        </div>
        {!compact ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{studentCode}</p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={compact ? "h-9 w-9 rounded-full" : "ml-0.5 h-8 rounded-full px-2.5"}
          onClick={handleLogout}
          title="Đăng xuất MyBK"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={compact ? "outline" : "default"}
          className={
            compact
              ? "h-10 rounded-full px-3"
              : desktopHeader
                ? "h-10 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                : "h-10 rounded-full px-4 shadow-sm"
          }
        >
          <LogIn className="mr-2 h-4 w-4" />
          {!compact ? "Đăng nhập MyBK" : "MyBK"}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </div>
            Đăng nhập MyBK
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleLogin}>
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="mybk-username">
              Tài khoản MyBK
            </label>
            <Input
              id="mybk-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Tài khoản MyBK"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="mybk-password">
              Mật khẩu
            </label>
            <div className="relative">
              <Input
                id="mybk-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mật khẩu"
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Ghi nhớ đăng nhập
            </label>
            <Badge variant="secondary" className="rounded-full">
              CAS MyBK
            </Badge>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-full"
            disabled={loading || !username || !password}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            {loading ? "Đang đăng nhập..." : "Đăng nhập & kết nối"}
          </Button>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            Đăng nhập bằng tài khoản MyBK. Nếu đã bật ghi nhớ đăng nhập, header sẽ tự kết nối lại khi bạn quay lại web.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
