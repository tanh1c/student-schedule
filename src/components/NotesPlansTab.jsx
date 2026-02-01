import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  Bell,
  X,
  Flag,
  Clock,
  Target,
  AlertCircle,
  GripVertical,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Timer,
  Sparkles,
  Layers,
  KanbanSquare,
  ArrowRight,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Kanban board columns configuration
const KANBAN_COLUMNS = [
  {
    id: 'todo',
    title: 'Cần làm',
    icon: Circle,
    color: 'bg-slate-500',
    bgColor: 'bg-slate-50/80 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    headerColor: 'text-slate-700 dark:text-slate-200'
  },
  {
    id: 'inprogress',
    title: 'Đang làm',
    icon: Timer,
    color: 'bg-teal-500',
    bgColor: 'bg-teal-50/80 dark:bg-teal-900/30',
    borderColor: 'border-teal-200 dark:border-teal-700',
    headerColor: 'text-teal-700 dark:text-teal-200'
  },
  {
    id: 'done',
    title: 'Hoàn thành',
    icon: CheckCircle2,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50/80 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-700',
    headerColor: 'text-emerald-700 dark:text-emerald-200'
  },
];

// Priority configurations
const PRIORITY_CONFIG = {
  high: {
    label: 'Cao',
    color: 'bg-red-500',
    textColor: 'text-red-600 dark:text-red-300',
    bgLight: 'bg-red-50 dark:bg-red-900/40',
    borderColor: 'border-red-200 dark:border-red-700',
    icon: '🔥'
  },
  medium: {
    label: 'Trung bình',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-300',
    bgLight: 'bg-amber-50 dark:bg-amber-900/40',
    borderColor: 'border-amber-200 dark:border-amber-700',
    icon: '⚡'
  },
  low: {
    label: 'Thấp',
    color: 'bg-green-500',
    textColor: 'text-green-600 dark:text-green-300',
    bgLight: 'bg-green-50 dark:bg-green-900/40',
    borderColor: 'border-green-200 dark:border-green-700',
    icon: '💡'
  },
};

// Category/Tag colors
const CATEGORY_COLORS = [
  { name: 'Học tập', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-200', bgLight: 'bg-blue-100 dark:bg-blue-800/40' },
  { name: 'Dự án', color: 'bg-purple-500', textColor: 'text-purple-700 dark:text-purple-200', bgLight: 'bg-purple-100 dark:bg-purple-800/40' },
  { name: 'Cá nhân', color: 'bg-pink-500', textColor: 'text-pink-700 dark:text-pink-200', bgLight: 'bg-pink-100 dark:bg-pink-800/40' },
  { name: 'Công việc', color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-200', bgLight: 'bg-orange-100 dark:bg-orange-800/40' },
  { name: 'Ý tưởng', color: 'bg-cyan-500', textColor: 'text-cyan-700 dark:text-cyan-200', bgLight: 'bg-cyan-100 dark:bg-cyan-800/40' },
];

function NotesPlansTab() {
  // View mode: 'kanban' | 'calendar'
  const [viewMode, setViewMode] = useState('kanban');

  // Kanban data structure
  const [tasks, setTasksRaw] = useLocalStorage('kanbanTasks', []);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Calendar view state
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  // Wrapper to notify other components when tasks change
  const setTasks = (newTasks) => {
    setTasksRaw(newTasks);
    // Dispatch custom event to notify ScheduleTab to sync
    window.dispatchEvent(new CustomEvent('kanbanTasksChanged'));
  };

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState(CATEGORY_COLORS[0].name);
  const [targetColumn, setTargetColumn] = useState('todo');

  // Check upcoming deadlines using useMemo
  const notifications = useMemo(() => {
    const today = new Date();
    return tasks.filter(task => {
      if (task.dueDate && task.status !== 'done') {
        const deadline = new Date(task.dueDate);
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 3;
      }
      return false;
    });
  }, [tasks]);

  // Dialog handlers
  const handleOpenDialog = (columnId = 'todo', task = null, preSelectedDate = null) => {
    setEditingTask(task);
    setTargetColumn(columnId);

    if (task) {
      setTitle(task.title);
      setContent(task.content || '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setPriority(task.priority || 'medium');
      setCategory(task.category || CATEGORY_COLORS[0].name);
    } else {
      setTitle('');
      setContent('');
      // Keep pre-selected date from calendar click, otherwise reset
      setDueDate(preSelectedDate || '');
      setPriority('medium');
      setCategory(CATEGORY_COLORS[0].name);
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setTitle('');
    setContent('');
    setDueDate('');
    setPriority('medium');
    setCategory(CATEGORY_COLORS[0].name);
  };

  const handleSave = () => {
    const newTask = {
      id: editingTask ? editingTask.id : Date.now(),
      title,
      content,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      category,
      status: editingTask ? editingTask.status : targetColumn,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? newTask : task));
    } else {
      setTasks([...tasks, newTask]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Move task to next column
  const moveToNextColumn = (task) => {
    const columnOrder = ['todo', 'inprogress', 'done'];
    const currentIndex = columnOrder.indexOf(task.status);
    if (currentIndex < columnOrder.length - 1) {
      const newStatus = columnOrder[currentIndex + 1];
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    // Add some visual feedback
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      setTasks(tasks.map(task =>
        task.id === draggedTask.id
          ? { ...task, status: columnId, updatedAt: new Date().toISOString() }
          : task
      ));
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Helper functions
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === tomorrow.toDateString()) return 'Ngày mai';

    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => task.status === columnId);
  };

  const getCategoryConfig = (categoryName) => {
    return CATEGORY_COLORS.find(c => c.name === categoryName) || CATEGORY_COLORS[0];
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-3 md:p-6 max-w-[1800px] mx-auto space-y-4 md:space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-500/20">
              <KanbanSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Quản lý Task</h1>
              <p className="text-sm text-muted-foreground">Theo dõi công việc và deadline</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={`h-8 px-3 transition-all ${viewMode === 'kanban' ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm' : 'hover:bg-muted'}`}
            >
              <KanbanSquare className="h-4 w-4 mr-1.5" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={`h-8 px-3 transition-all ${viewMode === 'calendar' ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm' : 'hover:bg-muted'}`}
            >
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              Lịch
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 bg-card rounded-xl border px-5 py-3 shadow-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{totalTasks}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tổng cộng</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Hoàn thành</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{completionRate}%</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tiến độ</p>
            </div>
          </div>

          <Button
            onClick={() => handleOpenDialog('todo')}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/25 h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm task
          </Button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <>
          {/* Warning Alert */}
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <span className="font-semibold text-blue-800 dark:text-blue-400">Tip:</span>
              <span className="text-sm text-blue-700 dark:text-blue-500 ml-2">
                Kéo thả các task giữa các cột để cập nhật trạng thái. Dữ liệu được lưu tự động trên trình duyệt.
              </span>
            </AlertDescription>
          </Alert>

          {/* Notifications */}
          {notifications.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30">
              <Bell className="h-4 w-4 text-amber-600 animate-pulse" />
              <AlertDescription>
                <span className="font-semibold text-amber-800 dark:text-amber-400">
                  Deadline sắp tới ({notifications.length}):
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {notifications.slice(0, 3).map((task) => (
                    <Badge key={task.id} variant="outline" className="bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200">
                      {task.title} - {formatDate(task.dueDate)}
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

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {KANBAN_COLUMNS.map((column) => {
              const columnTasks = getTasksByColumn(column.id);
              const Icon = column.icon;
              const isDragOver = dragOverColumn === column.id;

              return (
                <div
                  key={column.id}
                  className={`rounded-2xl border-2 transition-all duration-200 ${column.bgColor} ${isDragOver
                    ? 'border-teal-400 dark:border-teal-500 ring-4 ring-teal-500/20 scale-[1.02]'
                    : column.borderColor
                    }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-inherit">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${column.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className={`font-semibold ${column.headerColor}`}>{column.title}</h3>
                        <Badge variant="secondary" className="ml-1 text-xs font-bold">
                          {columnTasks.length}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/50 dark:hover:bg-white/10"
                        onClick={() => handleOpenDialog(column.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
                    <div className="p-3 space-y-3">
                      {columnTasks.length === 0 ? (
                        <div className="py-8 px-4 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm text-muted-foreground">Chưa có task nào</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-teal-600 dark:text-teal-400 hover:text-teal-700"
                            onClick={() => handleOpenDialog(column.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Thêm task đầu tiên
                          </Button>
                        </div>
                      ) : (
                        columnTasks.map((task) => {
                          const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                          const categoryConfig = getCategoryConfig(task.category);
                          const overdue = task.status !== 'done' && isOverdue(task.dueDate);

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task)}
                              onDragEnd={handleDragEnd}
                              className={`group bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing active:shadow-lg active:scale-[1.02] ${overdue ? 'border-red-300 dark:border-red-700' : 'border-border'
                                }`}
                            >
                              {/* Card Header with drag handle */}
                              <div className="flex items-start gap-2 p-3 pb-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-medium text-sm line-clamp-2 ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {task.title}
                                  </h4>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  {task.status !== 'done' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-teal-600 hover:text-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                                      onClick={(e) => { e.stopPropagation(); moveToNextColumn(task); }}
                                      title="Di chuyển sang cột tiếp theo"
                                    >
                                      <ArrowRight className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-muted"
                                    onClick={(e) => { e.stopPropagation(); handleOpenDialog(task.status, task); }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Card Content */}
                              {task.content && (
                                <p className="px-3 pb-2 text-xs text-muted-foreground line-clamp-2 pl-9">
                                  {task.content}
                                </p>
                              )}

                              {/* Card Footer */}
                              <div className="px-3 pb-3 pl-9 flex flex-wrap items-center gap-2">
                                {/* Category Tag */}
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] font-medium ${categoryConfig.bgLight} ${categoryConfig.textColor} border-0`}
                                >
                                  {task.category}
                                </Badge>

                                {/* Priority */}
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${priorityConfig.textColor} ${priorityConfig.bgLight} ${priorityConfig.borderColor}`}
                                >
                                  <Flag className="h-2.5 w-2.5 mr-0.5" />
                                  {priorityConfig.label}
                                </Badge>

                                {/* Due Date */}
                                {task.dueDate && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${overdue ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-muted/50'}`}
                                  >
                                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                                    {formatDate(task.dueDate)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between bg-card rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  const newDate = new Date(selectedCalendarDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedCalendarDate(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[180px] text-center">
                {format(selectedCalendarDate, 'MMMM yyyy', { locale: vi })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  const newDate = new Date(selectedCalendarDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedCalendarDate(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCalendarDate(new Date())}
            >
              Hôm nay
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/30 dark:bg-muted/10">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => (
                <div key={day} className={`p-3 text-center text-sm font-semibold ${idx === 0 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {(() => {
                const year = selectedCalendarDate.getFullYear();
                const month = selectedCalendarDate.getMonth();
                const firstDayOfMonth = new Date(year, month, 1);
                const lastDayOfMonth = new Date(year, month + 1, 0);
                const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
                const totalDays = lastDayOfMonth.getDate();

                const days = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Previous month days
                const prevMonthLastDay = new Date(year, month, 0).getDate();
                for (let i = startDay - 1; i >= 0; i--) {
                  days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, fullDate: new Date(year, month - 1, prevMonthLastDay - i) });
                }

                // Current month days
                for (let d = 1; d <= totalDays; d++) {
                  days.push({ date: d, isCurrentMonth: true, fullDate: new Date(year, month, d) });
                }

                // Next month days
                const remaining = 42 - days.length; // 6 rows × 7 days
                for (let i = 1; i <= remaining; i++) {
                  days.push({ date: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) });
                }

                return days.map((day, idx) => {
                  const dateStr = format(day.fullDate, 'yyyy-MM-dd');
                  // Compare by extracting yyyy-MM-dd from dueDate (which is ISO string)
                  const dayTasks = tasks.filter(t => {
                    if (!t.dueDate || t.status === 'done') return false;
                    const taskDateStr = t.dueDate.split('T')[0]; // Extract yyyy-MM-dd from ISO
                    return taskDateStr === dateStr;
                  });
                  const isToday = day.fullDate.getTime() === today.getTime();

                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] md:min-h-[120px] border-b border-r border-border/50 dark:border-border/30 p-1.5 transition-colors ${!day.isCurrentMonth ? 'bg-muted/20 dark:bg-muted/5 text-muted-foreground' :
                        isToday ? 'bg-teal-50 dark:bg-teal-900/30 ring-2 ring-inset ring-teal-500/30 dark:ring-teal-400/30' :
                          'bg-card dark:bg-card'
                        } hover:bg-accent/50 dark:hover:bg-accent/20 cursor-pointer`}
                      onClick={() => {
                        if (day.isCurrentMonth) {
                          handleOpenDialog('todo', null, dateStr);
                        }
                      }}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'bg-teal-500 dark:bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm' :
                        idx % 7 === 0 ? 'text-red-500 dark:text-red-400' :
                          !day.isCurrentMonth ? 'text-muted-foreground/40 dark:text-muted-foreground/30' :
                            'text-foreground'
                        }`}>
                        {day.date}
                      </div>

                      {/* Tasks for this day */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => {
                          const priorityColors = {
                            high: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-l-red-500',
                            medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-l-amber-500',
                            low: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-l-green-500'
                          };
                          return (
                            <div
                              key={task.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate border-l-2 cursor-pointer hover:opacity-80 ${priorityColors[task.priority] || priorityColors.medium}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(task.status, task);
                              }}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          );
                        })}
                        {dayTasks.length > 3 && (
                          <div className="text-[10px] text-muted-foreground font-medium px-1.5">
                            +{dayTasks.length - 3} khác
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-card dark:bg-card/50 rounded-lg border border-border/50 p-3">
            <span className="font-semibold text-foreground">Chú thích:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-600 shadow-sm" />
              <span>Ưu tiên cao</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-600 shadow-sm" />
              <span>Trung bình</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-600 shadow-sm" />
              <span>Thấp</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-teal-500 dark:bg-teal-600 shadow-sm" />
              <span>Hôm nay</span>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md bg-background dark:bg-card border-border">
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
              {editingTask ? 'Cập nhật thông tin task' : `Thêm vào cột: ${KANBAN_COLUMNS.find(c => c.id === targetColumn)?.title}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Tiêu đề *</label>
              <Input
                placeholder="Nhập tiêu đề task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 bg-background dark:bg-muted/30 border-border text-foreground"
                autoFocus
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Mô tả</label>
              <Textarea
                placeholder="Nhập mô tả chi tiết..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-background dark:bg-muted/30 border-border text-foreground"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Danh mục</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((cat) => (
                  <Button
                    key={cat.name}
                    type="button"
                    variant={category === cat.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(cat.name)}
                    className={category === cat.name ? `${cat.color} text-white border-0` : 'dark:border-border dark:text-foreground dark:hover:bg-muted'}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Ngày hết hạn</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal h-10 bg-background dark:bg-muted/30 border-border ${dueDate ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(new Date(dueDate), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background dark:bg-card border-border" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={(date) => setDueDate(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority - Full width row */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Độ ưu tiên</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={priority === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPriority(key)}
                    className={`h-9 ${priority === key ? config.color + ' text-white border-0 hover:opacity-90' : 'dark:border-border dark:text-foreground dark:hover:bg-muted'}`}
                  >
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleCloseDialog} className="flex-1 dark:border-border dark:text-foreground dark:hover:bg-muted">
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
              disabled={!title.trim()}
            >
              {editingTask ? 'Cập nhật' : 'Thêm task'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NotesPlansTab;
