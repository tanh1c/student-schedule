import React, { useState } from "react";
import {
  CalendarClock,
  GraduationCap,
  Map,
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
  ChevronRight
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { useThemeMode } from "./contexts/ThemeContext";

import ScheduleTab from "./components/ScheduleTab";
import ExamTab from "./components/ExamTab";
import CurriculumTab from "./components/CurriculumTab";
import GpaTab from "./components/GpaTab";
import TeachingScheduleTab from "./components/TeachingScheduleTab";
import NotesPlansTab from "./components/NotesPlansTab";
import CampusMapTab from "./components/CampusMapTab";
import PreviewRegistrationTab from "./components/PreviewRegistrationTab";
import RegistrationTab from "./components/RegistrationTab";

const menuItems = [
  { id: "schedule", label: "Thời khóa biểu", shortLabel: "TKB", icon: CalendarClock },
  { id: "exam", label: "Lịch thi", shortLabel: "Thi", icon: NotebookPen },
  { id: "curriculum", label: "CTĐT", shortLabel: "CTĐT", icon: GraduationCap },
  { id: "gpa", label: "Tính GPA", shortLabel: "GPA", icon: BadgePercent },
  { id: "teaching", label: "Lịch giảng dạy", shortLabel: "Dạy", icon: LayoutDashboard },
  { id: "notes", label: "Ghi chú", shortLabel: "Note", icon: ScrollText },
  { id: "map", label: "Bản đồ", shortLabel: "Map", icon: Map },
  { id: "registration", label: "ĐKMH", shortLabel: "ĐKMH", icon: NotebookTabs },
  { id: "preview", label: "Preview", shortLabel: "Preview", icon: ScrollText }
];

function App() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useThemeMode();

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
      case "map":
        return <CampusMapTab />;
      case "registration":
        return <RegistrationTab />;
      case "preview":
        return <PreviewRegistrationTab />;
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PanelsTopLeft className="h-5 w-5" />
            </div>
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
          className={`fixed left-0 top-0 z-50 h-full w-72 border-r bg-card/95 backdrop-blur-lg transition-transform duration-300 lg:hidden
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PanelsTopLeft className="h-5 w-5" />
              </div>
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

          {/* Theme Toggle */}
          <div className="border-t p-4">
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <PanelsTopLeft className="h-4 w-4" />
                  </div>
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
    </div>
  );
}

export default App;
