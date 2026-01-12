import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  CalendarDays,
  CheckCircle2,
  Settings2
} from "lucide-react";
import {
  parseScheduleData,
  getSubjectColor,
  getCurrentWeek
} from '../utils/scheduleParser';
import { useScheduleData } from '../hooks/useLocalStorage';
import MyBKLoginCard from './MyBKLoginCard';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

const timeSlots = [
  { id: 1, label: 'Tiết 1', time: '06:00-06:50' },
  { id: 2, label: 'Tiết 2', time: '07:00-07:50' },
  { id: 3, label: 'Tiết 3', time: '08:00-08:50' },
  { id: 4, label: 'Tiết 4', time: '09:00-09:50' },
  { id: 5, label: 'Tiết 5', time: '10:00-10:50' },
  { id: 6, label: 'Tiết 6', time: '11:00-11:50' },
  { id: 7, label: 'Tiết 7', time: '12:00-12:50' },
  { id: 8, label: 'Tiết 8', time: '13:00-13:50' },
  { id: 9, label: 'Tiết 9', time: '14:00-14:50' },
  { id: 10, label: 'Tiết 10', time: '15:00-15:50' },
  { id: 11, label: 'Tiết 11', time: '16:00-16:50' },
  { id: 12, label: 'Tiết 12', time: '17:00-17:50' },
  { id: 13, label: 'Tiết 13', time: '18:00-18:50' },
  { id: 14, label: 'Tiết 14', time: '18:50-19:40' },
  { id: 15, label: 'Tiết 15', time: '19:40-20:30' },
  { id: 16, label: 'Tiết 16', time: '20:30-21:10' },
];

const daysOfWeek = [
  { id: 2, label: 'Thứ 2', short: 'T2' },
  { id: 3, label: 'Thứ 3', short: 'T3' },
  { id: 4, label: 'Thứ 4', short: 'T4' },
  { id: 5, label: 'Thứ 5', short: 'T5' },
  { id: 6, label: 'Thứ 6', short: 'T6' },
  { id: 7, label: 'Thứ 7', short: 'T7' },
];

function ScheduleTab() {
  const [scheduleInput, setScheduleInput] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(2); // Default to Monday (Thứ 2)
  const [showManualInput, setShowManualInput] = useState(false);
  const [loading, setLoading] = useState(false);
  // inputMethod: "sync" | "manual"
  const [inputMethod, setInputMethod] = useState("sync");
  const [isInputExpanded, setIsInputExpanded] = useState(true);

  const { scheduleData, setScheduleData, selectedWeek, setSelectedWeek } = useScheduleData();

  useEffect(() => {
    setCurrentWeek(getCurrentWeek());
    // Set default day to current day
    const today = new Date().getDay();
    const dayId = today === 0 ? 2 : today + 1; // Convert to our day format (2-7)
    if (dayId >= 2 && dayId <= 7) {
      setSelectedDay(dayId);
    }
  }, []);

  // Collapse input section when data is available
  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      setIsInputExpanded(false);
    }
  }, [scheduleData]);

  const generateSchedule = (inputData = scheduleInput) => {
    try {
      const parsed = parseScheduleData(inputData);
      if (parsed && parsed.length > 0) {
        setScheduleData(parsed);
        // Reset input and collapse manual section if successful
        setScheduleInput('');
        setShowManualInput(false);
        setIsInputExpanded(false);
        // Optional: Show success toast/alert
      } else {
        alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng đảm bảo bạn đã copy đúng bảng thời khóa biểu từ MyBK.");
      }
    } catch (error) {
      console.error("Parse error:", error);
      alert("Đã xảy ra lỗi khi xử lý dữ liệu.");
    }
  };

  const handleOpenMyBK = () => {
    window.open('https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/tkb', '_blank');
  };

  const handleSmartPaste = async () => {
    setLoading(true);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert("Clipboard trống! Vui lòng copy lịch từ MyBK trước.");
        setLoading(false);
        return;
      }

      // Auto process the text
      generateSchedule(text);

    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // Fallback to manual input if clipboard access denied
      alert("Không thể truy cập Clipboard. Vui lòng sử dụng phương pháp nhập thủ công.");
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => setSelectedWeek(prev => Math.max(1, prev - 1));
  const goToNextWeek = () => setSelectedWeek(prev => Math.min(50, prev + 1));
  const goToCurrentWeek = () => setSelectedWeek(currentWeek);

  const getWeekLabel = (weekNum) => {
    return `Tuần ${String(weekNum).padStart(2, '0')}`;
  };

  // Get classes for a specific day
  const getClassesForDay = (dayId) => {
    return scheduleData.filter(course => {
      const isActiveInWeek = course.weeks && course.weeks.includes(selectedWeek);
      return course.day === dayId && isActiveInWeek;
    }).sort((a, b) => a.startPeriod - b.startPeriod);
  };

  // Mobile View - Card based per day
  const renderMobileSchedule = () => {
    // Filter out unscheduled courses (startPeriod=0)
    const classesForDay = getClassesForDay(selectedDay).filter(c => c.startPeriod > 0);

    return (
      <div className="md:hidden">
        {/* Day Selector Tabs */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-3 px-3 border-b mb-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 pb-1">
              {daysOfWeek.map((day) => {
                const classCount = getClassesForDay(day.id).filter(c => c.startPeriod > 0).length;
                const isSelected = selectedDay === day.id;
                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[60px] h-[64px] rounded-xl transition-all duration-200 border-2",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-card border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="text-xs font-medium opacity-80">{day.label}</span>
                    <span className="text-lg font-bold leading-none">{day.short.replace('T', '')}</span>
                    {classCount > 0 && (
                      <div className={cn(
                        "mt-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold",
                        isSelected ? "bg-white/30 text-white" : "bg-primary text-white"
                      )}>
                        {classCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Classes for selected day */}
        {classesForDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed rounded-xl bg-muted/30">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Không có lịch học</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {daysOfWeek.find(d => d.id === selectedDay)?.label} tuần này bạn được nghỉ!
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {classesForDay.map((course, index) => {
              // Parse time from course.time or fallback to timeSlots
              let startTime = '', endTime = '';
              if (course.time && course.time.includes('-')) {
                [startTime, endTime] = course.time.split('-').map(t => t.trim());
              } else {
                startTime = timeSlots[course.startPeriod - 1]?.time.split('-')[0] || '';
                endTime = timeSlots[course.endPeriod - 1]?.time.split('-')[1] || '';
              }

              const numPeriods = course.endPeriod - course.startPeriod + 1;

              return (
                <Card
                  key={index}
                  className="overflow-hidden border-none shadow-md ring-1 ring-border/50 bg-card transition-all hover:shadow-lg active:scale-[0.99]"
                >
                  <div className="flex h-full">
                    {/* Left Color strip with time */}
                    <div
                      className="w-20 flex-none flex flex-col items-center justify-center p-2 text-white"
                      style={{ backgroundColor: getSubjectColor(course.code) }}
                    >
                      <span className="text-sm font-bold">{startTime}</span>
                      <div className="flex flex-col items-center my-1">
                        <div className="w-0.5 h-2 bg-white/40 rounded-full" />
                        <span className="text-[10px] font-medium opacity-80 my-0.5">
                          {numPeriods} tiết
                        </span>
                        <div className="w-0.5 h-2 bg-white/40 rounded-full" />
                      </div>
                      <span className="text-sm font-bold">{endTime}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 min-w-0">
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <h4 className="font-bold text-base leading-tight line-clamp-2" title={course.name}>
                          {course.name}
                        </h4>
                        <Badge variant="outline" className="shrink-0 text-[10px] font-mono whitespace-nowrap border-primary/30 bg-primary/10 text-primary font-bold">
                          {course.code}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-sm bg-muted/50 px-2 py-1 rounded-md">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium">{course.room || 'TBA'}</span>
                        </div>

                        {course.group && (
                          <div className="flex items-center gap-1.5 text-sm bg-muted/50 px-2 py-1 rounded-md">
                            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="font-medium">{course.group}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-sm bg-muted/50 px-2 py-1 rounded-md">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span>Tiết {course.startPeriod}-{course.endPeriod}</span>
                        </div>
                      </div>

                      {/* Teacher info */}
                      {course.teacher && course.teacher !== 'Chưa biết chưa biết' && (
                        <div className="mt-2 pt-2 border-t border-border/50 text-sm text-muted-foreground flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span>{course.teacher}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };


  // Desktop View - Table format with multi-period spanning
  const renderDesktopSchedule = () => {
    const ROW_HEIGHT = 70; // Height per time slot row in pixels

    // Get all courses for a specific day that are active in selected week
    const getCoursesForDay = (dayId) => {
      return scheduleData.filter(course => {
        const isActiveInWeek = course.weeks && course.weeks.includes(selectedWeek);
        return isActiveInWeek && course.day === dayId && course.startPeriod > 0;
      });
    };

    return (
      <div className="hidden md:block border rounded-xl overflow-hidden bg-background shadow-sm">
        <ScrollArea className="w-full">
          <div className="min-w-[1100px]">
            {/* Header */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted/40 font-medium">
              <div className="p-3 border-r text-center text-sm font-bold">Tiết</div>
              {daysOfWeek.map((day) => (
                <div key={day.id} className="p-3 border-r last:border-r-0 text-center text-sm font-bold text-primary">
                  {day.label}
                </div>
              ))}
            </div>

            {/* Body - Container with relative positioning */}
            <div className="relative">
              {/* Background grid rows */}
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] border-b last:border-b-0"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  {/* Time Column */}
                  <div className="p-2 border-r bg-muted/10 text-center flex flex-col justify-center items-center">
                    <span className="font-bold text-sm">{slot.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{slot.time}</span>
                  </div>
                  {/* Empty day cells for grid lines */}
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="border-r last:border-r-0" />
                  ))}
                </div>
              ))}

              {/* Overlay courses using absolute positioning */}
              {daysOfWeek.map((day, dayIdx) => {
                const courses = getCoursesForDay(day.id);
                return courses.map((course, idx) => {
                  const numPeriods = course.endPeriod - course.startPeriod + 1;
                  const topOffset = (course.startPeriod - 1) * ROW_HEIGHT;
                  const height = numPeriods * ROW_HEIGHT - 4; // -4 for padding

                  // Calculate left position based on day column (skip first column which is 80px)
                  // Each day column is (100% - 80px) / 6 = ~16.67% width
                  const leftOffset = 80 + (dayIdx * (100 - 8) / 6) + '%';
                  const width = `calc((100% - 80px) / 6 - 8px)`;

                  return (
                    <div
                      key={`${course.code}-${idx}`}
                      className="absolute p-2 rounded-lg shadow-md text-white hover:shadow-lg transition-all cursor-pointer z-10 group overflow-hidden"
                      style={{
                        backgroundColor: getSubjectColor(course.code),
                        top: `${topOffset}px`,
                        left: `calc(80px + ${dayIdx} * ((100% - 80px) / 6) + 4px)`,
                        width: `calc((100% - 80px) / 6 - 8px)`,
                        height: `${height}px`,
                      }}
                    >
                      <div className="h-full flex flex-col relative px-2 py-1.5">
                        {/* Hover overlay effect */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />

                        {/* Header: Course Code */}
                        <div className="font-bold text-sm flex justify-between items-start mb-0.5 shrink-0">
                          <span>{course.code}</span>
                        </div>

                        {/* Body: Course Name (Takes remaining space) */}
                        <div className="flex-1 min-h-0 overflow-hidden mb-1">
                          <div
                            className="text-xs font-semibold leading-snug opacity-95"
                            title={course.name}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: numPeriods > 2 ? 4 : (numPeriods > 1 ? 3 : 2),
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {course.name}
                          </div>
                        </div>

                        {/* Footer: Info (Fixed at bottom) */}
                        <div className="flex flex-col gap-1 shrink-0 mt-auto">
                          <div className="flex items-center gap-1.5 text-xs font-medium opacity-95">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{course.room}</span>
                          </div>

                          {course.group && (
                            <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">
                              <Users className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{course.group}</span>
                            </div>
                          )}

                          {numPeriods > 1 && (
                            <div className="flex items-center gap-1.5 text-xs font-medium opacity-90 mt-0.5 pt-1 border-t border-white/20">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{course.time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Input Section */}
      <Card className="border-2 border-primary/10">
        <CardHeader
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsInputExpanded(!isInputExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base md:text-lg">Cài đặt & Dữ liệu</CardTitle>
            </div>
            {isInputExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        {isInputExpanded && (
          <CardContent className="p-4 pt-0 border-t animate-in slide-in-from-top-2">
            <div className="pt-4">
              <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v)} className="w-full">
                <TabsList className="mb-4 grid w-full max-w-[400px] grid-cols-2">
                  <TabsTrigger value="sync" className="font-semibold">
                    🔄 Đồng bộ MyBK
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="font-semibold">
                    📋 Nhập thủ công
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sync" className="mt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Đăng nhập bằng tài khoản MyBK để tự động lấy thời khóa biểu
                  </p>
                  <MyBKLoginCard
                    onScheduleFetched={(data) => {
                      setScheduleData(data);
                    }}
                    onError={(err) => console.error(err)}
                  />
                </TabsContent>

                <TabsContent value="manual" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3"
                      onClick={handleOpenMyBK}
                    >
                      <div className="h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Mở MyBK & Copy</div>
                        <div className="text-xs text-muted-foreground">Ctrl+A sau đó Ctrl+C toàn bộ trang</div>
                      </div>
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div
                      className="p-4 border-2 border-primary/20 bg-primary/5 rounded-lg hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all flex items-center gap-3"
                      onClick={handleSmartPaste}
                    >
                      <div className="h-9 w-9 bg-background text-primary border border-primary/20 rounded-full flex items-center justify-center font-bold shadow-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-primary">Tự động phân tích</div>
                        <div className="text-xs text-primary/80">Nhấn để đọc từ Clipboard</div>
                      </div>
                      <ClipboardPaste className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground p-0 h-auto"
                      onClick={() => setShowManualInput(!showManualInput)}
                    >
                      {showManualInput ? "Ẩn nhập thủ công" : "Hiện khung nhập thủ công"}
                      {showManualInput ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                    </Button>

                    {showManualInput && (
                      <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Textarea
                          placeholder="Dán dữ liệu thời khóa biểu từ MyBK vào đây..."
                          className="min-h-[100px]"
                          value={scheduleInput}
                          onChange={(e) => setScheduleInput(e.target.value)}
                        />
                        <Button
                          className="w-full"
                          onClick={() => generateSchedule(scheduleInput)}
                          disabled={!scheduleInput.trim()}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Xử lý dữ liệu
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Schedule Section */}
      {scheduleData.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Week Navigation */}
          <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-md mb-4 flex items-center justify-between sticky top-[60px] md:static z-20">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
              <h3 className="font-bold text-lg md:text-xl">
                {getWeekLabel(selectedWeek)}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white"
                onClick={goToPreviousWeek}
                disabled={selectedWeek <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 hover:text-white h-8"
                onClick={goToCurrentWeek}
              >
                Hiện tại
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white"
                onClick={goToNextWeek}
                disabled={selectedWeek >= 50}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
            {[
              { label: "Môn học", value: scheduleData.length },
              { label: "Tín chỉ", value: scheduleData.reduce((sum, course) => sum + (course.credits || 0), 0) },
              { label: "Học tuần này", value: scheduleData.filter(course => course.weeks && course.weeks.includes(selectedWeek)).length },
              { label: "Tuần hiện tại", value: currentWeek }
            ].map((stat, idx) => (
              <Card key={idx} className="bg-card shadow-sm border">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-primary mb-0.5">{stat.value}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Render Schedule View */}
          {renderMobileSchedule()}
          {renderDesktopSchedule()}
        </div>
      )}

      {/* Mobile spacer for navigation (if any) */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
}

export default ScheduleTab;
