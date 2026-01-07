import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  GraduationCap,
  Map,
  Menu,
  NotebookPen,
  NotebookTabs,
  PanelsTopLeft,
  ScrollText,
  Sparkles,
  SunMedium,
  Moon,
  LayoutDashboard,
  BadgePercent
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Switch } from "./components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet";
import { Separator } from "./components/ui/separator";
import { useThemeMode } from "./contexts/ThemeContext";

import ScheduleTab from "./components/ScheduleTab";
import ExamTab from "./components/ExamTab";
import CurriculumTab from "./components/CurriculumTab";
import GpaTab from "./components/GpaTab";
import TeachingScheduleTab from "./components/TeachingScheduleTab";
import NotesPlansTab from "./components/NotesPlansTab";
import CampusMapTab from "./components/CampusMapTab";
import PreviewRegistrationTab from "./components/PreviewRegistrationTab";

const menuItems = [
  { id: "schedule", label: "Thời khóa biểu", icon: CalendarClock },
  { id: "exam", label: "Lịch thi", icon: NotebookPen },
  { id: "curriculum", label: "Chương trình đào tạo", icon: GraduationCap },
  { id: "gpa", label: "Tính GPA", icon: BadgePercent },
  { id: "teaching", label: "Lịch giảng dạy", icon: LayoutDashboard },
  { id: "notes", label: "Ghi chú & kế hoạch", icon: ScrollText },
  { id: "map", label: "Bản đồ trường", icon: Map },
  { id: "preview", label: "Preview đăng ký", icon: NotebookTabs }
];

function App() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [now, setNow] = useState(new Date());
  const { darkMode, toggleDarkMode } = useThemeMode();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit"
    }).format(now);
  }, [now]);

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
      case "preview":
        return <PreviewRegistrationTab />;
      default:
        return <ScheduleTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 border-r bg-card/70 backdrop-blur lg:flex lg:flex-col">
          <div className="flex items-center gap-2 px-5 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PanelsTopLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">TKB Smart</p>
              <p className="text-xs text-muted-foreground">Dashboard sinh viên</p>
            </div>
          </div>
          <Separator />
          <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
          <div className="px-4 pb-6">
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Chế độ hiển thị</CardTitle>
                <CardDescription>
                  Chuyển đổi giao diện sáng/tối nhanh chóng.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {darkMode ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                  <span>{darkMode ? "Dark mode" : "Light mode"}</span>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </CardContent>
            </Card>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 lg:px-8">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="lg:hidden" variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <PanelsTopLeft className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">TKB Smart</p>
                        <p className="text-xs text-muted-foreground">
                          Dashboard sinh viên
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <Button
                            key={item.id}
                            variant={isActive ? "default" : "ghost"}
                            className="w-full justify-start gap-3"
                            onClick={() => setActiveTab(item.id)}
          >
                            <Icon className="h-5 w-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {darkMode ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <SunMedium className="h-4 w-4" />
                        )}
                        <span>{darkMode ? "Dark mode" : "Light mode"}</span>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    Student control center
                  </p>
                  <p className="text-lg font-semibold">Hồ sơ học tập</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="hidden rounded-full px-3 py-1 text-xs md:inline-flex">
                  {formattedDate}
                </Badge>
                <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={toggleDarkMode}>
                  {darkMode ? <SunMedium className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  {darkMode ? "Chế độ sáng" : "Chế độ tối"}
                </Button>
                <Badge className="flex items-center gap-1 rounded-full px-3 py-1 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  UI nâng cấp
                </Badge>
              </div>
            </div>
          </header>

          <main className="px-4 pb-12 pt-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <Card className="relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardDescription className="text-sm">Xin chào,</CardDescription>
                        <CardTitle className="text-2xl">Bảng điều khiển học tập</CardTitle>
                      </div>
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                        {formattedDate}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <CalendarClock className="h-4 w-4" />
                        </div>
                        <Badge variant="outline">Lịch</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Theo dõi lịch học, thi và sự kiện.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <Badge variant="outline">GPA</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Tính toán và theo dõi tiến độ tín chỉ.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Map className="h-4 w-4" />
                        </div>
                        <Badge variant="outline">Hỗ trợ</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Bản đồ, ghi chú và nhắc việc tập trung.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ScrollText className="h-5 w-5 text-primary" />
                      Lối tắt nhanh
                    </CardTitle>
                    <CardDescription>Tiếp tục công việc dang dở</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Học tập</Badge>
                        <span className="text-sm font-medium">Cập nhật thời khóa biểu</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("schedule")}>
                        Mở
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Thi</Badge>
                        <span className="text-sm font-medium">Kiểm tra lịch thi</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("exam")}>
                        Mở
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Ghi chú</Badge>
                        <span className="text-sm font-medium">Xem kế hoạch tuần</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("notes")}>
                        Mở
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <section className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    Không gian làm việc
                  </p>
                  <h2 className="text-xl font-semibold">{menuItems.find((m) => m.id === activeTab)?.label}</h2>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
        {renderTabContent()}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
