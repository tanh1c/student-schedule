import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import {
  Note as NotesIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  List as ListIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function NotesPlansTab() {
  const [viewMode, setViewMode] = useState('list');
  const [filterType, setFilterType] = useState('all');
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('note'); // 'note' or 'plan'
  const [editingItem, setEditingItem] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('medium');

  const checkDeadlines = useCallback(() => {
    const today = dayjs();
    const upcomingDeadlines = items.filter(item => {
      if (item.type === 'plan' && item.dueDate) {
        const deadline = dayjs(item.dueDate);
        const daysUntil = deadline.diff(today, 'day');
        return daysUntil >= 0 && daysUntil <= 7; // Next 7 days
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
      setDueDate(item.dueDate ? dayjs(item.dueDate) : null);
      setPriority(item.priority || 'medium');
    } else {
      setTitle('');
      setContent('');
      setDueDate(null);
      setPriority('medium');
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setTitle('');
    setContent('');
    setDueDate(null);
    setPriority('medium');
  };

  const handleSave = () => {
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      type: dialogType,
      title,
      content,
      dueDate: dueDate ? dueDate.toISOString() : null,
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

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#f44336',
      medium: '#ff9800',
      low: '#4caf50',
    };
    return colors[priority] || '#9e9e9e';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp',
    };
    return labels[priority] || priority;
  };

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'notes') return item.type === 'note';
    if (filterType === 'plans') return item.type === 'plan';
    return true;
  });

  const renderListView = () => (
    <Grid container spacing={2}>
      {filteredItems.map((item) => (
        <Grid item xs={12} md={6} lg={4} key={item.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="div" noWrap>
                  {item.title}
                </Typography>
                <Chip
                  label={item.type === 'note' ? 'Ghi chú' : 'Kế hoạch'}
                  size="small"
                  color={item.type === 'note' ? 'primary' : 'secondary'}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {item.content}
              </Typography>

              {item.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="caption">
                    {dayjs(item.dueDate).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
              )}

              <Chip
                label={getPriorityLabel(item.priority)}
                size="small"
                sx={{
                  backgroundColor: getPriorityColor(item.priority),
                  color: 'white',
                }}
              />
            </CardContent>

            <CardActions>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(item.type, item)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCalendarView = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Chế độ xem lịch đang được phát triển
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Tính năng này sẽ được cập nhật trong phiên bản tới
      </Typography>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {notifications.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }} icon={<NotificationIcon />}>
            <Typography variant="subtitle2" gutterBottom>
              Thông báo deadline sắp tới:
            </Typography>
            {notifications.map((item) => (
              <Typography key={item.id} variant="body2">
                • {item.title} - {dayjs(item.dueDate).format('DD/MM/YYYY')}
              </Typography>
            ))}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('note')}
                  >
                    Thêm Ghi Chú
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('plan')}
                  >
                    Thêm Kế Hoạch
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Hiển thị</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      label="Hiển thị"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="notes">Chỉ ghi chú</MenuItem>
                      <MenuItem value="plans">Chỉ kế hoạch</MenuItem>
                    </Select>
                  </FormControl>

                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                  >
                    <ToggleButton value="list">
                      <ListIcon />
                    </ToggleButton>
                    <ToggleButton value="calendar">
                      <CalendarIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {filteredItems.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 8,
                    color: 'text.secondary',
                  }}
                >
                  <NotesIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6">
                    Chưa có ghi chú hoặc kế hoạch nào
                  </Typography>
                  <Typography variant="body2">
                    Nhấn "Thêm Ghi Chú" hoặc "Thêm Kế Hoạch" để bắt đầu
                  </Typography>
                </Box>
              ) : (
                viewMode === 'list' ? renderListView() : renderCalendarView()
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Dialog for adding/editing notes and plans */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingItem
              ? `Chỉnh sửa ${dialogType === 'note' ? 'ghi chú' : 'kế hoạch'}`
              : `Thêm ${dialogType === 'note' ? 'ghi chú' : 'kế hoạch'} mới`
            }
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Tiêu đề"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Nội dung"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            {dialogType === 'plan' && (
              <DatePicker
                label="Ngày hết hạn"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              />
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Mức độ ưu tiên</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Mức độ ưu tiên"
              >
                <MenuItem value="low">Thấp</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="high">Cao</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSave} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default NotesPlansTab;
