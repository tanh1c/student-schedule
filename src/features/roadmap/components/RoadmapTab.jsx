import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  AlertTriangle,
  BookMarked,
  CalendarRange,
  GraduationCap,
  GripVertical,
  Maximize2,
  Plus,
  Search,
  Sparkles,
  Sun,
  Target,
  Trash2
} from "lucide-react";
import AddCourseDialog from "@/features/roadmap/components/AddCourseDialog";
import ExpandedSemesterDialog from "@/features/roadmap/components/ExpandedSemesterDialog";
import NoteDialog from "@/features/roadmap/components/NoteDialog";
import { getCourseColor, getStickyNoteStyle, STICKY_NOTE_COLORS } from "@/features/roadmap/constants/roadmapStyles";
import { calculateSemesterGpa, getLetterGrade } from "@/features/roadmap/utils/gpa";
import { createEmptySemester } from "@/features/roadmap/utils/semesters";

const PAPER_TEXTURE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
};

export default function RoadmapTab() {
  const [semesters, setSemesters] = useLocalStorage("studyRoadmap", [
    createEmptySemester(0),
    createEmptySemester(1),
    createEmptySemester(2)
  ]);
  const [dragItem, setDragItem] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [referenceCourses, setReferenceCourses] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState(null);
  const [notePopup, setNotePopup] = useState(null);
  const [addCoursePopup, setAddCoursePopup] = useState(null);
  const [addCourseSearchOpen, setAddCourseSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return referenceCourses.slice(0, 15);

    const query = searchTerm.toLowerCase().trim();
    return referenceCourses
      .filter((course) => (
        course.code.toLowerCase().includes(query)
        || course.name.toLowerCase().includes(query)
      ))
      .slice(0, 30);
  }, [referenceCourses, searchTerm]);

  React.useEffect(() => {
    fetch("/data/all_courses_master.json")
      .then((response) => response.json())
      .then((data) => setReferenceCourses(data))
      .catch((error) => console.error("Lỗi load danh sách môn học:", error));
  }, []);

  const addSemester = () => {
    setSemesters((previous) => [...previous, createEmptySemester(previous.length)]);
  };

  const removeSemester = (semesterId) => {
    setSemesters((previous) => previous.filter((semester) => semester.id !== semesterId));
  };

  const openAddCoursePopup = (semesterId) => {
    setAddCoursePopup({
      semesterId,
      newCourse: { code: "", name: "", credits: "", aim: "", note: "" }
    });
  };

  const confirmAddCourse = () => {
    if (!addCoursePopup) return;

    const { semesterId, newCourse } = addCoursePopup;
    if (newCourse.code || newCourse.name) {
      setSemesters((previous) => previous.map((semester) => (
        semester.id === semesterId
          ? {
              ...semester,
              courses: [...semester.courses, { id: Date.now(), ...newCourse }]
            }
          : semester
      )));
    }

    setAddCoursePopup(null);
  };

  const updateNewCourseField = (field, value) => {
    if (!addCoursePopup) return;

    setAddCoursePopup((previous) => ({
      ...previous,
      newCourse: { ...previous.newCourse, [field]: value }
    }));
  };

  const updateCourse = (semesterId, courseId, field, value) => {
    setSemesters((previous) => previous.map((semester) => (
      semester.id === semesterId
        ? {
            ...semester,
            courses: semester.courses.map((course) => (
              course.id === courseId ? { ...course, [field]: value } : course
            ))
          }
        : semester
    )));
  };

  const updateCourseMultiple = (semesterId, courseId, updates) => {
    setSemesters((previous) => previous.map((semester) => (
      semester.id === semesterId
        ? {
            ...semester,
            courses: semester.courses.map((course) => (
              course.id === courseId ? { ...course, ...updates } : course
            ))
          }
        : semester
    )));
  };

  const removeCourse = (semesterId, courseId) => {
    setSemesters((previous) => previous.map((semester) => (
      semester.id === semesterId
        ? { ...semester, courses: semester.courses.filter((course) => course.id !== courseId) }
        : semester
    )));
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

    setSemesters((previous) => {
      let movedCourse = null;

      const removed = previous.map((semester) => {
        if (semester.id !== semesterId) return semester;

        const remaining = semester.courses.filter((course) => {
          if (course.id === courseId) {
            movedCourse = course;
            return false;
          }
          return true;
        });

        return { ...semester, courses: remaining };
      });

      if (!movedCourse) return previous;

      return removed.map((semester) => (
        semester.id === targetSemesterId
          ? { ...semester, courses: [...semester.courses, movedCourse] }
          : semester
      ));
    });

    setDragItem(null);
  };

  const updateSemesterMeta = (semesterId, field, value) => {
    setSemesters((previous) => previous.map((semester) => (
      semester.id === semesterId ? { ...semester, [field]: value } : semester
    )));
  };

  const resetRoadmap = () => {
    if (window.confirm("Xóa toàn bộ roadmap đã tạo?")) {
      setSemesters([createEmptySemester(0), createEmptySemester(1), createEmptySemester(2)]);
    }
  };

  const groupedSemesters = [];
  for (let index = 0; index < semesters.length; index += 3) {
    groupedSemesters.push(semesters.slice(index, index + 3));
  }

  const renderCourseCard = (semester, course) => {
    const isEditing = editingCourseId === course.id;
    const colorScheme = getCourseColor(course.code);

    return (
      <div
        key={course.id}
        draggable
        onDragStart={() => handleDragStart(semester.id, course.id)}
        className={`group cursor-grab rounded-lg border p-2.5 transition-all active:cursor-grabbing ${
          isEditing
            ? "border-primary bg-primary/5 shadow-sm dark:border-primary"
            : `${colorScheme.border} ${colorScheme.bg} hover:shadow-sm`
        }`}
      >
        {!isEditing ? (
          <div onClick={() => setEditingCourseId(course.id)} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${colorScheme.bg} ${colorScheme.text}`}>
                {course.code || "MÃ MH"}
              </span>
              <div className="flex items-center gap-1.5">
                {course.aim && (
                  <div className="flex items-center gap-1">
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                      Aim: {course.aim}
                    </span>
                    <span className="text-[8px] font-semibold text-emerald-500">
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
            <h5 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
              {course.name || "Tên môn học"}
            </h5>
            {course.note && (
              <p className="line-clamp-1 text-[10px] text-muted-foreground/70">
                {course.note}
              </p>
            )}
            <GripVertical className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ) : (
          <div className="animate-in slide-in-from-top-2 space-y-2 p-1 duration-300">
            <Popover open={searchOpen && editingCourseId === course.id} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="h-8 w-full justify-between border-dashed border-primary/30 text-[11px] font-medium hover:border-primary/60 hover:bg-primary/5"
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
                    <CommandGroup heading="Danh sách môn học">
                      {referenceCourses.map((referenceCourse) => (
                        <CommandItem
                          key={referenceCourse.code}
                          value={`${referenceCourse.code} ${referenceCourse.name}`}
                          onSelect={() => {
                            updateCourseMultiple(semester.id, course.id, {
                              code: referenceCourse.code,
                              name: referenceCourse.name,
                              credits: referenceCourse.credits
                            });
                            setSearchOpen(false);
                          }}
                          className="cursor-pointer py-2 text-xs"
                        >
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary">{referenceCourse.code}</span>
                              <span className="font-semibold">{referenceCourse.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{referenceCourse.credits} tín chỉ</span>
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
                onChange={(event) => updateCourse(semester.id, course.id, "code", event.target.value)}
                className="h-8 text-[11px] font-mono"
                placeholder="Mã MH"
              />
              <Input
                value={course.credits}
                onChange={(event) => updateCourse(semester.id, course.id, "credits", event.target.value)}
                className="h-8 text-[11px]"
                placeholder="Tín chỉ"
              />
            </div>
            <Input
              value={course.name}
              onChange={(event) => updateCourse(semester.id, course.id, "name", event.target.value)}
              className="h-8 text-xs font-semibold"
              placeholder="Tên môn học"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={course.aim || ""}
                onChange={(event) => updateCourse(semester.id, course.id, "aim", event.target.value)}
                className="h-8 text-[11px]"
                placeholder="Mục tiêu (điểm 0-10)"
              />
              <Textarea
                value={course.note}
                onChange={(event) => updateCourse(semester.id, course.id, "note", event.target.value)}
                className="h-8 min-h-[32px] resize-none text-[11px]"
                placeholder="Ghi chú"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 flex-1 text-[11px]" onClick={() => setEditingCourseId(null)}>
                Xong
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  removeCourse(semester.id, course.id);
                  setEditingCourseId(null);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSemesterCard = (semester, yearIndex, semesterIndex) => {
    const globalIndex = yearIndex * 3 + semesterIndex;
    const isSummer = globalIndex % 3 === 2;
    const stickyStyle = isSummer
      ? { color: STICKY_NOTE_COLORS[5] }
      : getStickyNoteStyle(globalIndex);

    const totalCourses = semester.courses.length;
    const totalCredits = semester.courses.reduce((sum, course) => sum + (parseInt(course.credits, 10) || 0), 0);
    const isOverLimit = totalCredits > 18;
    const gpaStats = calculateSemesterGpa(semester.courses);

    return (
      <div
        key={semester.id}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => handleDropOnSemester(semester.id)}
        className="relative"
      >
        <div className="absolute -left-[36px] top-[14px] hidden h-[8px] w-[40px] md:block">
          <svg className="h-full w-full" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 4 Q10 2, 20 4 Q30 6, 40 4"
              className="stroke-amber-400/60 dark:stroke-amber-500/50"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M2 3.5 Q12 2, 20 3.5 Q28 5, 38 4"
              className="stroke-white/30 dark:stroke-white/10"
              strokeWidth="0.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        <div className="relative">
          <div
            className={`absolute -top-2 left-1/2 z-10 h-4 w-12 -translate-x-1/2 rounded-sm opacity-90 shadow-sm ${stickyStyle.color.tape}`}
            style={{
              transform: "translateX(-50%)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)"
            }}
          />
          <div
            className={`absolute -top-2 left-1/2 z-10 h-4 w-12 -translate-x-1/2 rounded-sm ${stickyStyle.color.tape}`}
            style={{ transform: "translateX(-50%)" }}
          />

          <Card
            className={`relative h-full overflow-hidden border-0 border ${stickyStyle.color.bg} ${stickyStyle.color.border}
              shadow-[4px_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[6px_6px_20px_rgba(0,0,0,0.12)]
              dark:shadow-[4px_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[6px_6px_20px_rgba(0,0,0,0.4)]`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={PAPER_TEXTURE} />

            <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6">
              <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[24px] border-b-white/40 border-l-[24px] border-l-transparent dark:border-b-black/20" />
            </div>

            <CardContent className="relative z-[1] flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Badge
                    variant="secondary"
                    className={`flex w-fit items-center gap-1 border text-[10px] font-semibold shadow-sm ${
                      isSummer
                        ? "border-orange-300/50 bg-orange-200/80 text-orange-800 dark:bg-orange-800/40 dark:text-orange-200"
                        : "border-gray-200/50 bg-white/60 text-gray-700 dark:border-gray-600/30 dark:bg-white/10 dark:text-gray-200"
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
                    onChange={(event) => updateSemesterMeta(semester.id, "name", event.target.value)}
                    className="h-8 border-gray-300/50 bg-white/50 text-sm font-semibold text-foreground dark:border-gray-600/50 dark:bg-black/20"
                    placeholder={`Học kỳ ${globalIndex + 1}`}
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                    onClick={() => setExpandedSemester({ semester, globalIndex, isSummer })}
                    title="Xem chi tiết"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>

                  {semesters.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSemester(semester.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className={`flex items-center gap-3 rounded-lg p-2 text-xs ${isOverLimit ? "border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-1.5">
                    <BookMarked className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{totalCourses} môn</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className={`flex items-center gap-1.5 ${isOverLimit ? "font-semibold text-red-600 dark:text-red-400" : ""}`}>
                    {isOverLimit && <AlertTriangle className="h-3.5 w-3.5" />}
                    <span className="font-medium">{totalCredits}/18 TC</span>
                  </div>
                  {isOverLimit && (
                    <span className="text-[10px] text-red-600 dark:text-red-400">
                      (+{totalCredits - 18} phí)
                    </span>
                  )}
                </div>

                {gpaStats && (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs dark:border-emerald-800/50 dark:bg-emerald-950/30">
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

              <Textarea
                value={semester.note}
                onChange={(event) => updateSemesterMeta(semester.id, "note", event.target.value)}
                className="min-h-[60px] resize-none text-xs"
                placeholder="Ghi chú: mục tiêu GPA, kế hoạch thực tập..."
              />

              <div className="min-h-[80px] max-h-[220px] flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
                {semester.courses.length === 0 ? (
                  <div className="flex h-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 dark:border-border/50">
                    <Sparkles className="mb-1 h-4 w-4 text-muted-foreground/40" />
                    <p className="text-[10px] text-muted-foreground/60">
                      Chưa có môn học
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {semester.courses.map((course) => renderCourseCard(semester, course))}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => openAddCoursePopup(semester.id)}
                className="h-8 w-full border-dashed text-[11px] font-semibold"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Thêm môn
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderYearSection = (yearSemesters, yearIndex) => {
    const firstSemester = yearSemesters[0];

    return (
      <div key={yearIndex} className="relative">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative hidden h-6 w-6 shrink-0 items-center justify-center md:flex">
            <div className="absolute h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-black/10 dark:bg-black/30" />
            <div className={`absolute h-5 w-5 rounded-full border-2 border-white/50 shadow-md dark:border-white/20 ${yearIndex % 4 === 0
              ? "bg-gradient-to-br from-red-400 to-red-600"
              : yearIndex % 4 === 1
                ? "bg-gradient-to-br from-blue-400 to-blue-600"
                : yearIndex % 4 === 2
                  ? "bg-gradient-to-br from-green-400 to-green-600"
                  : "bg-gradient-to-br from-purple-400 to-purple-600"
              }`}
            />
            <div className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-white/60" />
          </div>

          <div className="group flex items-center gap-3 md:ml-2">
            <div className="relative flex items-center shadow-sm">
              <div className="absolute left-0.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:bg-indigo-500">
                <GraduationCap className="h-4 w-4" />
              </div>
              <Input
                value={firstSemester?.year || ""}
                onChange={(event) => updateSemesterMeta(firstSemester?.id, "year", event.target.value)}
                className="h-8 w-28 rounded-full border-indigo-200 bg-indigo-50 pl-9 pr-3 text-xs font-black text-indigo-700 transition-all focus:ring-indigo-500/30 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                placeholder={`Khóa K${25 + yearIndex}`}
              />
            </div>
            <div className="h-[2px] max-w-[120px] flex-1 bg-gradient-to-r from-indigo-500/50 via-indigo-400/20 to-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:ml-10 md:grid-cols-2 lg:grid-cols-3">
          {yearSemesters.map((semester, semesterIndex) => renderSemesterCard(semester, yearIndex, semesterIndex))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              icon: Sparkles,
              text: "Kéo thả môn học để sắp xếp lại giữa các kỳ",
              color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            },
            {
              icon: Target,
              text: "Ghi chú mục tiêu GPA và kế hoạch thực tập",
              color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            },
            {
              icon: CalendarRange,
              text: "Mỗi năm học bao gồm 3 kỳ: HK1, HK2 và Hè",
              color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            }
          ].map((tip, index) => (
            <div key={index} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${tip.color}`}>
              <tip.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{tip.text}</span>
              <span className="sm:hidden">{tip.text.split(" ").slice(0, 4).join(" ")}...</span>
            </div>
          ))}

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={resetRoadmap}
            className="hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa toàn bộ
          </Button>
          <Button size="sm" onClick={addSemester} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm học kỳ
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="relative pb-8 pt-2">
          <div className="absolute bottom-8 left-[9px] top-2 hidden w-[5px] md:block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-200 via-amber-300 to-orange-300 shadow-sm dark:from-amber-700 dark:via-amber-600 dark:to-orange-600" />
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 10%, rgba(139,69,19,0.3) 1px, transparent 1px),
                                 radial-gradient(circle at 30% 40%, rgba(139,69,19,0.2) 1px, transparent 1px),
                                 radial-gradient(circle at 70% 60%, rgba(139,69,19,0.25) 1px, transparent 1px),
                                 radial-gradient(circle at 40% 80%, rgba(139,69,19,0.2) 1px, transparent 1px)`,
                backgroundSize: "100% 20px"
              }}
            />
          </div>

          <div className="space-y-12">
            {groupedSemesters.map((yearSemesters, yearIndex) => renderYearSection(yearSemesters, yearIndex))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <ExpandedSemesterDialog
        expandedSemester={expandedSemester}
        semesters={semesters}
        onClose={() => setExpandedSemester(null)}
        updateSemesterMeta={updateSemesterMeta}
        setNotePopup={setNotePopup}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCourses={filteredCourses}
        setSemesters={setSemesters}
        openAddCoursePopup={openAddCoursePopup}
        removeCourse={removeCourse}
        updateCourse={updateCourse}
      />

      <NoteDialog
        notePopup={notePopup}
        semesters={semesters}
        onClose={() => setNotePopup(null)}
        updateCourse={updateCourse}
        updateSemesterMeta={updateSemesterMeta}
      />

      <AddCourseDialog
        addCoursePopup={addCoursePopup}
        semesters={semesters}
        addCourseSearchOpen={addCourseSearchOpen}
        setAddCourseSearchOpen={setAddCourseSearchOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCourses={filteredCourses}
        updateNewCourseField={updateNewCourseField}
        confirmAddCourse={confirmAddCourse}
        setAddCoursePopup={setAddCoursePopup}
        onClose={() => setAddCoursePopup(null)}
      />
    </div>
  );
}
