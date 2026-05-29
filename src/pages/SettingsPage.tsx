import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  useTheme,
  IconButton
} from '@mui/material';
import { 
  Settings, 
  Database, 
  Users, 
  UserPlus, 
  Trash2, 
  Key, 
  Server, 
  ShieldAlert,
  Settings2,
  Bell,
  Keyboard,
  Download,
  Upload,
  Clock,
  ExternalLink
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useOfficeStore } from '../store/officeStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { requestNotificationPermission } from '../utils/notificationUtils';
import { User } from '../types';

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { users, addUser, deleteUser, updateUserRole, resetToDefaults } = useOfficeStore();
  const { 
    workSchedule, 
    updateWorkSchedule, 
    browserNotificationsEnabled, 
    setBrowserNotificationsEnabled 
  } = useUiStore();

  const [isLoading, setIsLoading] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  
  // App parameters defaults
  const [serverHost, setServerHost] = useState('192.168.1.100:8080');
  const [logInterval, setLogInterval] = useState('30');
  const [synchApiKey, setSynchApiKey] = useState('API_KEY_SECURE_LINK_72819');

  // Work schedule edit parameters (БЛОК 12)
  const [scheduleStart, setScheduleStart] = useState(workSchedule?.workStart || '09:00');
  const [scheduleEnd, setScheduleEnd] = useState(workSchedule?.workEnd || '18:00');

  // Add User wizard modal states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Operator' | 'Viewer'>('Viewer');
  const [formTouched, setFormTouched] = useState(false);

  // Snackbar alerts
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const isAdmin = user?.role === 'Admin';

  const handleCreateUser = () => {
    setFormTouched(true);
    if (newUserLogin.trim() === '' || newUserName.trim() === '' || newUserEmail.trim() === '' || newUserPassword.trim() === '') {
      return;
    }

    addUser({
      id: newUserLogin,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      lastLogin: 'Никогда',
    });

    setSnackbarMsg(`Пользователь "${newUserName}" добавлен с ролью ${newUserRole}.`);
    setSnackbarOpen(true);
    setAddUserOpen(false);

    // Reset wizard fields
    setNewUserLogin('');
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('Viewer');
    setFormTouched(false);
  };

  const handleDeleteUser = (loginVal: string, nameVal: string) => {
    if (loginVal === user?.id) {
      setSnackbarMsg('Вы не можете удалить свою собственную учетную запись!');
      setSnackbarOpen(true);
      return;
    }
    deleteUser(loginVal);
    setSnackbarMsg('Пользователь удалён');
    setSnackbarOpen(true);
  };

  const handleRoleChangeInPlace = (loginValue: string, nextRole: 'Admin' | 'Operator' | 'Viewer') => {
    updateUserRole(loginValue, nextRole);
    setSnackbarMsg('Права изменены');
    setSnackbarOpen(true);
  };

  const handleSaveAppParams = () => {
    setSnackbarMsg('Системные настройки сервера сохранены.');
    setSnackbarOpen(true);
  };

  // Browser Notification Settings toggle logic (БЛОК 4)
  const handleNotificationToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setBrowserNotificationsEnabled(checked);
    if (checked) {
      const permission = await requestNotificationPermission();
      if (permission) {
        setSnackbarMsg('Уведомления браузера включены!');
      } else {
        setSnackbarMsg('Разрешение на уведомления отклонено в браузере!');
      }
    } else {
      setSnackbarMsg('Уведомления браузера отключены.');
    }
    setSnackbarOpen(true);
  };

  // Work Schedule save (БЛОК 12)
  const handleSaveSchedule = () => {
    updateWorkSchedule({
      workStart: scheduleStart,
      workEnd: scheduleEnd,
      workDays: [1, 2, 3, 4, 5] // default weekdays (Mon-Fri)
    });
    setSnackbarMsg('Рабочее расписание успешно сохранено в системе!');
    setSnackbarOpen(true);
  };

  // Export Data to File logic (БЛОК 6)
  const handleExportData = () => {
    const { employees, rules, users, zones, officeMode } = useOfficeStore.getState();
    const payload = {
      employees,
      rules,
      users,
      zones,
      officeMode,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `office-control-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbarMsg('Резервная копия данных успешно скачана!');
    setSnackbarOpen(true);
  };

  // Import Data from File logic (БЛОК 6)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.employees && data.rules && data.users && data.zones) {
          useOfficeStore.setState({
            employees: data.employees,
            rules: data.rules,
            users: data.users,
            zones: data.zones,
            officeMode: data.officeMode || 'normal'
          });
          setSnackbarMsg('Резервная копия успешно восстановлена!');
          setSnackbarOpen(true);
        } else {
          setSnackbarMsg('Неверная структура резервной копии!');
          setSnackbarOpen(true);
        }
      } catch (err) {
        setSnackbarMsg('Ошибка чтения или разбора файла резервной копии!');
        setSnackbarOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const triggerImportClick = () => {
    document.getElementById('import-file-input')?.click();
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'Admin': return 'Администратор';
      case 'Operator': return 'Оператор';
      case 'Viewer': return 'Наблюдатель';
      default: return r;
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Настройки" 
        description="Параметры системы"
        action={
          <Button
            component="a"
            href="/kiosk"
            target="_blank"
            variant="contained"
            startIcon={<ExternalLink size={15} />}
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Режим киоска (Ресепшн)
          </Button>
        }
      />

      {/* Main grids layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3.5, mb: 4 }}>
        
        {/* LEFT COLUMN: System Server settings & work schedule configs */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          
          {/* Card 1: Server and Network parameters */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings2 size={18} color={theme.palette.primary.main} />
                Параметры сервера
              </Typography>
              
              <TextField 
                label="Адрес локального хоста сервера" 
                variant="outlined" 
                fullWidth
                value={serverHost}
                onChange={(e) => setServerHost(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <Server size={16} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                  }
                }}
              />

              <TextField 
                label="Сохранять логи" 
                variant="outlined" 
                fullWidth
                select
                value={logInterval}
                onChange={(e) => setLogInterval(e.target.value)}
              >
                <MenuItem value="5">Каждые 5 минут</MenuItem>
                <MenuItem value="10">Каждые 10 минут</MenuItem>
                <MenuItem value="30">Каждые 30 минут</MenuItem>
                <MenuItem value="60">Каждый час</MenuItem>
              </TextField>

              <TextField 
                label="Токен авторизации" 
                variant="outlined" 
                type="password"
                color="primary"
                fullWidth
                value={synchApiKey}
                onChange={(e) => setSynchApiKey(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <Key size={16} style={{ marginRight: 8 }} />
                  }
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, ml: 'auto', mt: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => setResetConfirm(true)}
                >
                  Сбросить к исходным
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveAppParams}
                  sx={{ px: 4, bgcolor: 'primary.main', color: 'white' }}
                >
                  Сохранить
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Card 2: Work Schedule Configurations (БЛОК 12) */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={18} color={theme.palette.primary.main} />
                Рабочий график
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -1 }}>
                Настройка времени начала и окончания рабочего дня. Сотрудники, пришедшие позже начала дня, будут отмечаться цветом контроля опозданий.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Начало (Контроль опозданий)"
                  type="time"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="Конец дня"
                  type="time"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleSaveSchedule}
                sx={{ mt: 1 }}
              >
                Сохранить правила графика
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Browser notifications (БЛОК 4) */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bell size={18} color={theme.palette.primary.main} />
                Оповещения и звуки
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -1.2 }}>
                Управляйте получением мгновенных системных событий прямо в фоне операционной системы.
              </Typography>

              <FormControlLabel
                control={
                  <Switch 
                    checked={browserNotificationsEnabled}
                    onChange={handleNotificationToggle}
                    color="primary"
                  />
                }
                label="Включить пуш-уведомления браузера"
              />
            </CardContent>
          </Card>

          {/* Card 4: Backup Data and Restore (БЛОК 6) */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Database size={18} color={theme.palette.primary.main} />
                Резервное копирование и сброс
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -1.2 }}>
                Экспортируйте или загружайте текущую базу данных в JSON-файл для переноса или архивирования всей информации о сотрудниках.
              </Typography>

              <input 
                type="file" 
                id="import-file-input" 
                accept=".json" 
                style={{ display: 'none' }} 
                onChange={handleImportFile} 
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download size={15} />}
                  onClick={handleExportData}
                  fullWidth
                >
                  Экспорт данных
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Upload size={15} />}
                  onClick={triggerImportClick}
                  fullWidth
                >
                  Импорт данных
                </Button>
              </Box>
            </CardContent>
          </Card>

        </Box>

        {/* RIGHT COLUMN: User lists & hotkeys explanations */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          
          {/* Card 5: Hotkeys reference registry (БЛОК 5) */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Keyboard size={18} color={theme.palette.primary.main} />
                Горячие клавиши (Быстрая навигация)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -1.2 }}>
                Используйте глобальные сочетания клавиш на клавиатуре из любого раздела для ускорения процессов.
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mt: 1, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Клавиша</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Вызываемое действие</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>D или Shift+D</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>Главная панель (Dashboard)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>E или Shift+E</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>Сотрудники (Employees)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>V или Shift+V</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>Журнал событий (Events)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>C или Shift+C</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>Камеры наблюдения (Cameras)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>A или Shift+A</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>Статистика и аналитика (Analytics)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>S или Shift+S</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>Настройки системы (Settings)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>ESC (Escape)</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>Закрыть открытые модальные окна, сайдбары, карточки</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Card 6: User lists (existing flow preserved) */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={18} color={theme.palette.primary.main} />
                    Управление пользователями
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                    Пользователи с авторизованным доступом в веб-интерфейс
                  </Typography>
                </Box>

                {isAdmin && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<UserPlus size={14} />} 
                    onClick={() => setAddUserOpen(true)}
                  >
                    Добавить оператора
                  </Button>
                )}
              </Box>

              <Divider />

              {isAdmin ? (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500 }}>Оператор</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Логин</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Права доступа</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((us) => {
                        const isMatch = us.id === user?.id || (user && us.role === user.role);
                        const nameVal = isMatch ? user.name : us.name;
                        const emailVal = isMatch ? user.email : us.email;
                        const loginVal = isMatch ? user.email : us.id;
                        return (
                          <TableRow key={us.id} sx={{ '&:hover': { bgcolor: 'background.default' } }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{nameVal}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{emailVal}</Typography>
                            </TableCell>
                            
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{loginVal}</TableCell>
                            
                            <TableCell sx={{ minWidth: 140 }}>
                              <Select
                                value={us.role}
                                size="small"
                                onChange={(e) => handleRoleChangeInPlace(us.id, e.target.value as any)}
                                sx={{ fontSize: '0.8rem', height: 28 }}
                              >
                                <MenuItem value="Admin">Администратор</MenuItem>
                                <MenuItem value="Operator">Оператор</MenuItem>
                                <MenuItem value="Viewer">Наблюдатель</MenuItem>
                              </Select>
                            </TableCell>

                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteUser(us.id, us.name)}
                                disabled={us.id === user?.id}
                              >
                                <Trash2 size={15} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Оператор</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Логин</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Права доступа</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {user && (
                          <TableRow sx={{ '&:hover': { bgcolor: 'background.default' } }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.email}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                {user.role === 'Admin' ? 'Администратор' : user.role === 'Operator' ? 'Оператор' : 'Наблюдатель'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      bgcolor: 'background.default', 
                      borderRadius: 3.5, 
                      textAlign: 'center' 
                    }}
                  >
                    <ShieldAlert size={24} color={theme.palette.warning.main} style={{ marginBottom: 6 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.2 }}>Доступ ограничен</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 300 }}>
                      Редактировать учетные записи сотрудников и менять права операторов имеет право только Администратор системы.
                    </Typography>
                  </Box>
                </Box>
              )}

            </CardContent>
          </Card>

        </Box>
      </Box>

      {/* User wizard modals */}
      <Dialog 
        open={addUserOpen} 
        onClose={() => setAddUserOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', border: '0.5px solid', borderColor: 'divider' } } }}
      >
        <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>
          Новый пользователь
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField 
            label="Имя (ФИО)" 
            variant="outlined" 
            fullWidth 
            required
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            error={formTouched && newUserName.trim() === ''}
          />
          <TextField 
            label="Логин входа" 
            variant="outlined" 
            fullWidth 
            required
            value={newUserLogin}
            onChange={(e) => setNewUserLogin(e.target.value)}
            error={formTouched && newUserLogin.trim() === ''}
          />
          <TextField 
            label="Email почта" 
            variant="outlined" 
            fullWidth 
            required
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            error={formTouched && newUserEmail.trim() === ''}
          />
          <TextField 
            label="Пароль" 
            variant="outlined" 
            type="password"
            fullWidth 
            required
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            error={formTouched && newUserPassword.trim() === ''}
          />
          <FormControl fullWidth>
            <InputLabel id="role-select">Роль</InputLabel>
            <Select
              labelId="role-select"
              value={newUserRole}
              label="Роль"
              onChange={(e) => setNewUserRole(e.target.value as any)}
            >
              <MenuItem value="Admin">Администратор (Полные возможности)</MenuItem>
              <MenuItem value="Operator">Оператор (Управление инцидентами)</MenuItem>
              <MenuItem value="Viewer">Наблюдатель (Только просмотр)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Button onClick={() => setAddUserOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained" 
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetConfirm} onClose={() => setResetConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 500 }}>Сбросить данные?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Список сотрудников, правила и пользователи вернутся к исходным демо-данным.
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirm(false)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              resetToDefaults();
              setResetConfirm(false);
              setSnackbarMsg('Все данные сброшены к исходным демо-значениям');
              setSnackbarOpen(true);
            }}
          >
            Сбросить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default SettingsPage;
