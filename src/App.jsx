import React, { useState, useEffect } from "react";
import {
  CalendarClock,
  GraduationCap,
  Menu,
  NotebookPen,
  NotebookTabs,
  PanelsTopLeft,
  ScrollText,
  SunMedium,
  Moon,
  LayoutDashboard,
  BadgePercent,
  X,
  ChevronRight,
  Home,
  Route,
  Shield,
  History
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { Badge } from "./components/ui/badge";
import { useThemeMode } from "./contexts/ThemeContext";

import LandingPage from "./components/LandingPage";
import ScheduleTab from "./components/ScheduleTab";
import ExamTab from "./components/ExamTab";
import CurriculumTab from "./components/CurriculumTab";
import GpaTab from "./components/GpaTab";
import TeachingScheduleTab from "./components/TeachingScheduleTab";
import NotesPlansTab from "./components/NotesPlansTab";
import PreviewRegistrationTab from "./components/PreviewRegistrationTab";
import RegistrationTab from "./components/RegistrationTab";
import RoadmapTab from "./components/RoadmapTab";
import AppLogo from "./components/AppLogo";
import DataManagement from "./components/DataManagement";
import WelcomeFeedback from "./components/WelcomeFeedback";
import SecurityPage from "./components/SecurityPage";
import ChangelogPage from "./components/ChangelogPage";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { CloudUpload } from "lucide-react";

const menuItems = [
  { id: "schedule", label: "Thời khóa biểu", shortLabel: "TKB", icon: CalendarClock },
  { id: "exam", label: "Lịch thi", shortLabel: "Thi", icon: NotebookPen },
  { id: "curriculum", label: "CTĐT", shortLabel: "CTĐT", icon: GraduationCap },
  { id: "gpa", label: "Tính GPA", shortLabel: "GPA", icon: BadgePercent },
  { id: "teaching", label: "Lịch giảng dạy", shortLabel: "Dạy", icon: LayoutDashboard },
  { id: "notes", label: "Ghi chú", shortLabel: "Note", icon: ScrollText },
  { id: "roadmap", label: "Roadmap học tập", shortLabel: "Plan", icon: Route },
  { id: "registration", label: "ĐKMH", shortLabel: "ĐKMH", icon: NotebookTabs },
  { id: "preview", label: "Preview", shortLabel: "Preview", icon: ScrollText },
  { id: "security", label: "Bảo mật", shortLabel: "BM", icon: Shield },
  { id: "changelog", label: "Changelog", shortLabel: "Log", icon: History }
];

function App() {
  // Check if user has visited before
  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem('hasVisitedApp');
  });
  const [activeTab, setActiveTab] = useState("schedule");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useThemeMode();

  const handleEnterApp = () => {
    localStorage.setItem('hasVisitedApp', 'true');
    setShowLanding(false);
  };

  const handleGoToLanding = () => {
    setShowLanding(true);
  };

  // Show landing page
  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "schedule":
        return <ScheduleTab />;
      case "exam":
        return <ExamTab />;
      case "curriculum":
        return <CurriculumTab />;
      case "gpa":
        return <GpaTab />;
      case "teaching":
        return <TeachingScheduleTab />;
      case "notes":
        return <NotesPlansTab />;
      case "roadmap":
        return <RoadmapTab />;
      case "registration":
        return <RegistrationTab />;
      case "preview":
        return <PreviewRegistrationTab />;
      case "security":
        return <SecurityPage />;
      case "changelog":
        return <ChangelogPage />;
      default:
        return <ScheduleTab />;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex min-h-screen">
        {/* Desktop Sidebar - Collapsible */}
        <aside
          className={`fixed left-0 top-0 z-50 h-full border-r bg-card/95 backdrop-blur-lg transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'w-16' : 'w-56'}
            hidden lg:flex lg:flex-col`}
        >
          {/* Logo */}
          <div className={`flex items-center gap-2 border-b px-3 py-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <AppLogo size={36} />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">TKB Smart</p>
                <p className="truncate text-[10px] text-muted-foreground">Dashboard SV</p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                      ${sidebarCollapsed ? 'justify-center px-2' : ''}
                    `}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? '' : 'group-hover:text-primary'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Bottom Controls */}
          <div className={`border-t p-3 ${sidebarCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-3'}`}>
            {/* Data Management - Backup & Restore */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-bold transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:scale-95 ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title="Sao lưu & Khôi phục"
                >
                  <CloudUpload className="h-4 w-4" />
                  {!sidebarCollapsed && <span>Sao lưu & Sync</span>}
                  {!sidebarCollapsed && <Badge variant="secondary" className="ml-auto text-[8px] h-4 px-1 bg-indigo-100 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800">FREE</Badge>}
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="end" className="w-72 p-4 rounded-3xl shadow-2xl border-indigo-100 dark:border-indigo-900 ml-2">
                <DataManagement />
              </PopoverContent>
            </Popover>

            {/* Home Button */}
            <button
              onClick={handleGoToLanding}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
              title="Về trang chủ"
            >
              <Home className="h-4 w-4" />
              {!sidebarCollapsed && <span>Trang chủ</span>}
            </button>

            {/* Theme Toggle */}
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} rounded-lg bg-accent/50 px-3 py-2`}>
              {!sidebarCollapsed && (
                <span className="text-xs font-medium text-muted-foreground">
                  {darkMode ? 'Dark' : 'Light'}
                </span>
              )}
              <button
                onClick={toggleDarkMode}
                className="rounded-md p-1.5 transition-colors hover:bg-accent"
                title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                {darkMode ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              {!sidebarCollapsed && <span>Thu gọn</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-50 h-full w-72 border-r bg-card/95 backdrop-blur-lg transition-transform duration-300 overflow-y-auto flex flex-col lg:hidden
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div className="flex items-center gap-2">
              <AppLogo size={36} />
              <div>
                <p className="text-sm font-bold">TKB Smart</p>
                <p className="text-[10px] text-muted-foreground">Dashboard sinh viên</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Bottom Controls */}
          <div className="border-t p-4 space-y-3">
            {/* Data Management for Mobile - Fixed to match desktop logic */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 transition-all active:scale-95"
                >
                  <CloudUpload className="h-5 w-5" />
                  <span>Sao lưu & Đồng bộ</span>
                  <Badge variant="secondary" className="ml-auto text-[8px] h-4 px-1 bg-indigo-100 dark:bg-indigo-950">FREE</Badge>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl w-[92%] mx-auto p-4">
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

            {/* Home Button */}
            <button
              onClick={handleGoToLanding}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="h-5 w-5" />
              <span>Về trang chủ</span>
            </button>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between rounded-lg bg-accent/50 px-4 py-3">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                <span className="text-sm font-medium">{darkMode ? 'Dark mode' : 'Light mode'}</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'}`}>
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg border p-2 transition-colors hover:bg-accent"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  <AppLogo size={32} />
                  <span className="text-base font-bold">TKB Smart</span>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="rounded-lg border p-2 transition-colors hover:bg-accent"
              >
                {darkMode ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="sticky top-0 z-30 hidden border-b bg-background/80 backdrop-blur-lg lg:block">
            <div className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Không gian làm việc
                </p>
                <h1 className="text-lg font-semibold">
                  {menuItems.find((m) => m.id === activeTab)?.label}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground xl:inline">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="min-h-[calc(100vh-57px)] pb-20 lg:pb-6">
            <div className="mx-auto max-w-7xl">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-all
                  ${isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
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
      <WelcomeFeedback />
    </div>
  );
}

export default App;
