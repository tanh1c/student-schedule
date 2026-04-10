# Next Refactor Roadmap

## Mục tiêu

Đợt refactor tiếp theo tập trung vào 3 việc:

- giảm thêm các file monolith còn nằm trong `src/components`
- tiếp tục chuyển page-level logic sang `src/features/*`
- chuẩn hóa pattern `components / hooks / services / utils / constants` để codebase đều tay hơn

## Trạng thái hiện tại

- [x] `curriculum` đã ở `src/features/curriculum`
- [x] `roadmap` đã ở `src/features/roadmap`
- [x] `registration` đã ở `src/features/registration`
- [x] `messages` đã ở `src/features/messages`
- [x] `deadlines` đã ở `src/features/deadlines`
- [x] `preview registration` đã đi cùng `src/features/registration`
- [x] `schedule` đã ở `src/features/schedule`
- [x] `teaching schedule` đã ở `src/features/teaching-schedule`
- [x] `notes & plans` đã ở `src/features/notes-plans`
- [x] `gpa` đã ở `src/features/gpa`
- [x] `settings` đã ở `src/features/settings`
- [x] `exam` đã ở `src/features/exam`

## Ưu tiên tổng

1. `schedule`
2. `teaching-schedule`
3. `notes-plans`
4. `gpa`
5. cleanup thêm `roadmap`

## Wave 1: Schedule

- [x] Tạo `src/features/schedule`
- [x] Di chuyển container chính từ `src/components/ScheduleTab.jsx`
- [x] Tách logic fetch/sync dữ liệu MyBK
- [x] Tách logic tuần hiện tại, ngày hiện tại, tiết hiện tại
- [x] Tách `timeline view`
- [x] Tách `agenda view`
- [x] Tách `day view`
- [x] Tách course detail popover
- [x] Tách export Google Calendar
- [x] Tạo `meta.js` để menu config không phụ thuộc hardcode phân tán

### Cấu trúc đề xuất

```text
src/features/schedule/
  index.jsx
  components/
    ScheduleTab.jsx
    ScheduleHeader.jsx
    ScheduleWeekToolbar.jsx
    ScheduleViewSwitcher.jsx
    ScheduleWeekGrid.jsx
    ScheduleDayView.jsx
    ScheduleAgendaView.jsx
    ScheduleCourseCard.jsx
    ScheduleCoursePopover.jsx
    ScheduleEmptyState.jsx
  hooks/
    useScheduleData.js
    useScheduleWeekNavigation.js
    useScheduleViewMode.js
    useCurrentTimeIndicator.js
    useScheduleFilters.js
  services/
    scheduleApi.js
    scheduleStorage.js
  utils/
    scheduleParser.js
    scheduleTime.js
    scheduleGrouping.js
    scheduleColors.js
    scheduleExport.js
  constants/
    periods.js
    viewModes.js
    storageKeys.js
    meta.js
```

### Exit Criteria

- [x] `ScheduleTab.jsx` container còn khoảng `200-300` dòng
- [x] mỗi chế độ xem là một component riêng
- [x] current-time logic không nằm lẫn trong JSX render chính
- [x] `npm run lint`
- [x] `npm run build`

## Wave 2: Teaching Schedule

- [x] Tạo `src/features/teaching-schedule`
- [x] Di chuyển container chính từ `src/components/TeachingScheduleTab.jsx`
- [x] Tách search mode `theo mã môn`
- [x] Tách search mode `theo giảng viên`
- [x] Tách search mode `theo thời gian`
- [x] Tách mobile UI riêng cho `theo thời gian`
- [x] Tách client-side search trong kết quả
- [x] Tách filter mapper/formatter
- [x] Tạo `meta.js`

### Cấu trúc đề xuất

```text
src/features/teaching-schedule/
  index.jsx
  components/
    TeachingScheduleTab.jsx
    SearchModeTabs.jsx
    SearchByCourseForm.jsx
    SearchByLecturerForm.jsx
    SearchByTimeForm.jsx
    TimeFilterSummaryCard.jsx
    TimeFilterPanelDesktop.jsx
    TimeFilterPanelMobile.jsx
    SearchResultsHeader.jsx
    TeachingResultList.jsx
    TeachingResultCard.jsx
    TeachingResultEmptyState.jsx
  hooks/
    useTeachingSearchState.js
    useTeachingSearchResults.js
    useTimeFilterState.js
    useResponsiveSearchLayout.js
  services/
    teachingScheduleApi.js
  utils/
    teachingSearchMapper.js
    teachingSearchFilter.js
    teachingSearchFormatter.js
  constants/
    campuses.js
    weekdays.js
    periods.js
    searchModes.js
    meta.js
```

### Exit Criteria

- [x] mỗi mode tìm kiếm là một form riêng
- [x] mobile và desktop không trộn quá nhiều trong cùng block JSX
- [x] result rendering tách khỏi filter form
- [x] `npm run lint`
- [x] `npm run build`

## Wave 3: Notes & Plans

- [x] Tạo `src/features/notes-plans`
- [x] Di chuyển container chính từ `src/components/NotesPlansTab.jsx`
- [x] Tách header và alerts
- [x] Tách kanban column/task card
- [x] Tách calendar view
- [x] Tách task dialog
- [x] Tách localStorage/state logic vào hook riêng
- [x] Tạo `meta.js`

### Cấu trúc đề xuất

```text
src/features/notes-plans/
  index.jsx
  components/
    NotesPlansTab.jsx
    NotesPlansHeader.jsx
    NotesPlansAlerts.jsx
    KanbanBoard.jsx
    KanbanColumn.jsx
    TaskCard.jsx
    CalendarView.jsx
    TaskDialog.jsx
  hooks/
    useNotesPlansState.js
  utils/
    notesHelpers.js
  constants/
    notesConfig.js
    meta.js
```

### Exit Criteria

- [x] calendar rendering không nằm chung với kanban/task rendering
- [x] dialog/editor state tách khỏi list rendering
- [x] local state và persisted state được gom rõ ràng
- [x] `npm run lint`
- [x] `npm run build`

## Wave 4: GPA

- [x] Tạo `src/features/gpa`
- [x] Chuyển `GpaTab.jsx` thành entry wrapper cho feature
- [x] Tách sync GPA view
- [x] Tách manual GPA view
- [x] Tách calculator/utils dùng chung
- [x] Tách MyBK login flow vào feature GPA
- [x] Tạo `meta.js`

### Cấu trúc đề xuất

```text
src/features/gpa/
  index.jsx
  components/
    GpaTab.jsx
    SyncGpaView.jsx
    ManualGpaView.jsx
    MyBKLoginCard.jsx
  services/
    gpaApi.js
  utils/
    gpaGradeScale.js
  constants/
    meta.js
```

### Exit Criteria

- [x] `GpaTab.jsx` chỉ còn vai trò shell
- [x] calculator logic tách khỏi JSX chính và gom vào util dùng chung
- [x] sync/manual là 2 module riêng
- [x] `npm run lint`
- [x] `npm run build`

## Wave 5: Cleanup Sau Refactor

- [x] Di chuyển metadata tab của feature mới sang `constants/meta.js`
- [x] Chuẩn hóa metadata tab không còn hardcode phân tán trong app shell/menu config
- [x] Cập nhật `src/app/tabRegistry.js`
- [x] Cập nhật `src/app/menuConfig.js`
- [x] Giảm dần wrapper cũ trong `src/components`
- [x] Chỉ giữ wrapper 1 dòng cho các feature đã migrate
- [x] Chuyển shared app-level components (`AppLogo`, `DataManagement`, `WelcomeFeedback`) sang `src/shared`
- [x] Chuẩn hóa alias wrapper về `@features/@shared`

## Wave 6a: Settings

- [x] Tạo `src/features/settings`
- [x] Di chuyển `SettingsPage.jsx` vào feature
- [x] Di chuyển `ChangelogPage.jsx` vào feature
- [x] Di chuyển `SecurityPage.jsx` vào feature
- [x] Di chuyển `HonorWallPage.jsx` vào feature
- [x] Di chuyển `LocalStorageViewer.jsx` vào feature
- [x] Tạo `meta.js`
- [x] Cập nhật `tabRegistry` sang `@features/settings`
- [x] Giữ compatibility wrapper ở `src/components`
- [x] `npm run lint`
- [x] `npm run build`

### Cấu trúc đề xuất

```text
src/features/settings/
  index.jsx
  components/
    SettingsPage.jsx
    ChangelogPage.jsx
    SecurityPage.jsx
    HonorWallPage.jsx
    LocalStorageViewer.jsx
  constants/
    meta.js
```

## Wave 6b: Exam

- [x] Tạo `src/features/exam`
- [x] Di chuyển `ExamTab.jsx` vào feature
- [x] Tạo `meta.js`
- [x] Cập nhật `tabRegistry` sang `@features/exam`
- [x] Chuyển metadata `exam` từ shared constants sang feature constants
- [x] Giữ compatibility wrapper ở `src/components`
- [x] `npm run lint`
- [x] `npm run build`

### Cấu trúc đề xuất

```text
src/features/exam/
  index.jsx
  components/
    ExamTab.jsx
  constants/
    meta.js
```

## Thứ tự thực thi khuyên dùng

- [x] Wave 1: Schedule
- [x] Wave 2: Teaching Schedule
- [x] Wave 3: Notes & Plans
- [x] Wave 4: GPA
- [x] Wave 5: Cleanup
- [x] Wave 6a: Settings
- [x] Wave 6b: Exam

## Mốc kỳ vọng sau đợt này

- [x] đã tăng từ `6/12` lên `12/12` tab feature hóa
- [x] giảm mạnh số file page-level trên `800` dòng
- [x] `src/components` chủ yếu còn page nhỏ, wrapper mỏng, hoặc shared page
- [x] pattern thư mục giữa các feature đồng nhất hơn

Ghi chú: hiện không còn page-level file nào trên `800` dòng; file còn vượt ngưỡng là [`src/components/ui/map.jsx`](/c:/Users/LG/Desktop/Study%20Material/AI/TKBSV/src/components/ui/map.jsx), đây là shared UI infrastructure chứ không phải tab/page.

## Ghi chú khi triển khai

- [x] ưu tiên refactor không đổi behavior trước, polish UI sau
- [x] giữ compatibility wrapper ở `src/components/*Tab.jsx` trong giai đoạn chuyển tiếp
- [~] mỗi wave nên có commit riêng
- [x] sau mỗi wave phải chạy:
  - `npm run lint`
  - `npm run build`
- [x] với `schedule` và `teaching-schedule`, nên smoke test riêng trên mobile
