import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Snackbar, 
  Alert, 
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import { MetricCard } from '../components/Dashboard/MetricCard';
import { ActivityChart } from '../components/Dashboard/ActivityChart';
import { EventsPieChart } from '../components/Dashboard/EventsPieChart';
import { useOfficeStore } from '../store/officeStore';
import { useAuthStore } from '../store/authStore';
import PriorityIcon from '../components/common/PriorityIcon';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    officeMode, 
    changeOfficeMode, 
    isEmergency, 
    triggerEmergency, 
    employees, 
    cameras, 
    events 
  } = useOfficeStore();

  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [showModeDialog, setShowModeDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'warning' | 'error' | 'info'>('success');

  const showToast = (msg: string, severity: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToastMsg(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleModeChange = (val: string) => {
    const storeValue = val === 'WORK_DAY' ? 'Рабочий день' : val === 'AFTER_WORK' ? 'После работы' : 'Выходной';
    changeOfficeMode(storeValue);

    let label = 'Рабочий день';
    if (val === 'AFTER_WORK') label = 'После работы';
    if (val === 'WEEKEND') label = 'Выходной';
    showToast(`Режим охраны изменен на: ${label}`, 'success');
  };

  const handleEmergencyTrigger = () => {
    triggerEmergency('other');
    showToast('Сигнал тревоги отправлен охране', 'error');
  };

  const handleQuickReport = async () => {
    const today = new Date().toLocaleDateString('ru', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const inOffice = employees.filter(e => e.checkInTime);
    const absent = employees.filter(e => !e.checkInTime);
    const onlineCams = cameras.filter(c => c.status !== 'offline');
    const criticalEvents = events.filter(e => e.level === 'critical');
    const avgCheckIn = inOffice.length > 0
      ? inOffice.map(e => e.checkInTime || '09:00').sort()[Math.floor(inOffice.length / 2)]
      : '—';

    const report = `Отчёт за ${today}

Сотрудники
— В офисе: ${inOffice.length} из ${employees.length}
— Среднее время прихода: ${avgCheckIn}
${absent.length > 0 ? `— Отсутствуют: ${absent.map(e => e.name).join(', ')}` : '— Все сотрудники присутствуют'}

Камеры
— Онлайн: ${onlineCams.length} из ${cameras.length}
${cameras.filter(c => c.status === 'offline').length > 0
  ? `— Офлайн: ${cameras.filter(c => c.status === 'offline').map(c => c.name).join(', ')}`
  : '— Все камеры работают'}

События
— Всего за день: ${events.length}
— Критических: ${criticalEvents.length}
${criticalEvents.length > 0
  ? criticalEvents.map(e => `  · ${e.name} — ${e.location} (${e.timestamp})`).join('\n')
  : '— Критических событий нет'}`;

    try {
      await navigator.clipboard.writeText(report);
      showToast('Отчёт скопирован в буфер обмена');
    } catch {
      showToast('Не удалось скопировать — попробуйте снова');
    }
  };

  const activeCount = employees.filter(e => e.checkInTime).length;
  const totalCameras = cameras.length;
  const onlineCount = cameras.filter(c => c.status === 'online' || c.status === 'alert').length;
  const offlineCount = totalCameras - onlineCount;
  
  const todayAlarms = events.filter(e => e.level === 'critical' || e.level === 'warning');
  const newAlarmCount = todayAlarms.filter(e => e.status === 'new').length;
  const totalEventsToday = events.length;

  const uiOfficeMode = officeMode === 'Рабочий день' ? 'WORK_DAY' : officeMode === 'После работы' ? 'AFTER_WORK' : 'WEEKEND';

  const isMorning = new Date().getHours() < 12;
  const lateEmployees = employees.filter(e => {
    if (!e.checkInTime) return true;
    const [h, m] = e.checkInTime.split(':').map(Number);
    return h > 9 || (h === 9 && m > 15);
  });
  const nightEvents = events.filter(e => {
    const hour = parseInt(e.timestamp.split(':')[0]);
    return hour >= 19 || hour < 8;
  });

  const modeColor = officeMode === 'Рабочий день' ? '#27AE60' : officeMode === 'После работы' ? '#D97706' : '#C62828';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 17 ? 'Добрый день' : 'Добрый вечер';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 1.5 }}>
      
      {/* Page header with greeting and status chip */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: '16px', fontWeight: 500, color: 'text.primary' }}>
            {greeting}, {user?.name?.split(' ')[0] || 'Руководитель'}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.3 }}>
            {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Typography>
        </Box>
        <Chip
          icon={<Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: modeColor, ml: '8px !important' }} />}
          label={officeMode}
          onClick={() => setShowModeDialog(true)}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '0.5px solid',
            borderColor: 'divider',
            fontWeight: 500,
            fontSize: '12px',
            cursor: 'pointer',
            '& .MuiChip-icon': { mr: 0 },
          }}
        />
      </Box>

      {/* Morning digest row */}
      {isMorning && (
        <Box sx={{ mb: 2.5, p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
            {`В офисе ${activeCount} из ${employees.length}`}
            {lateEmployees.length > 0 ? ` · Опоздали: ${lateEmployees.slice(0,2).map(e => e.name.split(' ')[0]).join(', ')}` : ' · Все пришли вовремя'}
            {nightEvents.length > 0 ? ` · Ночью: ${nightEvents.length} событий` : ' · Ночь без событий'}
          </Typography>
        </Box>
      )}

      {isEmergency && (
        <Box sx={{ mb: 2.5, p: 1.5, bgcolor: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '13px', color: 'error.main', fontWeight: 500 }}>
            Активна тревога
          </Typography>
          <Button size="small" color="error" onClick={() => navigate('/emergency')}>
            Открыть
          </Button>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2.5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: '12px' }} />
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7.5fr 4.5fr' }, gap: 2.5 }}>
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: '12px' }} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7.5fr 4.5fr' }, gap: 2.5 }}>
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: '12px' }} />
          </Box>
        </Box>
      ) : (
        <Box>
          {/* 1. Statistics Cards Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1.25fr 1.25fr 1.25fr 1.25fr' }, gap: 2.5, mb: 2.5 }}>
            <MetricCard
              title="Сотрудников"
              value={activeCount}
              badge={`из ${employees.length}`}
              badgeColor="primary.main"
              onClick={() => navigate('/employees')}
            />
            <MetricCard
              title="Камеры онлайн"
              value={`${onlineCount}/${totalCameras}`}
              badge={offlineCount > 0 ? `${offlineCount} off` : undefined}
              badgeColor={offlineCount > 0 ? 'error.main' : 'success.main'}
              onClick={() => navigate('/cameras')}
            />
            <MetricCard
              title="Активных тревог"
              value={newAlarmCount}
              badge={newAlarmCount === 0 ? "ок" : "!"}
              badgeColor={newAlarmCount > 0 ? 'error.main' : 'success.main'}
            />
            <MetricCard
              title="Событий сегодня"
              value={totalEventsToday}
              badge="сег."
              badgeColor="text.secondary"
              onClick={() => navigate('/events')}
            />
          </Box>

          {/* 2. Charts Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7.5fr 4.5fr' }, gap: 2.5, mb: 2.5 }}>
            <ActivityChart />
            <EventsPieChart />
          </Box>

          {/* 3. Bottom Row: Events & Actions */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7.5fr 4.5fr' }, gap: 2.5 }}>
            {/* Last 5 events */}
            <Card sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>Последние события</Typography>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/events')}
                    startIcon={<AssignmentOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{ fontWeight: 500 }}
                  >
                    Весь журнал
                  </Button>
                </Box>
                <Divider />
                <List sx={{ p: 0, flexGrow: 1 }}>
                  {events.slice(0, 5).map((evt, idx) => (
                    <React.Fragment key={evt.id}>
                      <ListItem 
                        sx={{ 
                          px: 1, 
                          py: 1,
                          bgcolor: evt.status === 'new' ? 'action.selected' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover' },
                          transition: 'background-color 0.2s',
                        }}
                        secondaryAction={
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {evt.timestamp}
                          </Typography>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <PriorityIcon priority={evt.level} size={20} />
                        </ListItemIcon>
                        <ListItemText>
                          <Typography sx={{ fontSize: '13px', fontWeight: evt.status === 'new' ? 500 : 400, color: 'text.primary' }}>
                            {evt.name}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                            {evt.location}
                          </Typography>
                        </ListItemText>
                      </ListItem>
                      {idx < 4 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card>
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 500, mb: 0.5 }}>Быстрые действия</Typography>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary', display: 'block', mb: 2 }}>
                    Режим охраны и экстренные действия
                  </Typography>

                  {/* Mode selector */}
                  <Box sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    mb: 2,
                  }}>
                    {['WORK_DAY', 'AFTER_WORK', 'WEEKEND'].map((mode, i) => {
                      const labels = ['Рабочий день', 'После работы', 'Выходной'];
                      const colors = ['#27AE60', '#D97706', '#C62828'];
                      const isActive = uiOfficeMode === mode;
                      return (
                        <Box
                          key={mode}
                          onClick={() => handleModeChange(mode)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            px: 1.5, py: 1,
                            cursor: 'pointer',
                            bgcolor: isActive ? 'action.selected' : 'transparent',
                            borderBottom: i < 2 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Box sx={{
                            width: 14, height: 14, borderRadius: '50%',
                            border: `1.5px solid ${isActive ? '#2563EB' : 'text.disabled'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isActive && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563EB' }} />}
                          </Box>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: colors[i] }} />
                          <Typography sx={{ fontSize: '13px', color: 'text.primary', fontWeight: isActive ? 500 : 400 }}>
                            {labels[i]}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Red Alert Key & Report Button */}
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    fullWidth variant="contained" color="error" size="medium"
                    startIcon={<ShieldOutlinedIcon />}
                    onClick={handleEmergencyTrigger}
                    sx={{ fontWeight: 500, mb: 1 }}
                  >
                    Вызвать охрану
                  </Button>

                  <Button
                    fullWidth variant="outlined" size="medium"
                    startIcon={<ContentCopyOutlinedIcon />}
                    onClick={handleQuickReport}
                    sx={{
                      fontWeight: 500, mb: 1,
                      borderColor: 'divider', color: 'text.secondary',
                      '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'action.hover' },
                    }}
                  >
                    Скопировать отчёт
                  </Button>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Button variant="outlined" size="small" startIcon={<GridViewOutlinedIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontWeight: 500, borderColor: 'divider', color: 'text.secondary', fontSize: '12px' }}
                      onClick={() => navigate('/cameras/multiscreen')}>
                      Мультиэкран
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<SettingsOutlinedIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontWeight: 500, borderColor: 'divider', color: 'text.secondary', fontSize: '12px' }}
                      onClick={() => navigate('/settings')}>
                      Настройки
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Mode Settings dialog for chip click */}
      <Dialog 
        open={showModeDialog} 
        onClose={() => setShowModeDialog(false)}
        slotProps={{
          paper: {
            sx: {
              border: '0.5px solid',
              borderColor: 'divider',
              borderRadius: '12px',
            }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '15px', fontWeight: 500 }}>Выберите режим охраны</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Box sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {['WORK_DAY', 'AFTER_WORK', 'WEEKEND'].map((mode, i) => {
              const labels = ['Рабочий день', 'После работы', 'Выходной'];
              const colors = ['#27AE60', '#D97706', '#C62828'];
              const isActive = uiOfficeMode === mode;
              return (
                <Box
                  key={mode}
                  onClick={() => {
                    handleModeChange(mode);
                    setShowModeDialog(false);
                  }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 1.2,
                    cursor: 'pointer',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    borderBottom: i < 2 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `1.5px solid ${isActive ? '#2563EB' : 'text.disabled'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isActive && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563EB' }} />}
                  </Box>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: colors[i] }} />
                  <Typography sx={{ fontSize: '13px', color: 'text.primary', fontWeight: isActive ? 500 : 400 }}>
                    {labels[i]}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModeDialog(false)} size="small" sx={{ fontSize: '12px', color: 'text.secondary' }}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={toastOpen} 
        autoHideDuration={4000} 
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} variant="filled" sx={{ width: '100%', borderRadius: '8px' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
