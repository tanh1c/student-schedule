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
  Settings2,
  Download,
  CalendarPlus,
  ExternalLink,
  X,
  Info
} from "lucide-react";
import {
  parseScheduleData,
  getSubjectColor
} from '../utils/scheduleParser';
import { exportToGoogleCalendar } from '../utils/calendarExport';
import { useLocalStorage, useScheduleData } from '../hooks/useLocalStorage';
import MyBKLoginCard from './MyBKLoginCard';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
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
  { id: 8, label: 'Chủ Nhật', short: 'CN' },
];

const getCurrentScheduleDayId = (date = new Date()) => {
  const today = date.getDay();
  return today === 0 ? 8 : today + 1;
};

const getMinutesFromTime = (timeValue) => {
  const [hours, minutes] = timeValue.split(':').map(Number);
  return (hours * 60) + minutes;
};

const getCurrentTimeSlotInfo = (date = new Date()) => {
  const currentMinutes = (date.getHours() * 60) + date.getMinutes();

  return timeSlots.find((slot) => {
    const [startTime, endTime] = slot.time.split('-');
    const startMinutes = getMinutesFromTime(startTime);
    const endMinutes = getMinutesFromTime(endTime);
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }) ?? null;
};

const getTeacherLabel = (course) => {
  if (!course?.teacher) return '';

  const normalizedTeacher = course.teacher.trim();
  if (!normalizedTeacher || normalizedTeacher === 'Chưa biết chưa biết') {
    return '';
  }

  return normalizedTeacher;
};

const getClassSizeLabel = (course) => {
  const candidates = [
    course?.classSize,
    course?.memberCount,
    course?.studentCount,
    course?._raw?.classSize,
    course?._raw?.memberCount,
    course?._raw?.studentCount,
    course?._raw?.numberOfStudents,
    course?._raw?.numOfStudents,
    course?._raw?.subjectClassGroup?.numberOfStudents,
    course?._raw?.subjectClassGroup?.studentCount,
    course?._raw?.subjectClassGroup?.classSize,
  ];

  const classSize = candidates.find((value) => {
    if (typeof value === 'number') return Number.isFinite(value) && value > 0;
    if (typeof value === 'string') return value.trim() !== '';
    return false;
  });

  if (classSize === undefined) return '';
  return typeof classSize === 'number' ? `${classSize} sinh viên` : classSize;
};

const getCourseTimeRange = (course) => {
  if (course.time && course.time.includes('-')) {
    const [startTime, endTime] = course.time.split('-').map((timeValue) => timeValue.trim());
    return { startTime, endTime };
  }

  return {
    startTime: timeSlots[course.startPeriod - 1]?.time.split('-')[0] || '',
    endTime: timeSlots[course.endPeriod - 1]?.time.split('-')[1] || '',
  };
};

const isCourseOngoingNow = (course, currentDayId, currentTimeSlotInfo, isViewingCurrentWeek) => {
  return Boolean(
    isViewingCurrentWeek &&
    currentTimeSlotInfo &&
    course.day === currentDayId &&
    currentTimeSlotInfo.id >= course.startPeriod &&
    currentTimeSlotInfo.id <= course.endPeriod
  );
};

const scheduleViewModes = [
  { id: 'timeline', label: 'Lịch tuần', icon: CalendarDays },
  { id: 'agenda', label: 'Agenda', icon: Clock },
  { id: 'day', label: 'Theo ngày', icon: Calendar },
];

function ScheduleTab() {
  const [scheduleInput, setScheduleInput] = useState('');
  const [selectedDay, setSelectedDay] = useState(2); // Default to Monday (Thứ 2)
  const [showManualInput, setShowManualInput] = useState(false);
  const [_loading, setLoading] = useState(false);
  // inputMethod: "sync" | "manual"
  const [inputMethod, setInputMethod] = useState("sync");
  const [isInputExpanded, setIsInputExpanded] = useState(true);
  const [scheduleViewMode, setScheduleViewMode] = useLocalStorage('scheduleViewMode', 'timeline');

  // Detail popup state
  const [activeCourse, setActiveCourse] = useState(null);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [hasAutoFocusedCurrentWeek, setHasAutoFocusedCurrentWeek] = useState(false);

  const { scheduleData, setScheduleData, selectedWeek, setSelectedWeek, currentWeek } = useScheduleData();
  const currentDayId = getCurrentScheduleDayId(now);
  const currentTimeSlotInfo = getCurrentTimeSlotInfo(now);
  const isViewingCurrentWeek = selectedWeek === currentWeek;
  const scheduleStatusText = scheduleData.length > 0
    ? `${scheduleData.length} môn đã sẵn sàng. Bạn có thể đồng bộ lại hoặc nhập dữ liệu mới khi cần.`
    : 'Đồng bộ nhanh từ MyBK hoặc dán dữ liệu thủ công khi bạn cần cập nhật lịch.';

  const openDataPanel = (method = inputMethod) => {
    setInputMethod(method);
    setIsInputExpanded(true);
  };

  useEffect(() => {
    // Set default day to current day
    const dayId = getCurrentScheduleDayId();
    if (dayId >= 2 && dayId <= 8) {
      setSelectedDay(dayId);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timerId);
  }, []);

  // Collapse input section when data is available
  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      setIsInputExpanded(false);
    }
  }, [scheduleData]);

  // Close active popup on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveCourse(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (scheduleData.length > 0 && !hasAutoFocusedCurrentWeek) {
      setSelectedWeek(currentWeek);
      setSelectedDay(currentDayId);
      setHasAutoFocusedCurrentWeek(true);
    }
  }, [currentDayId, currentWeek, hasAutoFocusedCurrentWeek, scheduleData.length, setSelectedWeek]);

  useEffect(() => {
    if (scheduleData.length === 0 && hasAutoFocusedCurrentWeek) {
      setHasAutoFocusedCurrentWeek(false);
    }
  }, [hasAutoFocusedCurrentWeek, scheduleData.length]);

  useEffect(() => {
    if (!scheduleViewModes.some((mode) => mode.id === scheduleViewMode)) {
      setScheduleViewMode('timeline');
    }
  }, [scheduleViewMode, setScheduleViewMode]);

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
  const goToCurrentWeek = () => {
    setSelectedWeek(currentWeek);
    setSelectedDay(currentDayId);
  };

  // Export to Google Calendar
  const handleExportToCalendar = () => {
    if (!scheduleData || scheduleData.length === 0) {
      alert('Chưa có dữ liệu thời khóa biểu để xuất!');
      return;
    }

    const result = exportToGoogleCalendar(scheduleData);
    if (result.success) {
      alert(`✅ Đã tải file .ics thành công!\n\nHướng dẫn import vào Google Calendar:\n1. Mở Google Calendar (calendar.google.com)\n2. Click ⚙️ Settings > Import & Export\n3. Chọn file .ics vừa tải\n4. Click Import`);
    } else {
      alert(`❌ Lỗi: ${result.error}`);
    }
  };

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

  const renderDayFocusSchedule = ({ mobileOnly = false } = {}) => {
    // Filter out unscheduled courses (startPeriod=0)
    const classesForDay = getClassesForDay(selectedDay).filter(c => c.startPeriod > 0);

    return (
      <div className={cn("w-full min-w-0 overflow-hidden", mobileOnly && "md:hidden")}>
        {/* Day Selector Tabs */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1.5 -mx-1 px-1 border-b mb-3">
          <div className="flex w-full gap-1">
            {daysOfWeek.map((day) => {
              const classCount = getClassesForDay(day.id).filter(c => c.startPeriod > 0).length;
              const isSelected = selectedDay === day.id;
              const isToday = isViewingCurrentWeek && currentDayId === day.id;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center h-[52px] rounded-lg transition-all duration-200 border-2",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-lg scale-105"
                      : isToday
                        ? "border-primary/70 bg-primary/15 text-primary shadow-sm dark:border-primary/80 dark:bg-primary/25"
                        : "bg-card border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span className="text-[10px] font-medium opacity-80">{day.label}</span>
                  <span className="text-base font-bold leading-none">{day.short.replace('T', '')}</span>
                  {classCount > 0 && (
                    <div className={cn(
                      "mt-0.5 flex items-center justify-center h-3.5 min-w-3.5 px-0.5 rounded-full text-[9px] font-bold",
                      isSelected ? "bg-white/30 text-white" : "bg-primary text-white"
                    )}>
                      {classCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
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
          <div className="space-y-2.5 pb-20 w-full min-w-0">
            {/* Course Classes */}
            {classesForDay.map((course, index) => {
              const { startTime, endTime } = getCourseTimeRange(course);
              const numPeriods = course.endPeriod - course.startPeriod + 1;
              const isOngoingCourse = isCourseOngoingNow(
                course,
                currentDayId,
                currentTimeSlotInfo,
                isViewingCurrentWeek
              );

              return (
                <Card
                  key={index}
                  className={cn(
                    "overflow-hidden border-none shadow-md ring-1 ring-border/50 bg-card transition-all hover:shadow-lg active:scale-[0.99] w-full min-w-0",
                    isOngoingCourse && "ring-2 ring-primary shadow-lg shadow-primary/15"
                  )}
                >
                  <div className="flex h-full w-full min-w-0">
                    {/* Left Color strip with time */}
                    <div
                      className="w-16 sm:w-20 flex-none flex flex-col items-center justify-center p-1.5 sm:p-2 text-white"
                      style={{ backgroundColor: getSubjectColor(course.code) }}
                    >
                      <span className="text-xs sm:text-sm font-bold">{startTime}</span>
                      <div className="flex flex-col items-center my-0.5 sm:my-1">
                        <div className="w-0.5 h-1.5 sm:h-2 bg-white/40 rounded-full" />
                        <span className="text-[9px] sm:text-[10px] font-medium opacity-80 my-0.5">
                          {numPeriods} tiết
                        </span>
                        <div className="w-0.5 h-1.5 sm:h-2 bg-white/40 rounded-full" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold">{endTime}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-2.5 sm:p-3 min-w-0 w-0">
                      <div className="flex justify-between items-start mb-1.5 gap-1.5 sm:gap-2 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base leading-tight line-clamp-2 min-w-0" title={course.name}>
                          {course.name}
                        </h4>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge variant="outline" className="shrink-0 text-[9px] sm:text-[10px] font-mono whitespace-nowrap border-primary/30 bg-primary/10 text-primary font-bold">
                            {course.code}
                          </Badge>
                          {isOngoingCourse && (
                            <Badge className="border-0 bg-emerald-500 px-1.5 py-0 text-[9px] font-bold text-white">
                              Đang diễn ra
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium truncate">{course.room || 'TBA'}</span>
                        </div>

                        {course.group && (
                          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                            <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground" />
                            <span className="font-medium">{course.group}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground" />
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
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted/40 font-medium">
              <div className="p-3 border-r text-center text-sm font-bold">Tiết</div>
              {daysOfWeek.map((day) => {
                const isTodayColumn = isViewingCurrentWeek && currentDayId === day.id;
                return (
                  <div
                    key={day.id}
                    className={cn(
                      "p-3 border-r last:border-r-0 text-center text-sm font-bold text-primary",
                      isTodayColumn && "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)] dark:bg-primary/25 dark:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.32)]"
                    )}
                  >
                    <div>{day.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Body - Container with relative positioning */}
            <div className="relative">
              {/* Background grid rows */}
              {timeSlots.map((slot) => {
                const isCurrentSlot = isViewingCurrentWeek && currentTimeSlotInfo?.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b last:border-b-0",
                      isCurrentSlot && "bg-primary/10 dark:bg-primary/15"
                    )}
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    {/* Time Column */}
                    <div className={cn(
                      "p-2 border-r bg-muted/10 text-center flex flex-col justify-center items-center",
                      isCurrentSlot && "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)] dark:bg-primary/30 dark:text-primary-foreground dark:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.36)]"
                    )}>
                      <span className="font-bold text-sm">{slot.label}</span>
                      <span className={cn(
                        "text-[10px] mt-0.5",
                        isCurrentSlot ? "text-primary/80 dark:text-primary-foreground/85" : "text-muted-foreground"
                      )}>{slot.time}</span>
                      {isCurrentSlot && (
                        <span className="mt-1 rounded-full bg-primary px-2 py-[2px] text-[9px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                          Bây giờ
                        </span>
                      )}
                    </div>
                    {/* Empty day cells for grid lines */}
                    {daysOfWeek.map((day) => {
                      const isTodayColumn = isViewingCurrentWeek && currentDayId === day.id;
                      return (
                        <div
                          key={day.id}
                          className={cn(
                            "border-r last:border-r-0",
                            isTodayColumn && "bg-primary/[0.08] dark:bg-primary/[0.14]",
                            isTodayColumn && isCurrentSlot && "bg-primary/[0.16] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.18)] dark:bg-primary/[0.24] dark:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.28)]"
                          )}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {/* Overlay courses using absolute positioning */}
              {daysOfWeek.map((day, dayIdx) => {
                const courses = getCoursesForDay(day.id);
                return courses.map((course, idx) => {
                  const numPeriods = course.endPeriod - course.startPeriod + 1;
                  const topOffset = (course.startPeriod - 1) * ROW_HEIGHT;
                  const height = numPeriods * ROW_HEIGHT - 4; // -4 for padding
                  const isOngoingCourse = isCourseOngoingNow(
                    course,
                    currentDayId,
                    currentTimeSlotInfo,
                    isViewingCurrentWeek
                  );

                  // Calculate left position based on day column (skip first column which is 80px)
                  // Each day column is (100% - 80px) / 6 = ~16.67% width

                  return (
                    <div
                      key={`${course.code}-${idx}`}
                      className={cn(
                        "absolute p-2 rounded-lg shadow-md text-white hover:shadow-lg transition-all cursor-pointer z-10 group overflow-hidden",
                        isOngoingCourse && "ring-2 ring-white/90 shadow-xl shadow-primary/25"
                      )}
                      style={{
                        backgroundColor: getSubjectColor(course.code),
                        top: `${topOffset}px`,
                        left: `calc(80px + ${dayIdx} * ((100% - 80px) / 7) + 4px)`,
                        width: `calc((100% - 80px) / 7 - 8px)`,
                        height: `${height}px`,
                      }}
                      onMouseEnter={(e) => {
                        if (!activeCourse) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCourse({ ...course, rect });
                        }
                      }}
                      onMouseLeave={() => setHoveredCourse(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Get updated rect on click
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActiveCourse({ ...course, rect });
                        setHoveredCourse(null);
                      }}
                    >
                      <div className="h-full flex flex-col relative px-2 py-1.5">
                        {/* Hover overlay effect */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />

                        {/* Header: Course Code */}
                        <div className="font-bold text-sm flex justify-between items-start mb-0.5 shrink-0">
                          <span>{course.code}</span>
                          {isOngoingCourse && (
                            <span className="rounded-full bg-white/20 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide">
                              Now
                            </span>
                          )}
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

  const renderAgendaSchedule = () => {
    const weeklySections = daysOfWeek
      .map((day) => ({
        ...day,
        classes: getClassesForDay(day.id).filter((course) => course.startPeriod > 0),
      }))
      .filter((section) => section.classes.length > 0);

    if (weeklySections.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Tuần này chưa có lịch học</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Thử chuyển sang tuần khác hoặc đồng bộ lại dữ liệu từ MyBK.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-20">
        {weeklySections.map((section) => {
          const isTodaySection = isViewingCurrentWeek && currentDayId === section.id;

          return (
            <Card
              key={section.id}
              className={cn(
                "overflow-hidden border shadow-sm",
                isTodaySection && "border-primary/30 shadow-primary/5"
              )}
            >
              <CardHeader className={cn(
                "border-b bg-muted/30 pb-4",
                isTodaySection && "bg-primary/5"
              )}>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base md:text-lg">{section.label}</CardTitle>
                  {isTodaySection && (
                    <Badge className="border-0 bg-primary text-primary-foreground">Hôm nay</Badge>
                  )}
                  <Badge variant="secondary">{section.classes.length} môn</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-3 sm:p-4">
                {section.classes.map((course, index) => {
                  const { startTime, endTime } = getCourseTimeRange(course);
                  const isOngoingCourse = isCourseOngoingNow(
                    course,
                    currentDayId,
                    currentTimeSlotInfo,
                    isViewingCurrentWeek
                  );

                  return (
                    <button
                      key={`${section.id}-${course.code}-${index}`}
                      type="button"
                      className={cn(
                        "group flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:shadow-md",
                        isOngoingCourse && "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                      )}
                      onMouseEnter={(event) => {
                        if (!activeCourse) {
                          const rect = event.currentTarget.getBoundingClientRect();
                          setHoveredCourse({ ...course, rect });
                        }
                      }}
                      onMouseLeave={() => setHoveredCourse(null)}
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setActiveCourse({ ...course, rect });
                        setHoveredCourse(null);
                      }}
                    >
                      <div
                        className="flex min-h-[72px] w-20 flex-none flex-col items-center justify-center rounded-xl px-2 text-white shadow-sm"
                        style={{ backgroundColor: getSubjectColor(course.code) }}
                      >
                        <span className="text-xs font-bold">{startTime}</span>
                        <span className="my-1 text-[10px] font-medium opacity-80">đến</span>
                        <span className="text-xs font-bold">{endTime}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-sm font-bold text-foreground sm:text-base">
                              {course.name}
                            </h4>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {course.code}
                              </Badge>
                              {course.group && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Nhóm {course.group}
                                </Badge>
                              )}
                              {isOngoingCourse && (
                                <Badge className="border-0 bg-emerald-500 text-[10px] text-white">
                                  Đang diễn ra
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground sm:text-sm">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                            <Clock className="h-3.5 w-3.5" />
                            Tiết {course.startPeriod}-{course.endPeriod}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {course.room || 'TBA'}
                          </span>
                          {getTeacherLabel(course) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                              <Users className="h-3.5 w-3.5" />
                              {getTeacherLabel(course)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderActiveScheduleView = () => {
    return (
      <>
        {renderDayFocusSchedule({ mobileOnly: true })}
        {scheduleViewMode === 'agenda' && (
          <div className="hidden md:block">
            {renderAgendaSchedule()}
          </div>
        )}
        {scheduleViewMode === 'day' && (
          <div className="hidden md:block">
            {renderDayFocusSchedule()}
          </div>
        )}
        {scheduleViewMode === 'timeline' && renderDesktopSchedule()}
      </>
    );
  };

  const renderScheduleViewSwitcher = ({ className } = {}) => (
    <div className={cn(
      "flex w-full flex-nowrap items-center justify-center gap-1 rounded-2xl border bg-card/80 p-1.5 shadow-sm backdrop-blur",
      className
    )}>
      {scheduleViewModes.map((mode) => {
        const Icon = mode.icon;
        const isActive = scheduleViewMode === mode.id;

        return (
          <Button
            key={mode.id}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => setScheduleViewMode(mode.id)}
            className={cn(
              "h-9 shrink-0 gap-1.5 rounded-xl px-2.5 lg:px-3",
              !isActive && "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{mode.label}</span>
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="p-1 sm:p-3 md:p-6 max-w-[1600px] w-full mx-auto space-y-3 md:space-y-6 overflow-x-hidden overflow-hidden box-border">
      {/* Input Section */}
      <Card className="w-full min-w-0 overflow-hidden border border-border/70 bg-card/95 shadow-sm backdrop-blur">
        <CardHeader className={cn("p-3 sm:p-4", isInputExpanded && "border-b")}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="flex min-w-0 cursor-pointer items-center gap-3"
              onClick={() => setIsInputExpanded(!isInputExpanded)}
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
                  {scheduleData.length > 0 ? `${scheduleData.length} môn` : 'Chưa có dữ liệu'}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant={isInputExpanded && inputMethod === 'sync' ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => openDataPanel('sync')}
                >
                  Đồng bộ MyBK
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isInputExpanded && inputMethod === 'manual' ? "default" : "ghost"}
                  className="rounded-xl"
                  onClick={() => openDataPanel('manual')}
                >
                  Nhập thủ công
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => setIsInputExpanded(!isInputExpanded)}
                >
                  {isInputExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {scheduleData.length > 0 && (
                <div className="hidden w-full md:block lg:max-w-fit">
                  {renderScheduleViewSwitcher({
                    className: "justify-start sm:justify-center lg:justify-center"
                  })}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {isInputExpanded && (
          <CardContent className="animate-in slide-in-from-top-2 p-3 sm:p-4">
            <div className="space-y-4">
              {inputMethod === 'sync' ? (
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
                      {scheduleData.length > 0 && (
                        <div className="rounded-xl bg-primary/5 px-3 py-2 text-primary ring-1 ring-primary/10">
                          Dữ liệu hiện tại đang có {scheduleData.length} môn học.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <MyBKLoginCard
                      onScheduleFetched={(data) => {
                        setScheduleData(data);
                      }}
                      onError={(err) => console.error(err)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="p-4 border rounded-xl hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3"
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
                      className="p-4 border-2 border-primary/20 bg-primary/5 rounded-xl hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all flex items-center gap-3"
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

                  <div className="rounded-2xl border bg-muted/15 p-3 sm:p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Dán dữ liệu nếu cần kiểm soát thủ công</div>
                        <div className="text-xs text-muted-foreground">
                          Hữu ích khi clipboard bị chặn hoặc bạn muốn chỉnh nội dung trước khi xử lý.
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start text-muted-foreground hover:text-foreground sm:justify-center"
                        onClick={() => setShowManualInput(!showManualInput)}
                      >
                        {showManualInput ? "Ẩn ô nhập" : "Mở ô nhập"}
                        {showManualInput ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                      </Button>
                    </div>

                    {showManualInput && (
                      <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
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
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Schedule Section */}
      {scheduleData.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Week Navigation */}
          <div className="bg-primary text-primary-foreground p-1.5 sm:p-3 rounded-lg sm:rounded-xl shadow-md mb-3 sm:mb-4 flex items-center justify-between sticky top-[60px] md:static z-20 w-full min-w-0 overflow-hidden box-border">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 w-0">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
              <h3 className="font-bold text-sm sm:text-lg md:text-xl truncate">
                {getWeekLabel(selectedWeek)}
              </h3>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
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

              {/* Export to Google Calendar */}
              <div className="h-5 w-px bg-primary-foreground/30 mx-1 hidden md:block" />
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-white h-8 gap-1.5"
                onClick={handleExportToCalendar}
                title="Xuất lịch sang Google Calendar"
              >
                <CalendarPlus className="h-4 w-4" />
                <span className="hidden lg:inline">Google Calendar</span>
              </Button>

              {/* Mobile export button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white"
                onClick={handleExportToCalendar}
                title="Xuất lịch"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Render Schedule View */}
          {renderActiveScheduleView()}
        </div>
      )}

      {/* Mobile spacer for navigation (if any) */}
      <div className="h-16 md:hidden"></div>

      {/* Course Detail Popup */}
      {(hoveredCourse || activeCourse) && (
        <CourseDetailPopup
          course={activeCourse || hoveredCourse}
          rect={(activeCourse || hoveredCourse).rect}
          isActive={!!activeCourse}
          onClose={() => setActiveCourse(null)}
        />
      )}
    </div>
  );
}

function CourseDetailPopup({ course, rect, isActive, onClose }) {
  if (!course || !rect) return null;

  const teacherLabel = getTeacherLabel(course);
  const classSizeLabel = getClassSizeLabel(course);

  const VIEWPORT_PADDING = 12;
  const POPUP_GAP = 12;
  const CARD_WIDTH = Math.min(320, window.innerWidth - (VIEWPORT_PADDING * 2));
  let left = rect.right + POPUP_GAP;
  let top = rect.top;

  // Check Window Boundaries
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const hasRoomOnRight = rect.right + POPUP_GAP + CARD_WIDTH <= windowWidth - VIEWPORT_PADDING;
  const hasRoomOnLeft = rect.left - POPUP_GAP - CARD_WIDTH >= VIEWPORT_PADDING;

  if (hasRoomOnRight) {
    left = rect.right + POPUP_GAP;
  } else if (hasRoomOnLeft) {
    left = rect.left - CARD_WIDTH - POPUP_GAP;
  } else {
    const centeredLeft = rect.left + (rect.width / 2) - (CARD_WIDTH / 2);
    left = Math.min(
      Math.max(centeredLeft, VIEWPORT_PADDING),
      windowWidth - CARD_WIDTH - VIEWPORT_PADDING
    );
  }

  // Vertical Adjustment
  const estimatedHeight = 350; // Rough estimate
  const centeredTop = rect.top + (rect.height / 2) - (estimatedHeight / 2);
  top = Math.min(
    Math.max(centeredTop, 70),
    windowHeight - estimatedHeight - VIEWPORT_PADDING
  );

  // Ensure not off-screen top
  if (top < 70) top = 70; // 70px for header bar

  return (
    <div
      className="fixed z-50 animate-in zoom-in-95 fade-in duration-200"
      style={{ top, left, width: CARD_WIDTH }}
      onMouseEnter={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        {/* Color Stripe */}
        <div className="h-1.5 w-full" style={{ backgroundColor: getSubjectColor(course.code) }} />

        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h4 className="font-bold text-base leading-snug text-slate-900 dark:text-slate-100">{course.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono text-[10px]">{course.code}</Badge>
                {course.group && <Badge variant="secondary" className="text-[10px]">Nhóm {course.group}</Badge>}
              </div>
            </div>
            {isActive && (
              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-foreground" onClick={onClose}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {/* Location */}
            <div className="flex items-start gap-2.5 text-sm">
              <div className="mt-0.5 p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div>
                <span className="font-medium text-xs text-muted-foreground uppercase">Phòng học</span>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{course.room}</div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-2.5 text-sm">
              <div className="mt-0.5 p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div>
                <span className="font-medium text-xs text-muted-foreground uppercase">Thời gian</span>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {course.time} (Tiết {course.startPeriod} - {course.endPeriod})
                </div>
              </div>
            </div>

            {/* Weeks */}
            {course.weeks && (
              <div className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div>
                  <span className="font-medium text-xs text-muted-foreground uppercase">Tuần học</span>
                  <div className="text-xs text-muted-foreground break-words max-h-20 overflow-y-auto pr-1">
                    {course.weeks.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {teacherLabel && (
              <div className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div>
                  <span className="font-medium text-xs text-muted-foreground uppercase">Giảng viên</span>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {teacherLabel}
                  </div>
                </div>
              </div>
            )}

            {classSizeLabel && (
              <div className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div>
                  <span className="font-medium text-xs text-muted-foreground uppercase">Sĩ số lớp</span>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {classSizeLabel}
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {course.notes && (
              <div className="flex items-start gap-2.5 text-sm pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 mt-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-xs italic text-muted-foreground">
                  {course.notes}
                </div>
              </div>
            )}
          </div>

          {!isActive && (
            <div className="text-[10px] text-center text-muted-foreground/60 pt-2 border-t font-medium mt-1">
              Nhấn để xem chi tiết & giữ thẻ này
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ScheduleTab;
