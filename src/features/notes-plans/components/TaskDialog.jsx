import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Edit2, Flag, Plus } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Calendar as CalendarComponent } from "@components/ui/calendar";
import { CATEGORY_COLORS, KANBAN_COLUMNS, PRIORITY_CONFIG } from "../constants/notesConfig";

export default function TaskDialog({
  open,
  editingTask,
  targetColumn,
  title,
  content,
  dueDate,
  priority,
  category,
  onTitleChange,
  onContentChange,
  onDueDateChange,
  onPriorityChange,
  onCategoryChange,
  onClose,
  onSave,
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-md border-border bg-background dark:bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {editingTask ? (
              <>
                <Edit2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Chỉnh sửa task
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Thêm task mới
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editingTask
              ? "Cập nhật thông tin task"
              : `Thêm vào cột: ${KANBAN_COLUMNS.find((column) => column.id === targetColumn)?.title}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Tiêu đề *</label>
            <Input
              placeholder="Nhập tiêu đề task..."
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="h-10 border-border bg-background text-foreground dark:bg-muted/30"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Mô tả</label>
            <Textarea
              placeholder="Nhập mô tả chi tiết..."
              rows={3}
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              className="border-border bg-background text-foreground dark:bg-muted/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Danh mục</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((item) => (
                <Button
                  key={item.name}
                  type="button"
                  variant={category === item.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(item.name)}
                  className={
                    category === item.name
                      ? `${item.color} border-0 text-white`
                      : "dark:border-border dark:text-foreground dark:hover:bg-muted"
                  }
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Ngày hết hạn</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-10 w-full justify-start border-border bg-background text-left font-normal dark:bg-muted/30 ${
                    dueDate ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate
                    ? format(new Date(dueDate), "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-border bg-background p-0 dark:bg-card" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => onDueDateChange(date ? format(date, "yyyy-MM-dd") : "")}
                  initialFocus
                  locale={vi}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Độ ưu tiên</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <Button
                  key={key}
                  type="button"
                  variant={priority === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPriorityChange(key)}
                  className={`h-9 ${
                    priority === key
                      ? `${config.color} border-0 text-white hover:opacity-90`
                      : "dark:border-border dark:text-foreground dark:hover:bg-muted"
                  }`}
                >
                  <Flag className="mr-1.5 h-3.5 w-3.5" />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 dark:border-border dark:text-foreground dark:hover:bg-muted"
          >
            Hủy
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            disabled={!title.trim()}
          >
            {editingTask ? "Cập nhật" : "Thêm task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
