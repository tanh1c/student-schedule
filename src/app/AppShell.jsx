import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  CloudUpload,
  Home,
  Menu,
  Moon,
  SunMedium,
  X,
} from "lucide-react";
import AppLogo from "@components/AppLogo";
import DataManagement from "@components/DataManagement";
import LandingPage from "@components/LandingPage";
import WelcomeFeedback from "@components/WelcomeFeedback";
import { defaultTabId, menuItems, mobileNavMenuItems } from "@app/menuConfig";
import { tabRegistry } from "@app/tabRegistry";
import { Badge } from "@shared/ui/badge";
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

function AppShell() {
  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem(HAS_VISITED_STORAGE_KEY);
  });
  const [activeTab, setActiveTab] = useState(defaultTabId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useThemeMode();

  const activeMenuItem = useMemo(() => {
    return menuItems.find((item) => item.id === activeTab) ?? menuItems[0];
  }, [activeTab]);

  const activeTabKey = tabRegistry[activeTab] ? activeTab : defaultTabId;
  const ActiveTabComponent = tabRegistry[activeTabKey];

  const handleEnterApp = () => {
    localStorage.setItem(HAS_VISITED_STORAGE_KEY, "true");
    setShowLanding(false);
  };

  const handleGoToLanding = () => {
    setShowLanding(true);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
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
            className={`flex h-[72px] items-center gap-2 border-b px-3 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <AppLogo size={36} />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">TKB Smart</p>
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
                <p className="text-sm font-bold">TKB Smart</p>
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
                    TKB Smart
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
            </div>
          </header>

          <header className="sticky top-0 z-30 hidden h-[72px] border-b bg-background/80 backdrop-blur-lg lg:block">
            <div className="flex h-full items-center justify-between px-6">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Không gian làm việc
                </p>
                <h1 className="text-lg font-semibold">{activeMenuItem.label}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground xl:inline">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                  })}
                </span>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-57px)] w-full max-w-full overflow-x-hidden pb-20 lg:pb-6">
            <div className="mx-auto w-full max-w-[1600px] overflow-hidden">
              <ActiveTabComponent />
            </div>
          </main>
        </div>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg lg:hidden"
        style={{
          transform: "translateZ(0)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "font-semibold" : ""
                  }`}
                >
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-muted-foreground transition-all"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">Thêm</span>
          </button>
        </div>
      </nav>

      <WelcomeFeedback hideOnMobile={activeTab === "gpa"} />
    </div>
  );
}

export default AppShell;
