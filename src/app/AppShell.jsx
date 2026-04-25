import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  CloudUpload,
  Home,
  Menu,
  MessageSquareMore,
  Moon,
  RefreshCcw,
  Search,
  SunMedium,
  X,
} from "lucide-react";
import AppLogo from "@shared/components/AppLogo";
import DataManagement from "@shared/components/DataManagement";
import MyBKHeaderAuth from "@shared/components/MyBKHeaderAuth";
import LandingPage from "@components/LandingPage";
import WelcomeFeedback from "@shared/components/WelcomeFeedback";
import {
  defaultTabId,
  menuItems,
  mobileNavMenuItems,
} from "@app/menuConfig";
import { WORKSPACE_TAB_CHANGE_EVENT } from "@app/navigationEvents";
import { tabRegistry } from "@app/tabRegistry";
import { Badge } from "@shared/ui/badge";
import MobileMoreSheet from "@app/MobileMoreSheet";
import { MYBK_AUTH_CHANGE_EVENT, MYBK_WORKSPACE_SYNC_EVENT } from "@shared/constants/mybkAuth";
import { warmMybkWorkspaceData } from "@/services/mybkWorkspaceWarmup";
import mybkApi from "@/services/mybkApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/ui/popover";
import { Switch } from "@shared/ui/switch";
import { useThemeMode } from "@shared/hooks/useThemeMode";

const HAS_VISITED_STORAGE_KEY = "hasVisitedApp";
const ACTIVE_TAB_STORAGE_KEY = "activeWorkspaceTab";
const FAVORITE_TABS_STORAGE_KEY = "favoriteWorkspaceTabs";
const RECENT_TABS_STORAGE_KEY = "recentWorkspaceTabs";
const DEADLINES_STORAGE_KEY = "lms_cache_deadlines";
const CONVERSATIONS_STORAGE_KEY = "lms_cache_conversations";

const readHeaderSignals = () => {
  try {
    const deadlinesPayload = JSON.parse(localStorage.getItem(DEADLINES_STORAGE_KEY) || "null");
    const conversationsPayload = JSON.parse(localStorage.getItem(CONVERSATIONS_STORAGE_KEY) || "null");
    const urgentDeadlines =
      (deadlinesPayload?.deadlines || []).filter((item) => {
        const timestamp = item?.dayTimestamp;
        if (!timestamp) return false;
        const now = Math.floor(Date.now() / 1000);
        return timestamp >= now && timestamp - now <= (3 * 24 * 60 * 60);
      }).length;
    const unreadMessages = (conversationsPayload?.conversations || []).filter((item) => !item.isread).length;

    return {
      urgentDeadlines,
      unreadMessages,
    };
  } catch (_error) {
    return {
      urgentDeadlines: 0,
      unreadMessages: 0,
    };
  }
};

const getStoredTabList = (storageKey) => {
  try {
    const storedValue = localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (tabId) => typeof tabId === "string" && menuItems.some((item) => item.id === tabId),
    );
  } catch (error) {
    console.error(`Error reading tab list from ${storageKey}:`, error);
    return [];
  }
};

const persistTabList = (storageKey, value) => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

const getStoredActiveTab = () => {
  try {
    const storedTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    const isValidTab =
      storedTab &&
      menuItems.some((item) => item.id === storedTab) &&
      tabRegistry[storedTab];

    return isValidTab ? storedTab : defaultTabId;
  } catch (error) {
    console.error("Error reading active workspace tab:", error);
    return defaultTabId;
  }
};

function TabLoadingFallback({ label }) {
  return (
    <div className="flex min-h-[calc(100vh-220px)] w-full items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-card/80 p-8 text-center shadow-sm backdrop-blur">
        <div className="mx-auto mb-4 h-11 w-11 animate-pulse rounded-2xl bg-primary/10" />
        <p className="text-sm font-semibold text-foreground">
          Đang tải {label.toLowerCase()}...
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Nội dung của tab sẽ xuất hiện ngay khi chunk được tải xong.
        </p>
      </div>
    </div>
  );
}

class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[AppShell] Tab render failed:", error, errorInfo);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[calc(100vh-180px)] w-full items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border bg-card/90 p-6 text-center shadow-sm">
            <p className="text-base font-semibold text-foreground">
              Tab này vừa gặp lỗi khi tải dữ liệu
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              StuSpace đã chặn màn hình trắng. Hãy thử mở lại tab hoặc làm mới trang.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Thử mở lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppShell() {
  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem(HAS_VISITED_STORAGE_KEY);
  });
  const [activeTab, setActiveTab] = useState(getStoredActiveTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [showLayoutRecovery, setShowLayoutRecovery] = useState(false);
  const [isRecoveringLayout, setIsRecoveringLayout] = useState(false);
  const [favoriteTabIds, setFavoriteTabIds] = useState(() =>
    getStoredTabList(FAVORITE_TABS_STORAGE_KEY),
  );
  const [recentTabIds, setRecentTabIds] = useState(() =>
    getStoredTabList(RECENT_TABS_STORAGE_KEY),
  );
  const [headerSignals, setHeaderSignals] = useState(readHeaderSignals);
  const { darkMode, toggleDarkMode } = useThemeMode();
  const mainContentRef = useRef(null);

  const activeMenuItem = useMemo(() => {
    return menuItems.find((item) => item.id === activeTab) ?? menuItems[0];
  }, [activeTab]);
  const isMoreNavActive = useMemo(() => {
    return !mobileNavMenuItems.some((item) => item.id === activeTab);
  }, [activeTab]);

  const activeTabKey = tabRegistry[activeTab] ? activeTab : defaultTabId;
  const ActiveTabComponent = tabRegistry[activeTabKey];
  const isDashboardLayout = activeTabKey === "dashboard";

  const handleEnterApp = () => {
    localStorage.setItem(HAS_VISITED_STORAGE_KEY, "true");
    setShowLanding(false);
  };

  const handleGoToLanding = () => {
    setShowLanding(true);
  };

  const handleTabChange = useCallback((tabId) => {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tabId);
    setActiveTab(tabId);
    setRecentTabIds((current) => {
      const nextValue = [tabId, ...current.filter((id) => id !== tabId)].slice(0, 6);
      persistTabList(RECENT_TABS_STORAGE_KEY, nextValue);
      return nextValue;
    });
    setSidebarOpen(false);
    setMobileMoreOpen(false);
  }, []);

  const handleToggleFavoriteTab = useCallback((tabId) => {
    setFavoriteTabIds((current) => {
      const nextValue = current.includes(tabId)
        ? current.filter((id) => id !== tabId)
        : [tabId, ...current].slice(0, 8);

      persistTabList(FAVORITE_TABS_STORAGE_KEY, nextValue);
      return nextValue;
    });
  }, []);

  const checkDashboardMobileOverflow = useCallback(() => {
    if (typeof window === "undefined" || activeTabKey !== "dashboard") {
      setShowLayoutRecovery(false);
      return;
    }

    if (window.innerWidth >= 1024) {
      setShowLayoutRecovery(false);
      return;
    }

    const mainElement = mainContentRef.current;
    if (!mainElement) {
      setShowLayoutRecovery(false);
      return;
    }

    const overflowAmount = mainElement.scrollWidth - mainElement.clientWidth;
    setShowLayoutRecovery(overflowAmount > 10);
  }, [activeTabKey]);

  const handleRecoverMobileLayout = useCallback(async () => {
    setIsRecoveringLayout(true);

    try {
      if ("caches" in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
      }
    } catch (error) {
      console.warn("Unable to clear browser caches before reload:", error);
    }

    window.location.reload();
  }, []);

  useEffect(() => {
    const handleExternalTabChange = (event) => {
      const nextTabId = event?.detail?.tabId;

      if (
        typeof nextTabId === "string"
        && menuItems.some((item) => item.id === nextTabId)
        && tabRegistry[nextTabId]
      ) {
        handleTabChange(nextTabId);
      }
    };

    window.addEventListener(WORKSPACE_TAB_CHANGE_EVENT, handleExternalTabChange);
    return () => {
      window.removeEventListener(WORKSPACE_TAB_CHANGE_EVENT, handleExternalTabChange);
    };
  }, [handleTabChange]);

  useEffect(() => {
    let animationFrameId = 0;
    const timeoutId = window.setTimeout(() => {
      animationFrameId = window.requestAnimationFrame(checkDashboardMobileOverflow);
    }, 180);

    const handleViewportChange = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(checkDashboardMobileOverflow);
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
    };
  }, [activeTabKey, checkDashboardMobileOverflow, sidebarOpen, mobileMoreOpen]);

  useEffect(() => {
    const refreshSignals = () => setHeaderSignals(readHeaderSignals());
    refreshSignals();
    window.addEventListener("focus", refreshSignals);
    window.addEventListener("storage", refreshSignals);
    window.addEventListener(MYBK_WORKSPACE_SYNC_EVENT, refreshSignals);

    return () => {
      window.removeEventListener("focus", refreshSignals);
      window.removeEventListener("storage", refreshSignals);
      window.removeEventListener(MYBK_WORKSPACE_SYNC_EVENT, refreshSignals);
    };
  }, [activeTabKey]);

  useEffect(() => {
    const runWarmup = (reason) => {
      void warmMybkWorkspaceData({ reason })
        .then(() => {
          setHeaderSignals(readHeaderSignals());
        })
        .catch((error) => {
          console.warn("[MyBK warmup] Background sync failed:", error);
        });
    };

    const handleMybkAuthChange = (event) => {
      if (event?.detail?.authenticated) {
        runWarmup(event.detail.reason || "login");
      }
    };

    window.addEventListener(MYBK_AUTH_CHANGE_EVENT, handleMybkAuthChange);

    if (mybkApi.isAuthenticated()) {
      runWarmup("existing-session");
    }

    return () => {
      window.removeEventListener(MYBK_AUTH_CHANGE_EVENT, handleMybkAuthChange);
    };
  }, []);

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F9FA] text-foreground dark:bg-slate-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex min-h-screen overflow-x-hidden">
        <aside
          className={`fixed left-0 top-0 z-50 hidden h-full border-r bg-card/95 backdrop-blur-lg transition-all duration-300 ease-in-out lg:flex lg:flex-col ${
            sidebarCollapsed ? "w-16" : "w-56"
          }`}
        >
          <div
            className={`flex h-16 items-center gap-2 border-b px-3 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <AppLogo size={34} />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">StuSpace</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  Dashboard SV
                </p>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive ? "" : "group-hover:text-primary"
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div
            className={`border-t p-3 ${
              sidebarCollapsed
                ? "flex flex-col items-center gap-2"
                : "space-y-3"
            }`}
          >
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 active:scale-95 dark:text-indigo-400 dark:hover:bg-indigo-950/20 ${
                    sidebarCollapsed ? "justify-center px-2" : ""
                  }`}
                  title="Sao lưu & Khôi phục"
                >
                  <CloudUpload className="h-4 w-4" />
                  {!sidebarCollapsed && <span>Sao lưu & Sync</span>}
                  {!sidebarCollapsed && (
                    <Badge
                      variant="secondary"
                      className="ml-auto h-4 border-indigo-200 bg-indigo-100 px-1 text-[8px] dark:border-indigo-800 dark:bg-indigo-950"
                    >
                      FREE
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="end"
                className="ml-2 w-72 rounded-3xl border-indigo-100 p-4 shadow-2xl dark:border-indigo-900"
              >
                <DataManagement />
              </PopoverContent>
            </Popover>

            <button
              onClick={handleGoToLanding}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
                sidebarCollapsed ? "justify-center px-2" : ""
              }`}
              title="Về trang chủ"
            >
              <Home className="h-4 w-4" />
              {!sidebarCollapsed && <span>Trang chủ</span>}
            </button>

            <div
              className={`flex items-center rounded-lg bg-accent/50 px-3 py-2 ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!sidebarCollapsed && (
                <span className="text-xs font-medium text-muted-foreground">
                  {darkMode ? "Dark" : "Light"}
                </span>
              )}
              <button
                onClick={toggleDarkMode}
                className="rounded-md p-1.5 transition-colors hover:bg-accent"
                title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
              >
                {darkMode ? (
                  <SunMedium className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
              {!sidebarCollapsed && <span>Thu gọn</span>}
            </button>
          </div>
        </aside>

        <aside
          className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col overflow-y-auto border-r bg-card/95 backdrop-blur-lg transition-transform duration-300 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div className="flex items-center gap-2">
              <AppLogo size={36} />
              <div>
                <p className="text-sm font-bold">StuSpace</p>
                <p className="text-[10px] text-muted-foreground">
                  Dashboard sinh viên
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="space-y-3 border-t p-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg bg-indigo-50/50 px-4 py-3 text-sm font-bold text-indigo-600 transition-all active:scale-95 dark:bg-indigo-950/20 dark:text-indigo-400">
                  <CloudUpload className="h-5 w-5" />
                  <span>Sao lưu & Đồng bộ</span>
                  <Badge
                    variant="secondary"
                    className="ml-auto h-4 bg-indigo-100 px-1 text-[8px] dark:bg-indigo-950"
                  >
                    FREE
                  </Badge>
                </button>
              </DialogTrigger>
              <DialogContent className="mx-auto w-[92%] rounded-3xl p-4 sm:max-w-md">
                <DialogHeader className="mb-2">
                  <DialogTitle className="flex items-center gap-2">
                    <CloudUpload className="h-5 w-5 text-indigo-600" />
                    Quản lý dữ liệu
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Giao diện quản lý, sao lưu và khôi phục dữ liệu người dùng.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-1">
                  <DataManagement />
                </div>
              </DialogContent>
            </Dialog>

            <button
              onClick={handleGoToLanding}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="h-5 w-5" />
              <span>Về trang chủ</span>
            </button>

            <div className="flex items-center justify-between rounded-lg bg-accent/50 px-4 py-3">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <SunMedium className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {darkMode ? "Dark mode" : "Light mode"}
                </span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </aside>

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "lg:pl-16" : "lg:pl-56"
          }`}
        >
          <header className="sticky top-0 z-30 w-full max-w-full overflow-x-hidden border-b bg-background/80 backdrop-blur-lg lg:hidden">
            <div className="flex w-full min-w-0 items-center justify-between gap-2 px-3 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="shrink-0 rounded-lg border p-2 transition-colors hover:bg-accent"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="shrink-0">
                    <AppLogo size={32} />
                  </div>
                  <span className="truncate text-sm font-bold min-[380px]:text-base">
                    StuSpace
                  </span>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="shrink-0 rounded-lg border p-2 transition-colors hover:bg-accent"
              >
                {darkMode ? (
                  <SunMedium className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <div className="shrink-0">
                <MyBKHeaderAuth compact />
              </div>
            </div>
          </header>

          <header className="sticky top-0 z-30 hidden h-16 border-b border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-950">
            <div className="flex h-full items-center justify-between px-4 xl:px-8">
              <div className="flex min-w-0 flex-1 items-center">
                <div className="hidden w-full max-w-sm sm:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm môn học, tài liệu..."
                      className="w-full rounded-full bg-slate-100 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pr-1 sm:pr-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  type="button"
                  className="relative text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  title={`${headerSignals.urgentDeadlines} deadline gần`}
                >
                  <Bell className="h-5 w-5" />
                  {headerSignals.urgentDeadlines > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-bold text-white dark:border-slate-950">
                      {Math.min(headerSignals.urgentDeadlines, 9)}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  className="relative text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  title={`${headerSignals.unreadMessages} hội thoại chưa đọc`}
                >
                  <MessageSquareMore className="h-5 w-5" />
                  {headerSignals.unreadMessages > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[9px] font-bold text-primary-foreground dark:border-slate-950">
                      {Math.min(headerSignals.unreadMessages, 9)}
                    </span>
                  ) : null}
                </button>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className="text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
                >
                  {darkMode ? (
                    <SunMedium className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                <MyBKHeaderAuth desktopHeader />
              </div>
            </div>
          </header>

          <main ref={mainContentRef} className={`w-full max-w-full overflow-x-hidden pb-28 lg:pb-6 ${isDashboardLayout ? "min-h-[calc(100vh-57px)] lg:h-[calc(100vh-64px)] lg:min-h-[calc(100vh-64px)] lg:overflow-hidden" : "min-h-[calc(100vh-57px)]"}`}>
            <div className={`mx-auto w-full max-w-[1600px] overflow-hidden ${isDashboardLayout ? "lg:h-full" : ""}`}>
              <TabErrorBoundary resetKey={activeTabKey}>
                <Suspense fallback={<TabLoadingFallback label={activeMenuItem.label} />}>
                  <ActiveTabComponent />
                </Suspense>
              </TabErrorBoundary>
            </div>
          </main>
        </div>
      </div>

      <nav
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 justify-center px-3 transition-all duration-200 lg:hidden ${
          sidebarOpen ? "invisible translate-y-6 opacity-0" : "visible flex translate-y-0 opacity-100"
        }`}
        style={{
          transform: "translateZ(0)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <div className="pointer-events-auto relative w-full max-w-[350px] overflow-hidden rounded-full border border-white/20 bg-background/72 px-1.5 py-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/78 dark:shadow-[0_18px_42px_rgba(2,6,23,0.48)]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-primary/5 dark:from-white/5 dark:to-sky-500/10" />
          <div className="relative flex items-center justify-between gap-0.5">
          {mobileNavMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1.5 py-1.5 transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted/65 text-muted-foreground group-hover:bg-accent"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform ${
                      isActive ? "scale-105" : ""
                    }`}
                  />
                </div>
                <span
                  className={`max-w-full truncate text-[9px] font-medium leading-none ${
                    isActive ? "font-semibold tracking-[0.01em]" : ""
                  }`}
                >
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileMoreOpen(true)}
            className={`group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1.5 py-1.5 transition-all ${
              isMoreNavActive || mobileMoreOpen
                ? "text-primary"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                isMoreNavActive || mobileMoreOpen
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/65 text-muted-foreground group-hover:bg-accent"
              }`}
            >
              <Menu className="h-4 w-4" />
            </div>
            <span
              className={`max-w-full truncate text-[9px] font-medium leading-none ${
                isMoreNavActive || mobileMoreOpen ? "font-semibold" : ""
              }`}
            >
              Thêm
            </span>
          </button>
        </div>
        </div>
      </nav>

      <MobileMoreSheet
        open={mobileMoreOpen}
        onOpenChange={setMobileMoreOpen}
        activeTab={activeTab}
        favoriteTabIds={favoriteTabIds}
        recentTabIds={recentTabIds}
        onTabSelect={handleTabChange}
        onToggleFavorite={handleToggleFavoriteTab}
      />

      {showLayoutRecovery && !sidebarOpen && !mobileMoreOpen && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:hidden"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}
        >
          <button
            onClick={handleRecoverMobileLayout}
            disabled={isRecoveringLayout}
            className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/95 px-4 py-3 text-left shadow-lg shadow-amber-900/10 backdrop-blur dark:border-amber-700/40 dark:bg-amber-950/90"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Làm mới giao diện
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/75">
                Phát hiện layout mobile đang bị tràn. Chạm để tải lại app.
              </p>
            </div>
            <RefreshCcw
              className={`h-4.5 w-4.5 shrink-0 text-amber-800 dark:text-amber-200 ${
                isRecoveringLayout ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      )}

      <WelcomeFeedback hideOnMobile={activeTab === "gpa" || activeTab === "dashboard"} />
    </div>
  );
}

export default AppShell;
