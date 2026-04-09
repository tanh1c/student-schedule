import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  AlertTriangle,
  BookOpen,
  CalendarRange,
  GraduationCap,
  GripVertical,
  Maximize2,
  MessageSquare,
  Plus,
  Sparkles,
  Sun,
  Target,
  Trash2
} from "lucide-react";
import AddCourseDialog from "@/features/roadmap/components/AddCourseDialog";
import ExpandedSemesterDialog from "@/features/roadmap/components/ExpandedSemesterDialog";
import NoteDialog from "@/features/roadmap/components/NoteDialog";
import { getCourseColor, getStickyNoteStyle, STICKY_NOTE_COLORS } from "@/features/roadmap/constants/roadmapStyles";
import { calculateSemesterGpa } from "@/features/roadmap/utils/gpa";
import { createEmptySemester } from "@/features/roadmap/utils/semesters";

export default function RoadmapTab() {
  const [semesters, setSemesters] = useLocalStorage("studyRoadmap", [
    createEmptySemester(0),
    createEmptySemester(1),
    createEmptySemester(2)
  ]);
  const [dragItem, setDragItem] = useState(null);
  const [referenceCourses, setReferenceCourses] = useState([]);
  const [expandedSemester, setExpandedSemester] = useState(null);
  const [notePopup, setNotePopup] = useState(null);
  const [addCoursePopup, setAddCoursePopup] = useState(null);
  const [addCourseSearchOpen, setAddCourseSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return referenceCourses.slice(0, 15);

    const query = searchTerm.toLowerCase().trim();
    return referenceCourses.filter((course) => (
      course.code.toLowerCase().includes(query)
      || course.name.toLowerCase().includes(query)
    )).slice(0, 30);
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
              courses: [
                ...semester.courses,
                { id: Date.now(), ...newCourse }
              ]
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

      const withoutSourceCourse = previous.map((semester) => {
        if (semester.id !== semesterId) return semester;

        return {
          ...semester,
          courses: semester.courses.filter((course) => {
            if (course.id === courseId) {
              movedCourse = course;
              return false;
            }
            return true;
          })
        };
      });

      if (!movedCourse) return previous;

      return withoutSourceCourse.map((semester) => (
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

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { icon: Sparkles, text: "Kéo thả môn học giữa các kỳ", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
            { icon: Target, text: "Theo dõi GPA mục tiêu theo từng kỳ", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
            { icon: CalendarRange, text: "Mỗi năm gồm HK1, HK2 và Hè", color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" }
          ].map((tip, index) => (
            <div key={index} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${tip.color}`}>
              <tip.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{tip.text}</span>
              <span className="sm:hidden">{tip.text.split(" ").slice(0, 4).join(" ")}...</span>
            </div>
          ))}

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={resetRoadmap}
            className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa toàn bộ
          </Button>
          <Button size="sm" onClick={addSemester} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm học kỳ
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="space-y-10 pb-8 pt-2">
          {groupedSemesters.map((yearSemesters, yearIndex) => {
            const firstSemester = yearSemesters[0];

            return (
              <section key={yearIndex} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-sm">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="w-36">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
                      Niên khóa
                    </label>
                    <Input
                      value={firstSemester?.year || ""}
                      onChange={(event) => updateSemesterMeta(firstSemester?.id, "year", event.target.value)}
                      className="h-9 text-sm font-bold"
                      placeholder={`K${25 + yearIndex}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearSemesters.map((semester, semesterIndex) => {
                    const globalIndex = yearIndex * 3 + semesterIndex;
                    const isSummer = globalIndex % 3 === 2;
                    const stickyStyle = isSummer
                      ? { color: STICKY_NOTE_COLORS[5] }
                      : getStickyNoteStyle(globalIndex);
                    const totalCredits = semester.courses.reduce((sum, course) => sum + (parseInt(course.credits, 10) || 0), 0);
                    const gpaStats = calculateSemesterGpa(semester.courses);
                    const isOverLimit = totalCredits > 18;

                    return (
                      <Card
                        key={semester.id}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDropOnSemester(semester.id)}
                        className={`relative overflow-hidden border ${stickyStyle.color.border} ${stickyStyle.color.bg} shadow-sm`}
                      >
                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 ${stickyStyle.color.tape} rounded-sm opacity-90 shadow-sm`} />
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
                          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(0,0,0,0.12) 1px, transparent 1px), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.08) 1px, transparent 1px)`,
                          backgroundSize: "18px 18px"
                        }} />

                        <CardContent className="relative z-[1] p-4 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2 flex-1">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] font-semibold flex items-center gap-1.5 w-fit ${isSummer
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                                  : "bg-white/60 dark:bg-white/10"
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
                                className="h-8 text-sm font-semibold bg-white/60 dark:bg-black/15"
                                placeholder={`Học kỳ ${globalIndex + 1}`}
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => setExpandedSemester({ semester, globalIndex, isSummer })}
                                title="Xem chi tiết"
                              >
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                              {semesters.length > 1 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeSemester(semester.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`rounded-lg border px-3 py-2 ${isOverLimit ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40" : "bg-white/50 dark:bg-black/10 border-border/50"}`}>
                              <div className="text-muted-foreground">Khối lượng</div>
                              <div className={`mt-1 flex items-center gap-1 text-sm font-bold ${isOverLimit ? "text-red-600 dark:text-red-400" : ""}`}>
                                {isOverLimit && <AlertTriangle className="h-4 w-4" />}
                                {semester.courses.length} môn • {totalCredits}/18 TC
                              </div>
                            </div>
                            <div className="rounded-lg border px-3 py-2 bg-white/50 dark:bg-black/10 border-border/50">
                              <div className="text-muted-foreground">GPA mục tiêu</div>
                              <div className="mt-1 text-sm font-bold">
                                {gpaStats ? `${gpaStats.gpa10}/10 • ${gpaStats.gpa4}/4` : "Chưa nhập"}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setNotePopup({ semesterId: semester.id, type: "semester" })}
                            className="w-full flex items-start gap-2 rounded-lg border border-border/50 bg-white/50 dark:bg-black/10 px-3 py-2 text-left hover:bg-white/80 dark:hover:bg-black/20 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            {semester.note ? (
                              <p className="text-xs text-foreground/80 line-clamp-3">{semester.note}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground/60 italic">Thêm ghi chú cho học kỳ này...</p>
                            )}
                          </button>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" />
                                Môn học nổi bật
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {semester.courses.length} môn
                              </div>
                            </div>

                            {semester.courses.length === 0 ? (
                              <div className="rounded-lg border-2 border-dashed border-border/50 bg-muted/20 px-3 py-4 text-center">
                                <Sparkles className="h-4 w-4 text-muted-foreground/40 mx-auto mb-1" />
                                <p className="text-[11px] text-muted-foreground/70">Chưa có môn học nào</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {semester.courses.slice(0, 3).map((course) => {
                                  const colorScheme = getCourseColor(course.code);

                                  return (
                                    <div
                                      key={course.id}
                                      draggable
                                      onDragStart={() => handleDragStart(semester.id, course.id)}
                                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing ${colorScheme.border} ${colorScheme.bg}`}
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <div className={`text-[10px] font-mono font-bold ${colorScheme.text}`}>
                                          {course.code || "MÃ MH"}
                                        </div>
                                        <div className="text-xs font-medium line-clamp-1">
                                          {course.name || "Tên môn học"}
                                        </div>
                                      </div>
                                      {course.credits && (
                                        <Badge variant="outline" className="text-[10px] shrink-0">
                                          {course.credits} TC
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}

                                {semester.courses.length > 3 && (
                                  <div className="text-[11px] text-muted-foreground px-1">
                                    +{semester.courses.length - 3} môn khác trong chi tiết học kỳ
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAddCoursePopup(semester.id)}
                              className="flex-1 border-dashed"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Thêm môn
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setExpandedSemester({ semester, globalIndex, isSummer })}
                              className="flex-1"
                            >
                              Chi tiết
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
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
