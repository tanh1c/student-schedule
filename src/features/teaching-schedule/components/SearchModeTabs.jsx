import React from "react";
import { BookOpen, Clock, User } from "lucide-react";
import { cn } from "@lib/utils";

const searchModes = [
  { id: "code", label: "Theo mã môn", icon: BookOpen },
  { id: "lecturer", label: "Theo giảng viên", icon: User },
  { id: "time", label: "Theo thời gian", icon: Clock },
];

export default function SearchModeTabs({ searchTab, onTabChange }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
      {searchModes.map((mode) => {
        const Icon = mode.icon;

        return (
          <button
            key={mode.id}
            onClick={() => onTabChange(mode.id)}
            className={cn(
              "flex w-full items-center justify-start gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:w-auto sm:justify-center sm:rounded-lg sm:px-4 sm:py-2",
              searchTab === mode.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
