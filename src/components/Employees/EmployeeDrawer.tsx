import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  Button, 
  Divider, 
  Avatar, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { X, Clock, Calendar, BarChart2, Edit, Save, ArrowLeft, Plus, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Employee, VisitHistoryItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { generateQRDataURL } from '../../utils/qrUtils';

interface EmployeeDrawerProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onSaveEmployee: (updated: Employee) => void;
}

export const EmployeeDrawer: React.FC<EmployeeDrawerProps> = ({ 
  employee, 
  open, 
  onClose, 
  onSaveEmployee 
}) => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPosition, setEditedPosition] = useState('');
  const [editedRole, setEditedRole] = useState('');
  const [editedActivity, setEditedActivity] = useState<'green' | 'yellow' | 'red'>('green');

  const [tab, setTab] = useState<'info' | 'history' | 'qr' | 'notes'>('info');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  // Manual visit form state
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualCheckIn, setManualCheckIn] = useState('09:00');
  const [manualCheckOut, setManualCheckOut] = useState('18:00');

  useEffect(() => {
    if (employee) {
      setEditedName(employee.name);
      setEditedPosition(employee.position);
      setEditedRole(employee.role || 'employee');
      setEditedActivity(employee.activityLevel);
      setIsEditing(false); // Reset to view mode first
      setTab('info'); // Reset to info tab on opening/employee change

      const stored = localStorage.getItem(`note_${employee.id}`);
      setNote(stored || '');
      setSaved(false);
    }
  }, [employee, open]);

  if (!employee) return null;

  const handleSave = () => {
    if (editedName.trim() === '' || editedPosition.trim() === '') return;
    onSaveEmployee({
      ...employee,
      name: editedName,
      position: editedPosition,
      role: editedRole,
      activityLevel: editedActivity
    });
    setIsEditing(false);
  };

  const handleSaveNote = () => {
    if (!employee) return;
    localStorage.setItem(`note_${employee.id}`, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getActivityColor = (level: 'green' | 'yellow' | 'red') => {
    switch (level) {
      case 'green': return '#2E7D32'; 
      case 'yellow': return '#F9A825'; 
      case 'red': return '#C62828';
      default: return '#718096';
    }
  };

  // Helper calculation for manual hours add (БЛОК 2)
  const calculateDuration = (inTime: string, outTime: string) => {
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    const diffMin = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMin <= 0) return '0ч 00м';
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return `${h}ч ${m.toString().padStart(2, '0')}м`;
  };

  const handleAddVisitManual = () => {
    const totalTime = calculateDuration(manualCheckIn, manualCheckOut);
    const newVisit: VisitHistoryItem = {
      id: `v-man-${Date.now()}`,
      date: manualDate,
      checkIn: manualCheckIn,
      checkOut: manualCheckOut,
      totalTime
    };

    const currentHistory = employee.visitsHistory || [];
    const updatedHistory = [newVisit, ...currentHistory];

    onSaveEmployee({
      ...employee,
      visitsHistory: updatedHistory
    });

    setVisitDialogOpen(false);
  };

  const handleDownloadQR = () => {
    const url = generateQRDataURL(`офис-контроль://employee/${employee.id}`);
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `qr-employee-${employee.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        const a = document.createElement('a');
        a.href = url + '&download=1';
        a.target = '_blank';
        a.click();
      });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 460 }, borderLeft: 'none' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
        {/* Header toolbar */}
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isEditing ? 'Редактировать сотрудника' : 'Карточка сотрудника'}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Contents area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          {isEditing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField 
                label="ФИО сотрудника" 
                variant="outlined" 
                fullWidth 
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                error={editedName.trim() === ''}
                helperText={editedName.trim() === '' ? 'Обязательное поле' : ''}
              />
              <TextField 
                label="Должность" 
                variant="outlined" 
                fullWidth 
                value={editedPosition}
                onChange={(e) => setEditedPosition(e.target.value)}
                error={editedPosition.trim() === ''}
                helperText={editedPosition.trim() === '' ? 'Обязательное поле' : ''}
              />
              <TextField 
                label="Роль" 
                variant="outlined" 
                fullWidth 
                value={editedRole}
                onChange={(e) => setEditedRole(e.target.value)}
              />
              <TextField 
                select
                label="Стабильность присутствия" 
                variant="outlined" 
                fullWidth 
                value={editedActivity}
                onChange={(e) => setEditedActivity(e.target.value as 'green' | 'yellow' | 'red')}
              >
                <MenuItem value="green">Высокая (Зеленый)</MenuItem>
                <MenuItem value="yellow">Умеренная (Желтый)</MenuItem>
                <MenuItem value="red">Низкая (Красный)</MenuItem>
              </TextField>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<ArrowLeft size={16} />}
                  onClick={() => setIsEditing(false)}
                  sx={{ flex: 1 }}
                >
                  Назад
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<Save size={16} />} 
                  onClick={handleSave}
                  disabled={editedName.trim() === '' || editedPosition.trim() === ''}
                  sx={{ flex: 1, bgcolor: 'primary.main', color: 'white' }}
                >
                  Сохранить
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              {/* Profile Card Summary */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'primary.main', 
                    fontSize: '1.5rem', 
                    fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                  }}
                >
                  {getInitials(employee.name)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {employee.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, my: 0.3 }}>
                    {employee.position}
                  </Typography>
                </Box>
              </Box>

              <Tabs 
                value={tab} 
                onChange={(_, v) => setTab(v)} 
                sx={{ borderBottom: '0.5px solid #EBEBEB', mb: 2.5 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Информация" value="info" sx={{ fontSize: 12, fontWeight: 500 }} />
                <Tab label="История" value="history" sx={{ fontSize: 12, fontWeight: 500 }} />
                <Tab label="QR-код" value="qr" sx={{ fontSize: 12, fontWeight: 500 }} />
                <Tab label="Заметки" value="notes" sx={{ fontSize: 12, fontWeight: 500 }} />
              </Tabs>

              {/* TAB 1: Информация */}
              {tab === 'info' && (
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3.5 }}>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Clock size={18} style={{ color: '#1565C0' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Приход сегодня</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {employee.checkInTime || 'Н/Д'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Clock size={18} style={{ color: '#2E7D32' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Время в офисе</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {employee.timeSpent || '—'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ gridColumn: 'span 2', bgcolor: 'background.default', p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: getActivityColor(employee.activityLevel)
                        }} 
                      />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Средняя активность (30д)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {employee.activityLevel === 'green' ? 'Высокая стабильность' : employee.activityLevel === 'yellow' ? 'Умеренная активность' : 'Критически низкая активность'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Monthly summary parameters */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2.5, boxShadow: 'none' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.73)', display: 'block', fontWeight: 500 }}>
                      Статистика за текущий месяц
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                      <Box>
                         <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>8.1 ч</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>Ср. время в офисе</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>96 %</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>Процент присутствия</Typography>
                      </Box>
                    </Box>
                  </Box>

                  {isAdmin && (
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<Edit size={16} />}
                      onClick={() => setIsEditing(true)}
                      sx={{ mt: 3, py: 1 }}
                    >
                      Редактировать карточку
                    </Button>
                  )}
                </Box>
              )}

              {/* TAB 2: История (БЛОК 2) */}
              {tab === 'history' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 600 }}>
                      <Calendar size={16} /> История посещений
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Plus size={14} />}
                      onClick={() => setVisitDialogOpen(true)}
                    >
                      Добавить запись
                    </Button>
                  </Box>

                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 4 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Дата</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Вход</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Выход</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Всего</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(employee.visitsHistory || []).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 2 }}>
                              Нет записей истории.
                            </TableCell>
                          </TableRow>
                        ) : (
                          (employee.visitsHistory || []).map((visit) => (
                            <TableRow key={visit.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell sx={{ fontSize: '0.78rem' }}>{visit.date}</TableCell>
                              <TableCell sx={{ fontSize: '0.78rem' }}>{visit.checkIn}</TableCell>
                              <TableCell sx={{ fontSize: '0.78rem' }}>{visit.checkOut}</TableCell>
                              <TableCell sx={{ fontSize: '0.78rem', fontWeight: 600 }} align="right">{visit.totalTime}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Weekly bar chart */}
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 600, mb: 1.5 }}>
                    <BarChart2 size={16} /> Наработка по дням недели (часов)
                  </Typography>
                  <Box sx={{ height: 160, bgcolor: 'background.default', p: 1.5, borderRadius: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employee.attendanceHistory || []}>
                        <XAxis dataKey="day" stroke="#718096" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#718096" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                        <Bar dataKey="hours" name="Часов" radius={[4, 4, 0, 0]}>
                          {(employee.attendanceHistory || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.hours > 0 ? theme.palette.primary.main : 'rgba(0,0,0,0.1)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              )}

              {/* TAB 3: QR-код (БЛОК 10) */}
              {tab === 'qr' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, textAlign: 'center' }}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'white', borderRadius: '12px' }}>
                    <img 
                      src={generateQRDataURL(`офис-контроль://employee/${employee.id}`)} 
                      alt="Employee QR Code"
                      style={{ width: 200, height: 200, display: 'block' }} 
                    />
                  </Paper>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                    офис-контроль://employee/{employee.id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3, maxWidth: 300 }}>
                    Отсканируйте код для быстрого перехода к личной карточке сотрудника на планшете охраны
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Download size={16} />}
                    onClick={handleDownloadQR}
                    sx={{ px: 4, bgcolor: 'primary.main', color: 'white' }}
                  >
                    Скачать QR
                  </Button>
                </Box>
              )}

              {/* TAB 4: Заметки */}
              {tab === 'notes' && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#888', mb: 1.5 }}>
                    Заметки видны только вам
                  </Typography>
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    placeholder="Например: обсудить KPI на встрече в пятницу..."
                    value={note}
                    onChange={(e) => { setNote(e.target.value); setSaved(false); }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 13,
                        borderRadius: '10px',
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveNote}
                      sx={{ fontWeight: 500, borderRadius: '8px', boxShadow: 'none', bgcolor: 'primary.main', color: 'white' }}
                    >
                      {saved ? 'Сохранено' : 'Сохранить'}
                    </Button>
                    {note && (
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => { setNote(''); localStorage.removeItem(`note_${employee.id}`); }}
                        sx={{ ml: 1, fontSize: 12, color: '#888' }}
                      >
                        Очистить
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Manual Add Visit Dialog (БЛОК 2) */}
      <Dialog open={visitDialogOpen} onClose={() => setVisitDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 500 }}>Добавить запись вручную</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1, pb: 1 }}>
          <TextField
            label="Дата"
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Время прихода"
            type="time"
            value={manualCheckIn}
            onChange={(e) => setManualCheckIn(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Время ухода"
            type="time"
            value={manualCheckOut}
            onChange={(e) => setManualCheckOut(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setVisitDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAddVisitManual} sx={{ bgcolor: 'primary.main', color: 'white' }}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};
export default EmployeeDrawer;
