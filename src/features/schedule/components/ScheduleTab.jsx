import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import CourseDetailPopup from "./CourseDetailPopup";
import ScheduleAgendaView from "./ScheduleAgendaView";
import ScheduleDataPanel from "./ScheduleDataPanel";
import ScheduleDayView from "./ScheduleDayView";
import ScheduleViewSwitcher from "./ScheduleViewSwitcher";
import ScheduleWeekGrid from "./ScheduleWeekGrid";
import ScheduleWeekToolbar from "./ScheduleWeekToolbar";
import { getWeekLabel } from "../utils/scheduleCourseMeta";
import { getCurrentScheduleDayId } from "../utils/scheduleTime";
import {
  exportScheduleCalendar,
  openMyBKSchedulePage,
  parseScheduleInput,
  readScheduleClipboardText,
} from "../services/scheduleActions";
import { useScheduleClock } from "../hooks/useScheduleClock";
import { useScheduleFeatureData } from "../hooks/useScheduleFeatureData";
import { useScheduleViewMode } from "../hooks/useScheduleViewMode";

function ScheduleEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground">Chưa có thời khóa biểu</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Đồng bộ từ MyBK hoặc dán dữ liệu thủ công để bắt đầu.
      </p>
    </div>
  );
}

export default function ScheduleTab() {
  const { scheduleData, setScheduleData, selectedWeek, setSelectedWeek, currentWeek } =
    useScheduleFeatureData();
  const { scheduleViewMode, setScheduleViewMode } = useScheduleViewMode();
  const { currentDayId, currentTimeSlotInfo } = useScheduleClock();
  const isViewingCurrentWeek = selectedWeek === currentWeek;
  const [scheduleInput, setScheduleInput] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayId = getCurrentScheduleDayId();
    return dayId >= 2 && dayId <= 8 ? dayId : 2;
  });
  const [showManualInput, setShowManualInput] = useState(false);
  const [inputMethod, setInputMethod] = useState("sync");
  const [isInputExpanded, setIsInputExpanded] = useState(() => scheduleData.length === 0);
  const [activeCourse, setActiveCourse] = useState(null);
  const [hoveredCourse, setHoveredCourse] = useState(null);

  const scheduleStatusText =
    scheduleData.length > 0
      ? `${scheduleData.length} môn đã sẵn sàng. Bạn có thể đồng bộ lại hoặc nhập dữ liệu mới khi cần.`
      : "Đồng bộ nhanh từ MyBK hoặc dán dữ liệu thủ công khi bạn cần cập nhật lịch.";

  const openDataPanel = (method = inputMethod) => {
    setInputMethod(method);
    setIsInputExpanded(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveCourse(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const generateSchedule = (inputData = scheduleInput) => {
    try {
      const parsed = parseScheduleInput(inputData);
      if (parsed && parsed.length > 0) {
        setScheduleData(parsed);
        setScheduleInput("");
        setShowManualInput(false);
        setIsInputExpanded(false);
        setSelectedDay(currentDayId);
        setInputMethod("manual");
      } else {
        alert(
          "Không tìm thấy dữ liệu hợp lệ. Vui lòng đảm bảo bạn đã copy đúng bảng thời khóa biểu từ MyBK."
        );
      }
    } catch (error) {
      console.error("Parse error:", error);
      alert("Đã xảy ra lỗi khi xử lý dữ liệu.");
    }
  };

  const handleSmartPaste = async () => {
    try {
      const text = await readScheduleClipboardText();
      if (!text) {
        alert("Clipboard trống! Vui lòng copy lịch từ MyBK trước.");
        return;
      }

      generateSchedule(text);
    } catch (error) {
      console.error("Failed to read clipboard contents:", error);
      alert("Không thể truy cập Clipboard. Vui lòng sử dụng phương pháp nhập thủ công.");
      setShowManualInput(true);
    }
  };

  const goToPreviousWeek = () => setSelectedWeek((prev) => Math.max(1, prev - 1));
  const goToNextWeek = () => setSelectedWeek((prev) => Math.min(50, prev + 1));
  const goToCurrentWeek = () => {
    setSelectedWeek(currentWeek);
    setSelectedDay(currentDayId);
  };

  const handleExportToCalendar = () => {
    if (!scheduleData || scheduleData.length === 0) {
      alert("Chưa có dữ liệu thời khóa biểu để xuất!");
      return;
    }

    const result = exportScheduleCalendar(scheduleData);
    if (result.success) {
      alert(
        "✅ Đã tải file .ics thành công!\n\nHướng dẫn import vào Google Calendar:\n1. Mở Google Calendar (calendar.google.com)\n2. Click ⚙️ Settings > Import & Export\n3. Chọn file .ics vừa tải\n4. Click Import"
      );
    } else {
      alert(`❌ Lỗi: ${result.error}`);
    }
  };

  const getClassesForDay = (dayId) =>
    scheduleData
      .filter((course) => {
        const isActiveInWeek = course.weeks && course.weeks.includes(selectedWeek);
        return course.day === dayId && isActiveInWeek;
      })
      .sort((a, b) => a.startPeriod - b.startPeriod);

  const handleCourseHover = (course, rect) => {
    if (!activeCourse) {
      setHoveredCourse({ ...course, rect });
    }
  };

  const handleCourseLeave = () => setHoveredCourse(null);

  const handleCourseActivate = (course, rect) => {
    setActiveCourse({ ...course, rect });
    setHoveredCourse(null);
  };

  const renderScheduleContent = () => {
    if (scheduleData.length === 0) {
      return <ScheduleEmptyState />;
    }

    return (
      <>
        <ScheduleDayView
          mobileOnly
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          getClassesForDay={getClassesForDay}
          currentDayId={currentDayId}
          currentTimeSlotInfo={currentTimeSlotInfo}
          isViewingCurrentWeek={isViewingCurrentWeek}
          onCourseHover={handleCourseHover}
          onCourseLeave={handleCourseLeave}
          onCourseActivate={handleCourseActivate}
        />

        {scheduleViewMode === "agenda" && (
          <div className="hidden md:block">
            <ScheduleAgendaView
              getClassesForDay={getClassesForDay}
              selectedWeek={selectedWeek}
              currentWeek={currentWeek}
              currentDayId={currentDayId}
              currentTimeSlotInfo={currentTimeSlotInfo}
              onCourseHover={handleCourseHover}
              onCourseLeave={handleCourseLeave}
              onCourseActivate={handleCourseActivate}
            />
          </div>
        )}

        {scheduleViewMode === "day" && (
          <div className="hidden md:block">
            <ScheduleDayView
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              getClassesForDay={getClassesForDay}
              currentDayId={currentDayId}
              currentTimeSlotInfo={currentTimeSlotInfo}
              isViewingCurrentWeek={isViewingCurrentWeek}
              onCourseHover={handleCourseHover}
              onCourseLeave={handleCourseLeave}
              onCourseActivate={handleCourseActivate}
            />
          </div>
        )}

        {scheduleViewMode === "timeline" && (
          <ScheduleWeekGrid
            scheduleData={scheduleData}
            selectedWeek={selectedWeek}
            currentWeek={currentWeek}
            currentDayId={currentDayId}
            currentTimeSlotInfo={currentTimeSlotInfo}
            onCourseHover={handleCourseHover}
            onCourseLeave={handleCourseLeave}
            onCourseActivate={handleCourseActivate}
          />
        )}
      </>
    );
  };

  const viewSwitcher = (
    <ScheduleViewSwitcher
      scheduleViewMode={scheduleViewMode}
      onViewModeChange={setScheduleViewMode}
      className="justify-start sm:justify-center lg:justify-center"
    />
  );

  const popupCourse = activeCourse || hoveredCourse;
  const handleScheduleFetched = (data) => {
    setScheduleData(data);
    setSelectedDay(currentDayId);
    setShowManualInput(false);
    setIsInputExpanded(false);
    setInputMethod("sync");
  };

  return (
    <div className="box-border mx-auto w-full max-w-[1600px] space-y-3 overflow-hidden overflow-x-hidden p-1 sm:p-3 md:p-6">
      <ScheduleDataPanel
        scheduleDataCount={scheduleData.length}
        scheduleStatusText={scheduleStatusText}
        isExpanded={isInputExpanded}
        inputMethod={inputMethod}
        showManualInput={showManualInput}
        scheduleInput={scheduleInput}
        onScheduleInputChange={setScheduleInput}
        onOpenDataPanel={openDataPanel}
        onToggleExpanded={() => setIsInputExpanded((prev) => !prev)}
        onOpenMyBK={openMyBKSchedulePage}
        onSmartPaste={handleSmartPaste}
        onToggleManualInput={() => setShowManualInput((prev) => !prev)}
        onGenerateSchedule={generateSchedule}
        onScheduleFetched={handleScheduleFetched}
        viewSwitcher={viewSwitcher}
      />

      {scheduleData.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduleWeekToolbar
            weekLabel={getWeekLabel(selectedWeek)}
            selectedWeek={selectedWeek}
            currentWeek={currentWeek}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onCurrentWeek={goToCurrentWeek}
            onExportCalendar={handleExportToCalendar}
          />

          {renderScheduleContent()}
        </div>
      )}

      <div className="h-16 md:hidden" />

      {popupCourse && (
        <CourseDetailPopup
          course={popupCourse}
          rect={popupCourse.rect}
          isActive={!!activeCourse}
          onClose={() => setActiveCourse(null)}
        />
      )}
    </div>
  );
}
