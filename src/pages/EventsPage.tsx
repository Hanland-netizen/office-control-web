import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  ToggleButton, 
  ToggleButtonGroup, 
  Skeleton, 
  Snackbar, 
  Alert,
  Typography,
  TablePagination,
  Drawer,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { 
  FileSpreadsheet, 
  Search, 
  Calendar,
  AlertOctagon,
  CheckCircle,
  Eye,
  ShieldAlert,
  Server,
  X,
  Bell,
  Activity,
  UserCheck
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EventRow } from '../components/Events/EventRow';
import { useOfficeStore } from '../store/officeStore';
import { useAuthStore } from '../store/authStore';
import { OfficeEvent } from '../types';

export const EventsPage: React.FC = () => {
  const { events, acknowledgeEvent, triggerEmergency } = useOfficeStore();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'alert' | 'warning' | 'info'>('all');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month'>('today');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Selected event side drawer (БЛОК 8)
  const [selectedEvent, setSelectedEvent] = useState<OfficeEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Toast feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'error' | 'warning'>('info');

  // Simulated Loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAcknowledge = (id: string) => {
    const opName = user?.name || 'Оператор Дежурный';
    acknowledgeEvent(id, opName);
    setSnackbarSeverity('success');
    setSnackbarMsg(`Событие #${id} успешно подтверждено и принято в работу.`);
    setSnackbarOpen(true);

    // If active in drawer, update view
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent(prev => prev ? { ...prev, acknowledged: true, acknowledgedBy: opName } : null);
    }
  };

  const handleOpenDetails = (evt: OfficeEvent) => {
    setSelectedEvent(evt);
    setDrawerOpen(true);
  };

  const handleExportExcel = () => {
    setSnackbarSeverity('success');
    setSnackbarMsg('Экспорт журнала запущен. Файл "office_safety_events.xlsx" скачивается...');
    setSnackbarOpen(true);
  };

  const handleEscalateChoice = (evt: OfficeEvent) => {
    triggerEmergency('other');
    setSnackbarSeverity('error');
    setSnackbarMsg(`ИНЦИДЕНТ "${evt.name}" ЭСКАЛИРОВАН! Вызвана группа быстрого реагирования (ГБР).`);
    setSnackbarOpen(true);
    setDrawerOpen(false);
  };

  const handleFalseAlarm = (evt: OfficeEvent) => {
    setSnackbarSeverity('warning');
    setSnackbarMsg(`Инцидент "${evt.name}" помечен оператором как ЛОЖНАЯ ТРЕВОГА.`);
    setSnackbarOpen(true);
    setDrawerOpen(false);
  };

  // Filtration logic
  const filteredEvents = events.filter((evt) => {
    const textLower = searchQuery.toLowerCase();
    const searchMatch = evt.name.toLowerCase().includes(textLower) || 
                        evt.description.toLowerCase().includes(textLower) ||
                        evt.location.toLowerCase().includes(textLower);
    if (!searchMatch) return false;

    if (severityFilter !== 'all') {
      if (evt.level !== severityFilter) return false;
    }

    if (zoneFilter !== 'all') {
      if (evt.zoneName !== zoneFilter && evt.cameraName !== zoneFilter && evt.location !== zoneFilter) return false;
    }

    if (periodFilter === 'today') {
      if (evt.timestamp.toLowerCase().includes('вчера')) return false;
    }

    return true;
  });

  // Unique zones
  const uniqueZones = ['Главный вход', 'Опен-спейс', 'Переговорные', 'Кухня', 'Серверная', 'Склад', 'Коридоры', 'Парковка'];

  // Pagination triggers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // БЛОК 8: Счётчики событий (Counters)
  const totalCount = events.length;
  const criticalCount = events.filter(e => e.level === 'critical').length;
  const unacknowledgedCount = events.filter(e => e.status !== 'acknowledged').length;

  return (
    <Box>
      <PageHeader 
        title="События" 
        description="Журнал событий и тревог"
        action={
          <Button 
            variant="outlined" 
            startIcon={<FileSpreadsheet size={16} />}
            onClick={handleExportExcel}
          >
            Экспорт в Excel
          </Button>
        }
      />

      {/* БЛОК 8: Панель счетчиков (Counters Panel) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2.5, mb: 3.5 }}>
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: '12px' }}>
          <Box sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.main', borderRadius: '8px', display: 'flex' }}>
            <Activity size={20} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Всего логов в системе</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{totalCount} записей</Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: '12px' }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(198,40,40,0.1)', color: '#C62828', borderRadius: '8px', display: 'flex' }}>
            <AlertOctagon size={20} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Критические инциденты</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#C62828' }}>{criticalCount} тревог</Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: '12px' }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(249,168,37,0.1)', color: '#D97706', borderRadius: '8px', display: 'flex' }}>
            <Bell size={20} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Ожидают подтверждения</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#D97706' }}>{unacknowledgedCount} событий</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Control Filters Area */}
      <Box 
        sx={{ 
          p: 2.5, 
          bgcolor: 'background.paper', 
          borderRadius: 3.5, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          mb: 3.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 3.5fr 3.5fr' }, gap: 2 }}>
          <Box>
            <TextField 
              fullWidth
              size="small"
              placeholder="Поиск по содержанию логов, локациям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: '#718096', marginRight: 8 }} />
                }
              }}
            />
          </Box>
          
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel id="severity-label">Уровень важности</InputLabel>
              <Select
                labelId="severity-label"
                value={severityFilter}
                label="Уровень важности"
                onChange={(e) => setSeverityFilter(e.target.value as any)}
              >
                <MenuItem value="all">Любой уровень</MenuItem>
                <MenuItem value="critical">Критические</MenuItem>
                <MenuItem value="alert">Тревоги</MenuItem>
                <MenuItem value="warning">Предупреждения</MenuItem>
                <MenuItem value="info">Информация</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth size="small">
              <InputLabel id="zone-filter-label">Зона / Камера</InputLabel>
              <Select
                labelId="zone-filter-label"
                value={zoneFilter}
                label="Зона / Камера"
                onChange={(e) => setZoneFilter(e.target.value)}
              >
                <MenuItem value="all">Все зоны офиса</MenuItem>
                {uniqueZones.map((z) => (
                  <MenuItem key={z} value={z}>{z}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 650 }}>Период:</Typography>
            <ToggleButtonGroup
              value={periodFilter}
              exclusive
              onChange={(e, val) => val && setPeriodFilter(val)}
              size="small"
            >
              <ToggleButton value="today">Сегодня</ToggleButton>
              <ToggleButton value="week">Эта неделя</ToggleButton>
              <ToggleButton value="month">Месяц</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Показано совпадений: {filteredEvents.length} из {events.length} логов
          </Typography>
        </Box>
      </Box>

      {/* Events table grid */}
      {isLoading ? (
        <Skeleton variant="rounded" height={400} width="100%" sx={{ borderRadius: 3.5 }} />
      ) : filteredEvents.length > 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500, width: 80, pl: 3 }}>Уровень</TableCell>
                  <TableCell sx={{ fontWeight: 500, width: 120 }}>Время</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Название лога</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Зона/Локация</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Статус</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500, pr: 3 }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((evt) => (
                    <EventRow 
                      key={evt.id} 
                      event={evt} 
                      onAcknowledge={handleAcknowledge}
                      onOpenDetails={handleOpenDetails}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredEvents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </Paper>
      ) : (
        <Box sx={{ p: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Не зафиксировано инцидентов по текущим условиям фильтрации во всем журнале.
          </Typography>
        </Box>
      )}

      {/* БЛОК 8: Боковая панель (Drawer) с деталями события вместо Dialog */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 460 }, borderLeft: 'none' } }}
      >
        {selectedEvent && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
            {/* Toolbar Header */}
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ShieldAlert size={20} style={{ color: selectedEvent.level === 'critical' ? '#C62828' : '#1565C0' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Детали инцидента
                </Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
                <X size={20} />
              </IconButton>
            </Box>

            {/* Scrollable contents */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              <Box sx={{ bgcolor: selectedEvent.level === 'critical' ? 'rgba(198,40,40,0.03)' : 'background.default', p: 2.5, borderRadius: '12px', border: '0.5px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Название лога:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: selectedEvent.level === 'critical' ? '#C62828' : 'text.primary', mt: 0.5 }}>
                  {selectedEvent.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.5 }}>
                  {selectedEvent.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Зафиксировано время</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEvent.timestamp}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Локация / Зона</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEvent.location || selectedEvent.zoneName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Камера видеопотока</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEvent.cameraName || 'Системный датчик'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Уровень важности</Typography>
                  <Chip 
                    label={selectedEvent.level === 'critical' ? 'Критично' : selectedEvent.level === 'alert' ? 'Тревога' : 'Предупреждение'} 
                    size="small" 
                    color={selectedEvent.level === 'critical' ? 'error' : selectedEvent.level === 'alert' ? 'warning' : 'primary'} 
                    sx={{ fontWeight: 600, height: 22 }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.2 }}>Снимок с камеры наблюдения:</Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 180, 
                    bgcolor: '#0B0F19', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(198, 40, 40, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(198, 40, 40, 0.04) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  
                  <Box sx={{ position: 'absolute', inset: '25% 30%', border: '1px dashed #C62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'white', bgcolor: '#C62828', px: 0.8, py: 0.1, fontWeight: 600, fontSize: '0.6rem', position: 'absolute', top: -14 }}>
                      ДЕТЕКЦИЯ
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.6)', px: 0.8, py: 0.2, borderRadius: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500, fontSize: '0.6rem' }}>
                      Камера: {selectedEvent.cameraName || 'SYSTEM_NODE'}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ zIndex: 1, color: '#C62828', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    [ Видеозапись заморожена ]
                  </Typography>
                </Box>
              </Box>

              {selectedEvent.status === 'acknowledged' ? (
                <Box sx={{ p: 2, bgcolor: 'rgba(46,125,50,0.05)', border: '1px solid rgba(46,125,50,0.15)', borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <UserCheck size={18} style={{ color: '#2E7D32' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Инцидент принят под контроль оператором: <b>{selectedEvent.acknowledgedBy || 'Оператор Дежурный'}</b>
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: 'rgba(237,137,54,0.05)', border: '1px solid rgba(237,137,54,0.15)', borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Bell size={18} style={{ color: '#D97706' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Данный инцидент еще не обработан и ожидает реакции дежурной смены.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Bottom panel actions (БЛОК 8) */}
            <Box sx={{ p: 2.5, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button 
                   onClick={() => handleFalseAlarm(selectedEvent)} 
                   variant="outlined" 
                   color="secondary"
                   sx={{ flex: 1 }}
                >
                  Ложная тревога
                </Button>
                <Button 
                   onClick={() => handleEscalateChoice(selectedEvent)} 
                   variant="contained" 
                   color="error"
                   sx={{ flex: 1 }}
                >
                  Эскалировать ГБР
                </Button>
              </Box>
              {selectedEvent.status !== 'acknowledged' && (
                <Button
                  onClick={() => handleAcknowledge(selectedEvent.id)}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ py: 1 }}
                >
                  Принять в работу
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default EventsPage;
