import React from "react";
import { Loader2, Search } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import SearchByCourseForm from "./SearchByCourseForm";
import SearchByLecturerForm from "./SearchByLecturerForm";
import SearchByTimeForm from "./SearchByTimeForm";
import SearchModeTabs from "./SearchModeTabs";
import SearchResultsHeader from "./SearchResultsHeader";
import TeachingResultEmptyState from "./TeachingResultEmptyState";
import TeachingResultList from "./TeachingResultList";
import { useTeachingScheduleSearch } from "../hooks/useTeachingScheduleSearch";

export default function TeachingScheduleTab() {
  const {
    searchTab,
    setSearchTab,
    courseCode,
    setCourseCode,
    lecturerName,
    setLecturerName,
    loading,
    loadingData,
    error,
    selectedDay,
    setSelectedDay,
    selectedTiet,
    setSelectedTiet,
    toggleTiet,
    selectedCampus,
    setSelectedCampus,
    strictTietFilter,
    setStrictTietFilter,
    resultsQuery,
    setResultsQuery,
    showSuggestions,
    setShowSuggestions,
    filteredSubjects,
    filteredLecturers,
    selectedCampusMeta,
    selectedTietSummary,
    selectedTietRange,
    filteredTimeResults,
    filteredSearchResults,
    totalResultsCount,
    visibleResultsCount,
    hasServerResults,
    hasFilteredResults,
    resultsFilterPlaceholder,
    isResultsFilterPending,
    searchResults,
    timeResults,
    searchByCode,
    searchByLecturer,
    searchByTime,
    handleLookupKeyDown,
    resetTimeFilters,
    dayNames,
  } = useTeachingScheduleSearch();

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 overflow-x-hidden p-3 md:space-y-6 md:p-6">
      {loadingData && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-400">
            Đang tải dữ liệu môn học và giảng viên...
          </AlertDescription>
        </Alert>
      )}

      <Card className="relative z-20 w-full min-w-0 overflow-visible">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 space-y-4 overflow-visible">
          <SearchModeTabs searchTab={searchTab} onTabChange={setSearchTab} />

          {searchTab === "code" && (
            <SearchByCourseForm
              courseCode={courseCode}
              onCourseCodeChange={setCourseCode}
              onSearch={searchByCode}
              onKeyDown={handleLookupKeyDown}
              loading={loading}
              showSuggestions={showSuggestions}
              onShowSuggestionsChange={setShowSuggestions}
              filteredSubjects={filteredSubjects}
            />
          )}

          {searchTab === "lecturer" && (
            <SearchByLecturerForm
              lecturerName={lecturerName}
              onLecturerNameChange={setLecturerName}
              onSearch={searchByLecturer}
              onKeyDown={handleLookupKeyDown}
              loading={loading}
              showSuggestions={showSuggestions}
              onShowSuggestionsChange={setShowSuggestions}
              filteredLecturers={filteredLecturers}
            />
          )}

          {searchTab === "time" && (
            <SearchByTimeForm
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              selectedTiet={selectedTiet}
              onToggleTiet={toggleTiet}
              onSetSelectedTiet={setSelectedTiet}
              selectedCampus={selectedCampus}
              onSelectCampus={setSelectedCampus}
              strictTietFilter={strictTietFilter}
              onStrictTietFilterChange={setStrictTietFilter}
              selectedTietSummary={selectedTietSummary}
              selectedTietRange={selectedTietRange}
              selectedCampusMeta={selectedCampusMeta}
              onReset={resetTimeFilters}
              onSearch={searchByTime}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4 pb-3">
          <SearchResultsHeader
            searchTab={searchTab}
            hasServerResults={hasServerResults}
            visibleResultsCount={visibleResultsCount}
            totalResultsCount={totalResultsCount}
            selectedDay={selectedDay}
            timeResults={timeResults}
            selectedTiet={selectedTiet}
            selectedTietSummary={selectedTietSummary}
            selectedCampus={selectedCampus}
            selectedCampusMeta={selectedCampusMeta}
            searchResults={searchResults}
            resultsQuery={resultsQuery}
            onResultsQueryChange={setResultsQuery}
            onClearResultsQuery={() => setResultsQuery("")}
            resultsFilterPlaceholder={resultsFilterPlaceholder}
            dayNames={dayNames}
            isResultsFilterPending={isResultsFilterPending}
          />
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Đang tìm kiếm...</p>
            </div>
          )}

          {error && !loading && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
              <AlertDescription className="text-amber-800 dark:text-amber-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && !hasServerResults && (
            <TeachingResultEmptyState variant="empty" searchTab={searchTab} />
          )}

          {!loading && !error && hasServerResults && !hasFilteredResults && (
            <TeachingResultEmptyState
              variant="filtered-empty"
              searchTab={searchTab}
              onClearResultsQuery={() => setResultsQuery("")}
            />
          )}

          {!loading && !error && hasServerResults && hasFilteredResults && (
            <TeachingResultList
              searchTab={searchTab}
              filteredTimeResults={filteredTimeResults}
              filteredSearchResults={filteredSearchResults}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
