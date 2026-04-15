import React from "react";
import { AlertCircle, Bell } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { formatTaskDate } from "../utils/notesHelpers";

export default function NotesPlansAlerts({ notifications }) {
  return (
    <>
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <span className="font-semibold text-blue-800 dark:text-blue-400">Tip:</span>
          <span className="ml-2 text-sm text-blue-700 dark:text-blue-500">
            Kéo thả các task giữa các cột để cập nhật trạng thái. Dữ liệu được lưu tự động trên trình duyệt.
          </span>
        </AlertDescription>
      </Alert>

      {notifications.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
          <Bell className="h-4 w-4 animate-pulse text-amber-600" />
          <AlertDescription>
            <span className="font-semibold text-amber-800 dark:text-amber-400">
              Deadline sắp tới ({notifications.length}):
            </span>
            <div className="mt-1 flex flex-wrap gap-2">
              {notifications.slice(0, 3).map((task) => (
                <Badge
                  key={task.id}
                  variant="outline"
                  className="border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200"
                >
                  {task.title} - {formatTaskDate(task.dueDate)}
                </Badge>
              ))}
              {notifications.length > 3 && (
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/50">
                  +{notifications.length - 3} khác
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
