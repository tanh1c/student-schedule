import React from "react";
import { BookOpen, Loader2, Search } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

export default function SearchByCourseForm({
  courseCode,
  onCourseCodeChange,
  onSearch,
  onKeyDown,
  loading,
  showSuggestions,
  onShowSuggestionsChange,
  filteredSubjects,
}) {
  return (
    <div className="relative z-30 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Input
          placeholder="Nhập mã môn học (VD: CO3001)..."
          value={courseCode}
          onChange={(event) => {
            onCourseCodeChange(event.target.value);
            onShowSuggestionsChange(true);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => onShowSuggestionsChange(true)}
          onBlur={() => setTimeout(() => onShowSuggestionsChange(false), 200)}
          className="h-11"
        />

        {showSuggestions && filteredSubjects.length > 0 && (
          <div className="absolute left-0 top-full z-[70] mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-background shadow-xl ring-1 ring-border/60">
            {filteredSubjects.map((subject, index) => (
              <button
                key={`${subject.id}-${index}`}
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                onClick={() => {
                  onCourseCodeChange(subject.id);
                  onShowSuggestionsChange(false);
                }}
              >
                <span className="font-medium text-primary">{subject.id}</span>
                <span className="text-muted-foreground"> - {subject.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={onSearch}
        disabled={loading || !courseCode.trim()}
        className="h-11 w-full px-6 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </>
        )}
      </Button>
    </div>
  );
}
