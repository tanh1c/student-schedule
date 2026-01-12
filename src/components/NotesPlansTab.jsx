import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  StickyNote,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  ListFilter,
  Bell,
  X,
  Flag,
  Clock,
  Target
} from 'lucide-react';

function NotesPlansTab() {
  const [filterType, setFilterType] = useState('all');
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('note');
  const [editingItem, setEditingItem] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const checkDeadlines = useCallback(() => {
    const today = new Date();
    const upcomingDeadlines = items.filter(item => {
      if (item.type === 'plan' && item.dueDate) {
        const deadline = new Date(item.dueDate);
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 7;
      }
      return false;
    });
    setNotifications(upcomingDeadlines);
  }, [items]);

  useEffect(() => {
    checkDeadlines();
  }, [checkDeadlines]);

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);

    if (item) {
      setTitle(item.title);
      setContent(item.content);
      setDueDate(item.dueDate ? item.dueDate.split('T')[0] : '');
      setPriority(item.priority || 'medium');
    } else {
      setTitle('');
      setContent('');
      setDueDate('');
      setPriority('medium');
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setTitle('');
    setContent('');
    setDueDate('');
    setPriority('medium');
  };

  const handleSave = () => {
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      type: dialogType,
      title,
      content,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setItems([...items, newItem]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getPriorityInfo = (priority) => {
    const info = {
      high: { label: 'Cao', color: 'bg-red-500', textColor: 'text-red-500' },
      medium: { label: 'TB', color: 'bg-amber-500', textColor: 'text-amber-500' },
      low: { label: 'Thấp', color: 'bg-green-500', textColor: 'text-green-500' },
    };
    return info[priority] || info.medium;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'notes') return item.type === 'note';
    if (filterType === 'plans') return item.type === 'plan';
    return true;
  });

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <StickyNote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ghi chú & Kế hoạch</h2>
            <p className="text-sm text-muted-foreground">Quản lý ghi chú và deadline</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30">
          <Bell className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <span className="font-semibold text-amber-800 dark:text-amber-400">
              Deadline sắp tới ({notifications.length}):
            </span>
            <div className="mt-1 space-y-0.5">
              {notifications.map((item) => (
                <div key={item.id} className="text-sm text-amber-700 dark:text-amber-500">
                  • {item.title} - {formatDate(item.dueDate)}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions & Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-2">
              <Button onClick={() => handleOpenDialog('note')}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm Ghi chú
              </Button>
              <Button variant="secondary" onClick={() => handleOpenDialog('plan')}>
                <Target className="h-4 w-4 mr-2" />
                Thêm Kế hoạch
              </Button>
            </div>

            <div className="flex gap-2">
              {['all', 'notes', 'plans'].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  <ListFilter className="h-4 w-4 mr-1" />
                  {type === 'all' ? 'Tất cả' : type === 'notes' ? 'Ghi chú' : 'Kế hoạch'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <StickyNote className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Chưa có ghi chú hoặc kế hoạch nào
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Nhấn "Thêm Ghi chú" hoặc "Thêm Kế hoạch" để bắt đầu
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const priorityInfo = getPriorityInfo(item.priority);
            return (
              <Card key={item.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                    <Badge variant={item.type === 'note' ? 'default' : 'secondary'}>
                      {item.type === 'note' ? 'Ghi chú' : 'Kế hoạch'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {item.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.dueDate)}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded text-white ${priorityInfo.color}`}>
                      <Flag className="h-3 w-3" />
                      <span>{priorityInfo.label}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(item.type, item)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingItem
                    ? `Chỉnh sửa ${dialogType === 'note' ? 'ghi chú' : 'kế hoạch'}`
                    : `Thêm ${dialogType === 'note' ? 'ghi chú' : 'kế hoạch'} mới`
                  }
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseDialog}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tiêu đề</label>
                <Input
                  placeholder="Nhập tiêu đề..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Nội dung</label>
                <Textarea
                  placeholder="Nhập nội dung..."
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {dialogType === 'plan' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ngày hết hạn</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">Mức độ ưu tiên</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((p) => {
                    const info = getPriorityInfo(p);
                    return (
                      <Button
                        key={p}
                        variant={priority === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPriority(p)}
                        className={priority === p ? info.color : ''}
                      >
                        {info.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleSave} className="flex-1" disabled={!title}>
                  Lưu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default NotesPlansTab;
