import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  CalendarRange,
  Trash2,
  GripVertical,
  Sparkles,
  Target,
  BookOpen,
  Search,
  Check,
  BookMarked,
  AlertTriangle,
  Sun,
  GraduationCap,
  X,
  Maximize2,
  NotebookPen,
  StickyNote,
  Expand,
  MessageSquare
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const createEmptySemester = (index) => ({
  id: Date.now() + index,
  name: `HK ${index + 1}`,
  year: index < 3 ? "K25" : "",
  note: "",
  courses: []
});

// Palette màu cho các môn học - theo mã môn
const COURSE_COLORS = [
  { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800/50", text: "text-blue-700 dark:text-blue-400" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/50", text: "text-emerald-700 dark:text-emerald-400" },
  { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800/50", text: "text-violet-700 dark:text-violet-400" },
  { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800/50", text: "text-rose-700 dark:text-rose-400" },
  { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/50", text: "text-amber-700 dark:text-amber-400" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800/50", text: "text-cyan-700 dark:text-cyan-400" },
  { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800/50", text: "text-pink-700 dark:text-pink-400" },
  { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800/50", text: "text-indigo-700 dark:text-indigo-400" },
];

// Palette màu sticky note pastel cho các card học kỳ
const STICKY_NOTE_COLORS = [
  {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200/60 dark:border-yellow-700/40",
    shadow: "shadow-yellow-200/50 dark:shadow-yellow-900/30",
    tape: "bg-yellow-300/70 dark:bg-yellow-600/50"
  },
  {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200/60 dark:border-pink-700/40",
    shadow: "shadow-pink-200/50 dark:shadow-pink-900/30",
    tape: "bg-pink-300/70 dark:bg-pink-600/50"
  },
  {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    border: "border-sky-200/60 dark:border-sky-700/40",
    shadow: "shadow-sky-200/50 dark:shadow-sky-900/30",
    tape: "bg-sky-300/70 dark:bg-sky-600/50"
  },
  {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200/60 dark:border-emerald-700/40",
    shadow: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
    tape: "bg-emerald-300/70 dark:bg-emerald-600/50"
  },
  {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200/60 dark:border-violet-700/40",
    shadow: "shadow-violet-200/50 dark:shadow-violet-900/30",
    tape: "bg-violet-300/70 dark:bg-violet-600/50"
  },
  {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200/60 dark:border-orange-700/40",
    shadow: "shadow-orange-200/50 dark:shadow-orange-900/30",
    tape: "bg-orange-300/70 dark:bg-orange-600/50"
  },
];

// Lấy màu sticky note dựa trên index
const getStickyNoteStyle = (index) => {
  return {
    color: STICKY_NOTE_COLORS[index % STICKY_NOTE_COLORS.length]
  };
};

// Lấy màu dựa trên mã môn học
const getCourseColor = (code) => {
  if (!code) return COURSE_COLORS[0];
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_COLORS[hash % COURSE_COLORS.length];
};

// Chuyển điểm hệ 10 sang hệ 4 (theo chuẩn BK)
const convertToGpa4 = (score10) => {
  const score = parseFloat(score10);
  if (isNaN(score)) return 0;
  if (score >= 8.5) return 4.0;
  if (score >= 8.0) return 3.5;
  if (score >= 7.0) return 3.0;
  if (score >= 6.5) return 2.5;
  if (score >= 5.5) return 2.0;
  if (score >= 5.0) return 1.5;
  if (score >= 4.0) return 1.0;
  return 0.0;
};

// Lấy điểm chữ từ điểm hệ 10
const getLetterGrade = (score10) => {
  const score = parseFloat(score10);
  if (isNaN(score)) return '';
  if (score >= 9.5) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'D+';
  if (score >= 4.0) return 'D';
  return 'F';
};

// Tính GPA trung bình cho học kỳ
const calculateSemesterGpa = (courses) => {
  let totalCredits = 0;
  let totalScore10 = 0;
  let totalScore4 = 0;
  let validCourses = 0;

  courses.forEach(course => {
    const credits = parseInt(course.credits) || 0;
    const aim = parseFloat(course.aim);

    if (credits > 0 && !isNaN(aim) && aim >= 0 && aim <= 10) {
      totalCredits += credits;
      totalScore10 += aim * credits;
      totalScore4 += convertToGpa4(aim) * credits;
      validCourses++;
    }
  });

  if (totalCredits === 0) return null;

  return {
    gpa10: (totalScore10 / totalCredits).toFixed(2),
    gpa4: (totalScore4 / totalCredits).toFixed(2),
    validCourses
  };
};

function RoadmapTab() {
  const [semesters, setSemesters] = useLocalStorage("studyRoadmap", [
    createEmptySemester(0),
    createEmptySemester(1),
    createEmptySemester(2)
  ]);
  const [dragItem, setDragItem] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [referenceCourses, setReferenceCourses] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState(null); // { semester, globalIndex, isSummer }
  const [notePopup, setNotePopup] = useState(null); // { semesterId, type: 'semester' | 'course', courseId? }
  const [addCoursePopup, setAddCoursePopup] = useState(null); // { semesterId, newCourse: { code, name, credits, aim, note } }
  const [addCourseSearchOpen, setAddCourseSearchOpen] = useState(false); // Search trong popup thêm môn
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm chung

  // Lọc danh sách môn học dựa trên searchTerm thông minh (tìm theo mã hoặc tên)
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return referenceCourses.slice(0, 15); // Mặc định hiện 15 môn đầu

    const query = searchTerm.toLowerCase().trim();
    const matches = referenceCourses.filter(c =>
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query)
    );

    // Giới hạn chỉ hiển thị 30 kết quả đầu để tránh lag giao diện
    return matches.slice(0, 30);
  }, [referenceCourses, searchTerm]);

  // Load danh sách môn học tham khảo
  React.useEffect(() => {
    fetch('/data/all_courses_master.json')
      .then(res => res.json())
      .then(data => setReferenceCourses(data))
      .catch(err => console.error("Lỗi load danh sách môn học:", err));
  }, []);

  const addSemester = () => {
    setSemesters((prev) => [...prev, createEmptySemester(prev.length)]);
  };

  const removeSemester = (semesterId) => {
    setSemesters((prev) => prev.filter((s) => s.id !== semesterId));
  };

  // Mở popup thêm môn học
  const openAddCoursePopup = (semesterId) => {
    setAddCoursePopup({
      semesterId,
      newCourse: { code: '', name: '', credits: '', aim: '', note: '' }
    });
  };

  // Xác nhận thêm môn từ popup
  const confirmAddCourse = () => {
    if (!addCoursePopup) return;

    const { semesterId, newCourse } = addCoursePopup;

    // Chỉ thêm nếu có ít nhất code hoặc name
    if (newCourse.code || newCourse.name) {
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === semesterId
            ? {
              ...s,
              courses: [
                ...s.courses,
                {
                  id: Date.now(),
                  ...newCourse
                }
              ]
            }
            : s
        )
      );
    }

    setAddCoursePopup(null);
  };

  // Cập nhật field trong popup thêm môn
  const updateNewCourseField = (field, value) => {
    if (!addCoursePopup) return;
    setAddCoursePopup(prev => ({
      ...prev,
      newCourse: { ...prev.newCourse, [field]: value }
    }));
  };

  const updateCourse = (semesterId, courseId, field, value) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? {
            ...s,
            courses: s.courses.map((c) =>
              c.id === courseId ? { ...c, [field]: value } : c
            )
          }
          : s
      )
    );
  };

  // Cập nhật nhiều fields cùng lúc để tránh race condition
  const updateCourseMultiple = (semesterId, courseId, updates) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? {
            ...s,
            courses: s.courses.map((c) =>
              c.id === courseId ? { ...c, ...updates } : c
            )
          }
          : s
      )
    );
  };


  const removeCourse = (semesterId, courseId) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s
      )
    );
  };

  const handleDragStart = (semesterId, courseId) => {
    setDragItem({ semesterId, courseId });
  };

  const handleDropOnSemester = (targetSemesterId) => {
    if (!dragItem) return;
    const { semesterId, courseId } = dragItem;
    if (semesterId === targetSemesterId) {
      setDragItem(null);
      return;
    }

    setSemesters((prev) => {
      let movedCourse = null;
      const removed = prev.map((s) => {
        if (s.id !== semesterId) return s;
        const remaining = s.courses.filter(c => {
          if (c.id === courseId) {
            movedCourse = c;
            return false;
          }
          return true;
        });
        return { ...s, courses: remaining };
      });

      if (!movedCourse) return prev;

      return removed.map((s) =>
        s.id === targetSemesterId
          ? { ...s, courses: [...s.courses, movedCourse] }
          : s
      );
    });
    setDragItem(null);
  };

  const updateSemesterMeta = (semesterId, field, value) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId ? { ...s, [field]: value } : s
      )
    );
  };

  const resetRoadmap = () => {
    if (window.confirm("Xóa toàn bộ roadmap đã tạo?")) {
      setSemesters([createEmptySemester(0), createEmptySemester(1), createEmptySemester(2)]);
    }
  };

  const groupedSemesters = [];
  for (let i = 0; i < semesters.length; i += 3) {
    groupedSemesters.push(semesters.slice(i, i + 3));
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header with Tips and Actions */}
      <div className="flex flex-col gap-3">
        {/* Tips Row */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { icon: Sparkles, text: "Kéo thả môn học để sắp xếp lại giữa các kỳ", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
            { icon: Target, text: "Ghi chú mục tiêu GPA và kế hoạch thực tập", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
            { icon: CalendarRange, text: "Mỗi năm học bao gồm 3 kỳ: HK1, HK2 và Hè", color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" }
          ].map((tip, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${tip.color}`}>
              <tip.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{tip.text}</span>
              <span className="sm:hidden">{tip.text.split(' ').slice(0, 4).join(' ')}...</span>
            </div>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetRoadmap}
            className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa toàn bộ
          </Button>
          <Button
            size="sm"
            onClick={addSemester}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm học kỳ
          </Button>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <ScrollArea className="w-full">
        <div className="relative pb-8 pt-2">
          {/* Timeline vertical line - Corkboard strip style */}
          <div className="absolute left-[9px] top-2 bottom-8 w-[5px] hidden md:block">
            {/* Main strip - warm brown cork color */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-amber-300 to-orange-300 dark:from-amber-700 dark:via-amber-600 dark:to-orange-600 rounded-full shadow-sm" />
            {/* Cork texture dots */}
            <div className="absolute inset-0 opacity-30 rounded-full" style={{
              backgroundImage: `radial-gradient(circle at 50% 10%, rgba(139,69,19,0.3) 1px, transparent 1px),
                               radial-gradient(circle at 30% 40%, rgba(139,69,19,0.2) 1px, transparent 1px),
                               radial-gradient(circle at 70% 60%, rgba(139,69,19,0.25) 1px, transparent 1px),
                               radial-gradient(circle at 40% 80%, rgba(139,69,19,0.2) 1px, transparent 1px)`,
              backgroundSize: '100% 20px'
            }} />
          </div>

          <div className="space-y-12">
            {groupedSemesters.map((yearSemesters, yearIdx) => {
              const firstSem = yearSemesters[0];
              // Hiển thị theo format Khóa: K25, K26, v.v.
              const yearLabel = firstSem?.year || `K${25 + yearIdx}`;

              return (
                <div key={yearIdx} className="relative">
                  {/* Year Label */}
                  <div className="flex items-center gap-4 mb-6">
                    {/* Circle node on timeline - Colorful pushpin style */}
                    <div className="relative hidden md:flex items-center justify-center w-6 h-6 flex-shrink-0">
                      {/* Pin shadow */}
                      <div className="absolute h-5 w-5 rounded-full bg-black/10 dark:bg-black/30 translate-x-0.5 translate-y-0.5" />
                      {/* Pin head - colorful based on year */}
                      <div className={`absolute h-5 w-5 rounded-full shadow-md border-2 border-white/50 dark:border-white/20 ${yearIdx % 4 === 0 ? 'bg-gradient-to-br from-red-400 to-red-600' :
                        yearIdx % 4 === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          yearIdx % 4 === 2 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                            'bg-gradient-to-br from-purple-400 to-purple-600'
                        }`} />
                      {/* Pin highlight */}
                      <div className="absolute h-1.5 w-1.5 rounded-full bg-white/60 top-1 left-1" />
                    </div>
                    <div className="flex items-center gap-3 md:ml-2 group">
                      <div className="relative flex items-center shadow-sm">
                        <div className="absolute left-0.5 h-7 w-7 flex items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-white z-10 shadow-lg shadow-indigo-500/20">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <Input
                          value={firstSem?.year || ""}
                          onChange={(e) => updateSemesterMeta(firstSem?.id, "year", e.target.value)}
                          className="w-28 pl-9 pr-3 h-8 text-xs font-black bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 focus:ring-indigo-500/30 rounded-full transition-all"
                          placeholder={`Khóa K${25 + yearIdx}`}
                        />
                      </div>
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/50 via-indigo-400/20 to-transparent max-w-[120px]" />
                    </div>
                  </div>

                  {/* Semesters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:ml-10">
                    {yearSemesters.map((semester, idx) => {
                      const globalIndex = yearIdx * 3 + idx;
                      const isSummer = globalIndex % 3 === 2;
                      // Lấy sticky note style dựa trên globalIndex
                      const stickyStyle = isSummer
                        ? { color: STICKY_NOTE_COLORS[5] } // Orange cho học kỳ hè
                        : getStickyNoteStyle(globalIndex);

                      return (
                        <div
                          key={semester.id}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropOnSemester(semester.id)}
                          className="relative"
                        >
                          {/* Connection line from timeline to card - Simple string style */}
                          <div className="absolute -left-[36px] top-[14px] w-[40px] h-[8px] hidden md:block">
                            {/* Simple curved string/ribbon */}
                            <svg className="w-full h-full" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Main connection line - matches sticky note tape color softly */}
                              <path
                                d="M0 4 Q10 2, 20 4 Q30 6, 40 4"
                                className="stroke-amber-400/60 dark:stroke-amber-500/50"
                                strokeWidth="2"
                                strokeLinecap="round"
                                fill="none"
                              />
                              {/* Highlight line */}
                              <path
                                d="M2 3.5 Q12 2, 20 3.5 Q28 5, 38 4"
                                className="stroke-white/30 dark:stroke-white/10"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                fill="none"
                              />
                            </svg>
                          </div>

                          {/* Sticky Note Card */}
                          <div className="relative">
                            {/* Tape effect at top */}
                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 ${stickyStyle.color.tape} rounded-sm opacity-90 z-10 shadow-sm`}
                              style={{
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
                              }}
                            />
                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 ${stickyStyle.color.tape} rounded-sm z-10`}
                              style={{ transform: 'translateX(-50%)' }}
                            />

                            <Card className={`h-full transition-all duration-300 border-0 ${stickyStyle.color.bg} ${stickyStyle.color.border} border
                              shadow-[4px_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_20px_rgba(0,0,0,0.12)]
                              dark:shadow-[4px_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[6px_6px_20px_rgba(0,0,0,0.4)]
                              relative overflow-hidden`}
                            >
                              {/* Paper texture overlay */}
                              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                                }}
                              />

                              {/* Folded corner effect */}
                              <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
                                <div className="absolute bottom-0 right-0 w-0 h-0 
                                  border-l-[24px] border-l-transparent 
                                  border-b-[24px] border-b-white/40 dark:border-b-black/20"
                                />
                              </div>

                              <CardContent className="p-4 flex flex-col gap-3 relative z-[1]">
                                {/* Semester Header */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 space-y-2">
                                    <Badge
                                      variant="secondary"
                                      className={`text-[10px] font-semibold shadow-sm flex items-center gap-1 w-fit ${isSummer
                                        ? "bg-orange-200/80 text-orange-800 dark:bg-orange-800/40 dark:text-orange-200 border border-orange-300/50"
                                        : "bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-gray-600/30"
                                        }`}
                                    >
                                      {isSummer ? (
                                        <><Sun className="h-3 w-3" /> HỌC KỲ HÈ</>
                                      ) : (
                                        <><GraduationCap className="h-3 w-3" /> HỌC KỲ {(globalIndex % 3) + 1}</>
                                      )}
                                    </Badge>

                                    <Input
                                      value={semester.name}
                                      onChange={(e) => updateSemesterMeta(semester.id, "name", e.target.value)}
                                      className="h-8 text-sm font-semibold text-foreground bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-gray-600/50"
                                      placeholder={`Học kỳ ${globalIndex + 1}`}
                                    />
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Expand button */}
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
                                      onClick={() => setExpandedSemester({ semester, globalIndex, isSummer })}
                                      title="Xem chi tiết"
                                    >
                                      <Maximize2 className="h-3.5 w-3.5" />
                                    </Button>

                                    {semesters.length > 1 && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={() => removeSemester(semester.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Semester Stats */}
                                {(() => {
                                  const totalCourses = semester.courses.length;
                                  const totalCredits = semester.courses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0);
                                  const isOverLimit = totalCredits > 18;
                                  const gpaStats = calculateSemesterGpa(semester.courses);

                                  return (
                                    <div className="space-y-2">
                                      {/* Credits & Courses */}
                                      <div className={`flex items-center gap-3 p-2 rounded-lg text-xs ${isOverLimit ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50" : "bg-muted/50"}`}>
                                        <div className="flex items-center gap-1.5">
                                          <BookMarked className="h-3.5 w-3.5 text-muted-foreground" />
                                          <span className="font-medium">{totalCourses} môn</span>
                                        </div>
                                        <div className="h-3 w-px bg-border" />
                                        <div className={`flex items-center gap-1.5 ${isOverLimit ? "text-red-600 dark:text-red-400 font-semibold" : ""}`}>
                                          {isOverLimit && <AlertTriangle className="h-3.5 w-3.5" />}
                                          <span className="font-medium">{totalCredits}/18 TC</span>
                                        </div>
                                        {isOverLimit && (
                                          <span className="text-[10px] text-red-600 dark:text-red-400">
                                            (+{totalCredits - 18} phí)
                                          </span>
                                        )}
                                      </div>

                                      {/* GPA Stats */}
                                      {gpaStats && (
                                        <div className="flex items-center gap-3 p-2 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                                          <div className="flex items-center gap-1.5">
                                            <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">GPA Mục tiêu</span>
                                          </div>
                                          <div className="h-3 w-px bg-emerald-300 dark:bg-emerald-700" />
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                              {gpaStats.gpa10} <span className="font-normal text-emerald-600/70 dark:text-emerald-400/70">/10</span>
                                            </span>
                                            <span className="text-emerald-500">|</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                              {gpaStats.gpa4} <span className="font-normal text-emerald-600/70 dark:text-emerald-400/70">/4</span>
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* Note */}
                                <Textarea
                                  value={semester.note}
                                  onChange={(e) => updateSemesterMeta(semester.id, "note", e.target.value)}
                                  className="min-h-[60px] text-xs resize-none"
                                  placeholder="Ghi chú: mục tiêu GPA, kế hoạch thực tập..."
                                />

                                {/* Courses - max 3 visible with scroll */}
                                <div className="flex-1 min-h-[80px] max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-1">
                                  {semester.courses.length === 0 ? (
                                    <div className="h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 dark:border-border bg-muted/30">
                                      <Sparkles className="h-4 w-4 text-muted-foreground/40 mb-1" />
                                      <p className="text-[10px] text-muted-foreground/60">
                                        Chưa có môn học
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {semester.courses.map((course) => {
                                        const isEditing = editingCourseId === course.id;
                                        const colorScheme = getCourseColor(course.code);
                                        return (
                                          <div
                                            key={course.id}
                                            draggable
                                            onDragStart={() => handleDragStart(semester.id, course.id)}
                                            className={`group rounded-lg border p-2.5 transition-all cursor-grab active:cursor-grabbing ${isEditing
                                              ? "border-primary dark:border-primary bg-primary/5 shadow-sm"
                                              : `${colorScheme.border} ${colorScheme.bg} hover:shadow-sm`
                                              }`}
                                          >
                                            {!isEditing ? (
                                              <div
                                                onClick={() => setEditingCourseId(course.id)}
                                                className="space-y-1.5"
                                              >
                                                <div className="flex items-center justify-between gap-2">
                                                  <span className={`text-[10px] font-mono font-bold ${colorScheme.text} ${colorScheme.bg} px-1.5 py-0.5 rounded`}>
                                                    {course.code || "MÃ MH"}
                                                  </span>
                                                  <div className="flex items-center gap-1.5">
                                                    {course.aim && (
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                          Aim: {course.aim}
                                                        </span>
                                                        <span className="text-[8px] font-semibold text-emerald-500 dark:text-emerald-500">
                                                          ({getLetterGrade(course.aim)})
                                                        </span>
                                                      </div>
                                                    )}
                                                    {course.credits && (
                                                      <span className="text-[9px] font-semibold text-muted-foreground">
                                                        {course.credits} TC
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                                <h5 className="text-xs font-semibold leading-snug line-clamp-2 text-foreground">
                                                  {course.name || "Tên môn học"}
                                                </h5>
                                                {course.note && (
                                                  <p className="text-[10px] text-muted-foreground/70 line-clamp-1">
                                                    {course.note}
                                                  </p>
                                                )}
                                                <GripVertical className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                              </div>
                                            ) : (
                                              <div className="space-y-2 p-1 animate-in slide-in-from-top-2 duration-300">
                                                {/* Nút tìm kiếm môn học nhanh */}
                                                <Popover open={searchOpen && editingCourseId === course.id} onOpenChange={setSearchOpen}>
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant="outline"
                                                      role="combobox"
                                                      aria-expanded={searchOpen}
                                                      className="w-full h-8 justify-between text-[11px] font-medium border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                                                    >
                                                      <div className="flex items-center gap-2">
                                                        <Search className="h-3 w-3 text-primary" />
                                                        <span>Tìm môn trong CTDT...</span>
                                                      </div>
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-[300px] p-0" align="start">
                                                    <Command>
                                                      <CommandInput placeholder="Tìm mã hoặc tên môn..." className="h-9 text-sm" />
                                                      <CommandList className="max-h-[250px]">
                                                        <CommandEmpty>Không tìm thấy môn học.</CommandEmpty>
                                                        <CommandGroup header="Danh sách môn học">
                                                          {referenceCourses.map((ref) => (
                                                            <CommandItem
                                                              key={ref.id}
                                                              value={`${ref.code} ${ref.name}`}
                                                              onSelect={() => {
                                                                updateCourseMultiple(semester.id, course.id, {
                                                                  code: ref.code,
                                                                  name: ref.name,
                                                                  credits: ref.credits
                                                                });
                                                                setSearchOpen(false);
                                                              }}
                                                              className="text-xs py-2 cursor-pointer"
                                                            >
                                                              <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-center gap-2">
                                                                  <span className="font-mono font-bold text-primary">{ref.code}</span>
                                                                  <span className="font-semibold">{ref.name}</span>
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground">{ref.credits} tín chỉ</span>
                                                              </div>
                                                            </CommandItem>
                                                          ))}
                                                        </CommandGroup>
                                                      </CommandList>
                                                    </Command>
                                                  </PopoverContent>
                                                </Popover>

                                                <div className="grid grid-cols-2 gap-2">
                                                  <Input
                                                    autoFocus
                                                    value={course.code}
                                                    onChange={(e) => updateCourse(semester.id, course.id, "code", e.target.value)}
                                                    className="h-8 text-[11px] font-mono"
                                                    placeholder="Mã MH"
                                                  />
                                                  <Input
                                                    value={course.credits}
                                                    onChange={(e) => updateCourse(semester.id, course.id, "credits", e.target.value)}
                                                    className="h-8 text-[11px]"
                                                    placeholder="Tín chỉ"
                                                  />
                                                </div>
                                                <Input
                                                  value={course.name}
                                                  onChange={(e) => updateCourse(semester.id, course.id, "name", e.target.value)}
                                                  className="h-8 text-xs font-semibold"
                                                  placeholder="Tên môn học"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                  <Input
                                                    value={course.aim || ""}
                                                    onChange={(e) => updateCourse(semester.id, course.id, "aim", e.target.value)}
                                                    className="h-8 text-[11px]"
                                                    placeholder="Mục tiêu (điểm 0-10)"
                                                  />
                                                  <Textarea
                                                    value={course.note}
                                                    onChange={(e) => updateCourse(semester.id, course.id, "note", e.target.value)}
                                                    className="min-h-[32px] h-8 text-[11px] resize-none"
                                                    placeholder="Ghi chú"
                                                  />
                                                </div>
                                                <div className="flex gap-2">
                                                  <Button
                                                    size="sm"
                                                    className="flex-1 h-7 text-[11px]"
                                                    onClick={() => setEditingCourseId(null)}
                                                  >
                                                    Xong
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                                                    onClick={() => removeCourse(semester.id, course.id)}
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAddCoursePopup(semester.id)}
                                  className="w-full border-dashed h-8 text-[11px] font-semibold"
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                                  Thêm môn
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Expanded Semester Dialog */}
      <Dialog open={!!expandedSemester} onOpenChange={(open) => !open && setExpandedSemester(null)}>
        {expandedSemester && (() => {
          const { globalIndex, isSummer } = expandedSemester;
          // Lấy semester mới nhất từ state để đồng bộ hóa thay đổi
          const semester = semesters.find(s => s.id === expandedSemester.semester.id);
          if (!semester) return null;

          // Lấy sticky style tương ứng để matching màu sắc
          const dialogStickyStyle = isSummer
            ? { color: STICKY_NOTE_COLORS[5] }
            : getStickyNoteStyle(globalIndex);

          const totalCredits = semester.courses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0);
          const isOverLimit = totalCredits > 18;
          const gpaStats = calculateSemesterGpa(semester.courses);

          return (
            <DialogContent className={`max-w-7xl max-h-[95vh] overflow-y-auto flex flex-col border-2 ${dialogStickyStyle.color.border} ${dialogStickyStyle.color.bg}`}>
              {/* Paper texture overlay */}
              <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none rounded-lg"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              {/* Tape effect at top of dialog */}
              <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 ${dialogStickyStyle.color.tape} rounded-sm opacity-90 z-10 shadow-sm`}
                style={{ transform: 'translateX(-50%)' }}
              />

              <DialogHeader className="pb-4 border-b relative z-[1]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1 ${isSummer
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                        : "bg-primary/10 text-primary"
                        }`}
                    >
                      {isSummer ? (
                        <><Sun className="h-3.5 w-3.5" /> HỌC KỲ HÈ</>
                      ) : (
                        <><GraduationCap className="h-3.5 w-3.5" /> HỌC KỲ {(globalIndex % 3) + 1}</>
                      )}
                    </Badge>
                    <DialogTitle className="text-lg font-bold">
                      {semester.name || `Học kỳ ${globalIndex + 1}`}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="sr-only">
                  Chi tiết và danh sách môn học của {semester.name || `Học kỳ ${globalIndex + 1}`}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1">
                <div className="space-y-4 py-4 px-1">
                  {/* Combined Info Row: Semester Details + Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative z-[1]">
                    {/* Left: Semester Info - Compact Card Style */}
                    <div className="lg:col-span-3 rounded-xl border border-border/50 bg-white/50 dark:bg-white/5 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <NotebookPen className="h-3.5 w-3.5" />
                        Thông tin học kỳ
                      </div>

                      {/* Name + Year inline */}
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground mb-1 block">Tên học kỳ</label>
                          <Input
                            value={semester.name}
                            onChange={(e) => updateSemesterMeta(semester.id, "name", e.target.value)}
                            className="h-9 text-sm font-medium"
                            placeholder="VD: HK1 Năm nhất"
                          />
                        </div>
                        <div className="w-32 relative group">
                          <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-1.5 block uppercase tracking-widest px-1">Niên khóa</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3 text-indigo-600 dark:text-indigo-400 z-10">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <Input
                              value={semester.year}
                              onChange={(e) => updateSemesterMeta(semester.id, "year", e.target.value)}
                              className="h-10 pl-10 text-sm font-bold bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-300/50"
                              placeholder={`K${25 + globalIndex}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Note with expand button */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-muted-foreground">Ghi chú</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary"
                            onClick={() => setNotePopup({ semesterId: semester.id, type: 'semester' })}
                          >
                            <Expand className="h-3 w-3 mr-1" />
                            Mở rộng
                          </Button>
                        </div>
                        <div
                          className="min-h-[48px] max-h-[48px] overflow-hidden text-xs bg-muted/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                          onClick={() => setNotePopup({ semesterId: semester.id, type: 'semester' })}
                        >
                          {semester.note ? (
                            <p className="text-foreground/80 line-clamp-2">{semester.note}</p>
                          ) : (
                            <p className="text-muted-foreground/50 italic">Click để thêm ghi chú...</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Stats - Card Style */}
                    <div className="lg:col-span-2 rounded-xl border border-border/50 bg-white/50 dark:bg-white/5 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <BookMarked className="h-3.5 w-3.5" />
                        Thống kê
                      </div>

                      <div className="flex gap-3">
                        {/* Stats Mini Card */}
                        <div className={`flex-1 rounded-lg p-3 ${isOverLimit
                          ? "bg-red-100/80 dark:bg-red-950/40 border border-red-200/50 dark:border-red-800/30"
                          : "bg-sky-100/80 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/30"}`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`text-[10px] uppercase ${isOverLimit ? "text-red-600/70 dark:text-red-400/70" : "text-sky-600/70 dark:text-sky-400/70"}`}>Số môn</span>
                              <span className={`text-lg font-bold ${isOverLimit ? "" : "text-sky-700 dark:text-sky-300"}`}>{semester.courses.length}</span>
                            </div>
                            <div className={`flex justify-between items-center ${isOverLimit ? "text-red-600 dark:text-red-400" : ""}`}>
                              <span className={`text-[10px] uppercase ${isOverLimit ? "" : "text-sky-600/70 dark:text-sky-400/70"}`}>Tín chỉ</span>
                              <span className={`text-lg font-bold flex items-center gap-1 ${isOverLimit ? "" : "text-sky-700 dark:text-sky-300"}`}>
                                {isOverLimit && <AlertTriangle className="h-4 w-4" />}
                                {totalCredits}<span className={`text-xs font-normal ${isOverLimit ? "text-red-500/70" : "text-sky-600/70 dark:text-sky-400/70"}`}>/18</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* GPA Mini Card */}
                        <div className={`flex-1 rounded-lg p-3 ${gpaStats
                          ? "bg-emerald-100/80 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/30"
                          : "bg-muted/50 dark:bg-muted/20"}`}
                        >
                          {gpaStats ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                                <Target className="h-3 w-3" />
                                GPA Mục tiêu
                              </div>
                              <div className="flex justify-between items-baseline">
                                <div className="text-center flex-1">
                                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{gpaStats.gpa10}</div>
                                  <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Hệ 10</div>
                                </div>
                                <div className="text-muted-foreground/30">|</div>
                                <div className="text-center flex-1">
                                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{gpaStats.gpa4}</div>
                                  <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Hệ 4</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-3">
                              <Target className="h-5 w-5 text-muted-foreground/30 mx-auto mb-1" />
                              <p className="text-[10px] text-muted-foreground">Nhập điểm mục tiêu</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Courses List */}
                  <div className="space-y-3 relative z-[1]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        Danh sách môn học ({semester.courses.length})
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Quick search from CTDT */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-dashed gap-1.5 text-foreground bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-gray-500/50 hover:bg-white/80 dark:hover:bg-black/30"
                            >
                              <Search className="h-3 w-3" />
                              Tìm từ CTDT
                              <Sparkles className="h-3 w-3 text-amber-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="end">
                            <Command className="rounded-lg shadow-md" shouldFilter={false}>
                              <CommandInput
                                placeholder="Nhập mã hoặc tên môn học..."
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                              />
                              <CommandList>
                                <CommandEmpty>Không tìm thấy môn học</CommandEmpty>
                                <CommandGroup heading={`Tìm thấy ${searchTerm ? filteredCourses.length : 'tất cả'} môn học`}>
                                  {filteredCourses.map((ref) => (
                                    <CommandItem
                                      key={ref.code}
                                      value={`${ref.code} ${ref.name}`}
                                      onSelect={() => {
                                        // Thêm môn trực tiếp
                                        setSemesters((prev) =>
                                          prev.map((s) =>
                                            s.id === semester.id
                                              ? {
                                                ...s,
                                                courses: [
                                                  ...s.courses,
                                                  {
                                                    id: Date.now(),
                                                    code: ref.code,
                                                    name: ref.name,
                                                    credits: ref.credits,
                                                    aim: "",
                                                    note: ""
                                                  }
                                                ]
                                              }
                                              : s
                                          )
                                        );
                                      }}
                                      className="text-xs py-2.5 cursor-pointer"
                                    >
                                      <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold text-primary">{ref.code}</span>
                                          <span className="font-semibold">{ref.name}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{ref.credits} tín chỉ • Click để thêm</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddCoursePopup(semester.id)}
                          className="h-7 text-xs text-foreground bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-gray-500/50 hover:bg-white/80 dark:hover:bg-black/30"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Thêm môn
                        </Button>
                      </div>
                    </div>

                    {semester.courses.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="p-6 text-center">
                          <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Chưa có môn học nào</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Nhấn "Thêm môn" để bắt đầu
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        {semester.courses.map((course) => {
                          const colorScheme = getCourseColor(course.code);
                          return (
                            <Card key={course.id} className={`${colorScheme.border} ${colorScheme.bg} relative group`}>
                              {/* Delete button - top right */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute -top-1 -right-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full bg-background shadow-sm"
                                onClick={() => removeCourse(semester.id, course.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>

                              <CardContent className="p-3 space-y-2">
                                {/* Row 1: Code + Name */}
                                <div className="flex gap-2">
                                  <div className="w-24 shrink-0">
                                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Mã MH</label>
                                    <Input
                                      value={course.code}
                                      onChange={(e) => updateCourse(semester.id, course.id, "code", e.target.value)}
                                      className="h-8 text-xs font-mono font-bold"
                                      placeholder="CO1005"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Tên môn học</label>
                                    <Input
                                      value={course.name}
                                      onChange={(e) => updateCourse(semester.id, course.id, "name", e.target.value)}
                                      className="h-8 text-xs font-semibold"
                                      placeholder="Nhập tên môn"
                                    />
                                  </div>
                                </div>

                                {/* Row 2: Credits + Aim */}
                                <div className="flex gap-2 items-end">
                                  <div className="w-16 shrink-0">
                                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Tín chỉ</label>
                                    <Input
                                      value={course.credits}
                                      onChange={(e) => updateCourse(semester.id, course.id, "credits", e.target.value)}
                                      className="h-8 text-xs text-center font-medium"
                                      placeholder="TC"
                                    />
                                  </div>
                                  <div className="w-20 shrink-0">
                                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Mục tiêu</label>
                                    <Input
                                      value={course.aim || ""}
                                      onChange={(e) => updateCourse(semester.id, course.id, "aim", e.target.value)}
                                      className="h-8 text-xs text-center font-medium"
                                      placeholder="Điểm"
                                    />
                                  </div>
                                  {course.aim && (
                                    <Badge variant="outline" className="h-8 text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0">
                                      <Target className="h-2.5 w-2.5 mr-1" />
                                      {getLetterGrade(course.aim)}
                                    </Badge>
                                  )}
                                </div>

                                {/* Row 3: Note */}
                                <div
                                  className="flex items-center gap-2 bg-muted/30 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors group/note"
                                  onClick={() => setNotePopup({ semesterId: semester.id, type: 'course', courseId: course.id })}
                                >
                                  <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0" />
                                  {course.note ? (
                                    <p className="text-[11px] text-foreground/70 line-clamp-1 flex-1">{course.note}</p>
                                  ) : (
                                    <p className="text-[11px] text-muted-foreground/50 italic flex-1">Thêm ghi chú...</p>
                                  )}
                                  <Expand className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover/note:opacity-100 transition-opacity shrink-0" />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button onClick={() => setExpandedSemester(null)}>
                  Đóng
                </Button>
              </div>
            </DialogContent >
          );
        })()}
      </Dialog>

      {/* Note Popup Dialog - Sticky Note Style */}
      <Dialog open={!!notePopup} onOpenChange={(open) => !open && setNotePopup(null)}>
        {notePopup && (() => {
          const semester = semesters.find(s => s.id === notePopup.semesterId);
          if (!semester) return null;

          const isCourseNote = notePopup.type === 'course';
          const course = isCourseNote ? semester.courses.find(c => c.id === notePopup.courseId) : null;
          const currentNote = isCourseNote ? (course?.note || '') : (semester.note || '');
          const title = isCourseNote
            ? `Ghi chú: ${course?.name || course?.code || 'Môn học'}`
            : `Ghi chú: ${semester.name || 'Học kỳ'}`;

          const semesterIdStr = String(notePopup.semesterId);
          const stickyColor = STICKY_NOTE_COLORS[Math.abs(semesterIdStr.charCodeAt(0) || 0) % STICKY_NOTE_COLORS.length];

          const handleNoteChange = (value) => {
            if (isCourseNote && course) {
              updateCourse(semester.id, course.id, "note", value);
            } else {
              updateSemesterMeta(semester.id, "note", value);
            }
          };

          return (
            <DialogContent className={`max-w-2xl max-h-[80vh] flex flex-col border-2 ${stickyColor.border} ${stickyColor.bg}`}>
              {/* Paper texture */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rounded-lg"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              {/* Tape effect */}
              <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 ${stickyColor.tape} rounded-sm opacity-90 z-10 shadow-sm`} />

              <DialogHeader className="relative z-[1] pb-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-muted-foreground" />
                  <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
                </div>
                <DialogDescription className="sr-only">
                  Nhập ghi chú cho {isCourseNote ? 'môn học' : 'học kỳ'}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 relative z-[1] py-4">
                <Textarea
                  value={currentNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  className="w-full h-full min-h-[300px] text-sm resize-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
                  placeholder={isCourseNote
                    ? "Ghi chú về môn học: tài liệu tham khảo, lịch thi, nhóm học tập, thông tin giảng viên, deadline bài tập..."
                    : "Ghi chú học kỳ: mục tiêu GPA, kế hoạch thực tập, sự kiện quan trọng, deadlines, lịch nghỉ..."
                  }
                  autoFocus
                />
              </div>

              <div className="pt-3 border-t border-border/30 flex items-center justify-between relative z-[1]">
                <p className="text-[10px] text-muted-foreground">
                  {currentNote.length} ký tự • Tự động lưu
                </p>
                <Button onClick={() => setNotePopup(null)} size="sm">
                  Xong
                </Button>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* Add Course Popup Dialog */}
      <Dialog open={!!addCoursePopup} onOpenChange={(open) => !open && setAddCoursePopup(null)}>
        {addCoursePopup && (() => {
          const semester = semesters.find(s => s.id === addCoursePopup.semesterId);
          if (!semester) return null;

          const stickyColor = STICKY_NOTE_COLORS[Math.abs(String(addCoursePopup.semesterId).charCodeAt(0) || 0) % STICKY_NOTE_COLORS.length];

          return (
            <DialogContent className={`max-w-md flex flex-col border-2 ${stickyColor.border} ${stickyColor.bg}`}>
              {/* Paper texture */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rounded-lg"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              {/* Tape effect */}
              <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 ${stickyColor.tape} rounded-sm opacity-90 z-10 shadow-sm`} />

              <DialogHeader className="relative z-[1] pb-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-foreground" />
                  <DialogTitle className="text-base font-semibold text-foreground">Thêm môn học mới</DialogTitle>
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  Thêm vào: <span className="font-medium text-foreground">{semester.name || 'Học kỳ'}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 relative z-[1]">
                {/* Search from CTDT */}
                <Popover open={addCourseSearchOpen} onOpenChange={setAddCourseSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start gap-2 text-sm font-medium border-dashed"
                    >
                      <Search className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Tìm môn từ CTDT...</span>
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 ml-auto" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command className="rounded-lg shadow-md" shouldFilter={false}>
                      <CommandInput
                        placeholder="Nhập mã hoặc tên môn học..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy môn học</CommandEmpty>
                        <CommandGroup heading={`Tìm thấy ${searchTerm ? filteredCourses.length : 'tất cả'} môn học`}>
                          {filteredCourses.map((ref) => (
                            <CommandItem
                              key={ref.code}
                              value={`${ref.code} ${ref.name}`}
                              onSelect={() => {
                                setAddCoursePopup(prev => ({
                                  ...prev,
                                  newCourse: {
                                    ...prev.newCourse,
                                    code: ref.code,
                                    name: ref.name,
                                    credits: ref.credits
                                  }
                                }));
                                setAddCourseSearchOpen(false);
                              }}
                              className="text-xs py-2.5 cursor-pointer"
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-primary">{ref.code}</span>
                                  <span className="font-semibold">{ref.name}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">{ref.credits} tín chỉ</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="px-2 text-muted-foreground bg-card dark:bg-card">hoặc nhập thủ công</span>
                  </div>
                </div>

                {/* Row 1: Code + Name */}
                <div className="flex gap-3">
                  <div className="w-28 shrink-0">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mã môn học</label>
                    <Input
                      value={addCoursePopup.newCourse.code}
                      onChange={(e) => updateNewCourseField('code', e.target.value)}
                      className="h-10 text-sm font-mono font-bold"
                      placeholder="CO1005"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tên môn học</label>
                    <Input
                      value={addCoursePopup.newCourse.name}
                      onChange={(e) => updateNewCourseField('name', e.target.value)}
                      className="h-10 text-sm font-semibold"
                      placeholder="Nhập tên môn học"
                    />
                  </div>
                </div>

                {/* Row 2: Credits + Aim */}
                <div className="flex gap-3">
                  <div className="w-28 shrink-0">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Số tín chỉ</label>
                    <Input
                      value={addCoursePopup.newCourse.credits}
                      onChange={(e) => updateNewCourseField('credits', e.target.value)}
                      className="h-10 text-sm text-center font-medium"
                      placeholder="3"
                      type="number"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Điểm mục tiêu (hệ 10)</label>
                    <Input
                      value={addCoursePopup.newCourse.aim}
                      onChange={(e) => updateNewCourseField('aim', e.target.value)}
                      className="h-10 text-sm text-center font-medium"
                      placeholder="8.5"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Row 3: Note */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ghi chú (tùy chọn)</label>
                  <Textarea
                    value={addCoursePopup.newCourse.note}
                    onChange={(e) => updateNewCourseField('note', e.target.value)}
                    className="min-h-[80px] text-sm resize-none"
                    placeholder="Tài liệu tham khảo, thông tin giảng viên, lịch học..."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border/30 flex items-center justify-end gap-2 relative z-[1]">
                <Button variant="outline" onClick={() => setAddCoursePopup(null)} className="text-foreground border-border hover:bg-muted">
                  Hủy
                </Button>
                <Button
                  onClick={confirmAddCourse}
                  disabled={!addCoursePopup.newCourse.code && !addCoursePopup.newCourse.name}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm môn
                </Button>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div >
  );
}

export default RoadmapTab;
