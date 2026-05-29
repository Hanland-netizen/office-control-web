import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  ToggleButton, 
  ToggleButtonGroup, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Skeleton,
  TableSortLabel,
  LinearProgress,
  useTheme,
  Chip
} from '@mui/material';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Map, 
  Download, 
  FileText, 
  Mail, 
  LockKeyhole,
  Award
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuthStore } from '../store/authStore';
import { useOfficeStore } from '../store/officeStore';

interface EmployeeStat {
  name: string;
  daysActive: number;
  avgHours: number;
  avgCheckIn: string;
}

const initialEmpStats: EmployeeStat[] = [
  { name: 'Merdan Aşyrow', daysActive: 22, avgHours: 8.3, avgCheckIn: '09:02' },
  { name: 'Ogulgerek Durdyýewa', daysActive: 21, avgHours: 8.5, avgCheckIn: '08:46' },
  { name: 'Oraz Hydyrow', daysActive: 19, avgHours: 7.9, avgCheckIn: '09:40' },
  { name: 'Yhlas Dönmezow', daysActive: 18, avgHours: 7.1, avgCheckIn: '10:12' },
  { name: 'Gülnara Sähedowa', daysActive: 22, avgHours: 8.1, avgCheckIn: '09:08' },
  { name: 'Batyr Rejepow', daysActive: 26, avgHours: 12.0, avgCheckIn: '08:00' },
  { name: 'Aýgül Berdiýewa', daysActive: 20, avgHours: 8.0, avgCheckIn: '08:58' },
  { name: 'Leýli Annagylyjowa', daysActive: 22, avgHours: 8.1, avgCheckIn: '08:49' },
  { name: 'Serdar Myradow', daysActive: 20, avgHours: 9.1, avgCheckIn: '10:25' },
  { name: 'Nurgül Hojamämmedowa', daysActive: 21, avgHours: 8.2, avgCheckIn: '09:03' },
];

export const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { employees, cameras, events } = useOfficeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [reportOpen, setReportOpen] = useState(false);
  
  // Sorting states
  const [orderBy, setOrderBy] = useState<keyof EmployeeStat>('daysActive');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Report Form state
  const [reportFormat, setReportFormat] = useState('PDF');
  const [reportPeriod, setReportPeriod] = useState('month');

  // Toast notes
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRequestSort = (property: keyof EmployeeStat) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSendReport = () => {
    setReportOpen(false);
    setSnackbarMsg(`Отчет в формате ${reportFormat} за выбранный период успешно отправлен на email ${user?.email || 'novikov@officecontrol.ru'}!`);
    setSnackbarOpen(true);
  };

  const handleExportTable = () => {
    setSnackbarMsg('Экспорт таблицы статистики запущен. Файл "employee_analytics_data.xlsx" скачивается...');
    setSnackbarOpen(true);
  };

  // БЛОК 7.1: График опозданий (Lateness Graph)
  const latenessData = [
    { range: 'До 10 мин', count: 18 },
    { range: '10 - 20 мин', count: 11 },
    { range: '20 - 30 мин', count: 8 },
    { range: '30 - 60 мин', count: 5 },
    { range: 'Более 1 часа', count: 2 },
  ];

  // БЛОК 7.2: Сравнение этой недели с прошлой
  const weekOverWeekData = [
    { name: 'Пн', 'Текущая неделя': 92, 'Прошлая неделя': 86 },
    { name: 'Вт', 'Текущая неделя': 96, 'Прошлая неделя': 91 },
    { name: 'Ср', 'Текущая неделя': 89, 'Прошлая неделя': 90 },
    { name: 'Чт', 'Текущая неделя': 95, 'Прошлая неделя': 93 },
    { name: 'Пт', 'Текущая неделя': 88, 'Прошлая неделя': 84 },
  ];

  // БЛОК 7.3: Топ-3 зоны по числу событий (динамически считается)
  const topZones = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(evt => {
      const name = evt.zoneName || evt.location || 'Главный вход';
      counts[name] = (counts[name] || 0) + 1;
    });

    const items = Object.entries(counts).map(([name, count]) => ({ name, count }));
    items.sort((a,b) => b.count - a.count);

    if (items.length === 0) {
      // Fallback defaults
      return [
        { name: 'Тамбур главного входа', count: 18, percent: 90 },
        { name: 'Серверная №1', count: 12, percent: 60 },
        { name: 'Опен-спейс Юг', count: 5, percent: 25 },
      ];
    }

    const maxCount = items[0]?.count || 1;
    return items.slice(0, 3).map(it => ({
      name: it.name,
      count: it.count,
      percent: Math.min(100, Math.round((it.count / maxCount) * 100))
    }));
  }, [events]);

  // Mock static datasets
  const attendanceDaysData = [
    { day: 'Пн', people: 12 },
    { day: 'Вт', people: 11 },
    { day: 'Ср', people: 10 },
    { day: 'Чт', people: 13 },
    { day: 'Пт', people: 9 },
    { day: 'Сб', people: 2 },
    { day: 'Вс', people: 0 },
  ];

  const eventsPieData = [
    { name: 'Информация', value: 60, color: '#1565C0' },
    { name: 'Предупреждения', value: 25, color: '#F9A825' },
    { name: 'Тревоги', value: 10, color: '#E65100' },
    { name: 'Критические', value: 5, color: '#C62828' },
  ];

  const hourlyEventsData = [
    { hour: '06:00', count: 1 },
    { hour: '08:00', count: 4 },
    { hour: '10:00', count: 12 },
    { hour: '12:00', count: 5 },
    { hour: '14:00', count: 9 },
    { hour: '16:00', count: 6 },
    { hour: '18:00', count: 11 },
    { hour: '20:00', count: 3 },
    { hour: '22:00', count: 2 },
  ];

  const roomsUsageData = [
    { name: 'Переговорная А', value: 78 },
    { name: 'Переговорная Б', value: 45 },
    { name: 'Переговорная В', value: 23 },
  ];

  // Helper sorting function
  const sortedEmployeeStats = useMemo(() => {
    return [...initialEmpStats].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [order, orderBy]);

  if (!isAdmin) {
    return (
      <Box 
        sx={{ 
          minHeight: '60vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          px: 3 
        }}
      >
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(198,40,40,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C62828', mb: 3 }}>
          <LockKeyhole size={40} style={{ margin: 'auto' }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
          Доступ строго ограничен
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 440, mb: 3.5 }}>
          Данный раздел содержит закрытую кадровую и охранную аналитику предприятия. Раздел доступен только Администратору системы.
        </Typography>
        <Button variant="contained" href="/dashboard" sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Вернуться на Главную
        </Button>
      </Box>
    );
  }

  const periodLabel = period === 'today' ? 'за сегодня' : period === 'week' ? 'за неделю' : period === 'month' ? 'за месяц' : 'за квартал';

  return (
    <Box>
      <PageHeader 
        title="Аналитика" 
        description="Статистика и отчёты"
        action={
          <Button 
            variant="contained" 
            startIcon={<FileText size={16} />} 
            onClick={() => setReportOpen(true)}
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Сформировать отчёт
          </Button>
        }
      />

      {/* Period selection */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, p: 2, bgcolor: 'background.paper', borderRadius: 3.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>Период:</Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(e, val) => val && setPeriod(val)}
          size="small"
        >
          <ToggleButton value="today">Сегодня</ToggleButton>
          <ToggleButton value="week">Неделя</ToggleButton>
          <ToggleButton value="month">Месяц</ToggleButton>
          <ToggleButton value="quarter">Квартал</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            {[1,2,3,4].map((i) => (
              <Box key={i}>
                <Skeleton variant="rounded" height={90} width="100%" sx={{ borderRadius: 3 }} />
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <React.Fragment>
          {/* 1. Analytics Cards Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
            <Box>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(21,101,192,0.1)', color: 'primary.main', borderRadius: 2 }}><Clock size={20} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>По приходу (в среднем)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>09:12</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(46,125,50,0.1)', color: 'success.main', borderRadius: 2 }}><Clock size={20} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>По уходу (в среднем)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>18:34</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(249,168,37,0.1)', color: 'warning.main', borderRadius: 2 }}><Map size={20} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Топ-зона активности</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Опен-спейс</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(198,40,40,0.1)', color: 'error.main', borderRadius: 2 }}><ShieldAlert size={20} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Всего тревог за период</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>8 инцид.</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* 2. БЛОК 7 (Новые аналитические блоки): Grids of Lateness, WoW and Top 3 zones */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3.5, mb: 4.5 }}>
            
            {/* WoW comparison block */}
            <Box>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp size={18} color={theme.palette.primary.main} /> WoW-Динамика посещаемости
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Сравнение процента присутствия на этой неделе по отношению к прошлой
                  </Typography>
                  <Box sx={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weekOverWeekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={11} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={11} domain={[70, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Текущая неделя" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Прошлая неделя" stroke="#A0AEC0" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Lateness range analysis */}
            <Box>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={18} color="#C62828" /> Распределение опозданий
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Классификация опозданий сотрудников по величине задержки (кол-во раз)
                  </Typography>
                  <Box sx={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={latenessData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="range" stroke={theme.palette.text.secondary} fontSize={11} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#E53E3E" radius={[4, 4, 0, 0]} name="Количество опозданий" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Top 3 zones by security events */}
          <Box sx={{ mb: 4.5 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Award size={18} color={theme.palette.warning.main} /> Топ-3 зоны по числу событий безопасности
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                  Наиболее загруженные точки контроля по сумме зафиксированных заходов и инцидентов
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
                  {topZones.map((z, idx) => (
                    <Box key={z.name}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            #{idx + 1} {z.name}
                          </Typography>
                          <Chip label={`${z.count} соб.`} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={z.percent} 
                          sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: idx === 0 ? 'error.main' : idx === 1 ? 'warning.main' : 'primary.main' } }} 
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, textAlign: 'right' }}>
                          {z.percent}% от пика нагрузки
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* 3. Existing Charts Grid 2x2 layout */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4.5 }}>
            <Box>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Посещаемость по дням</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Среднее количество сотрудников в офисе по будням {periodLabel}
                  </Typography>
                  <Box sx={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceDaysData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="day" stroke={theme.palette.text.secondary} fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="people" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} name="Сотрудников" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Распределение событий</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Доля важности инцидентов (%) {periodLabel}
                  </Typography>
                  <Box sx={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={eventsPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                          {eventsPieData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: '11px', color: theme.palette.text.primary }}>{val}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Активность по часам</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Плотность совершения инцидентов и движений {periodLabel}
                  </Typography>
                  <Box sx={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hourlyEventsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="hour" stroke={theme.palette.text.secondary} fontSize={11} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={11} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#E65100" strokeWidth={2.5} name="Инцидентов" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Использование переговорных</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Процентная загрузка комнат за выбранное время {periodLabel}
                  </Typography>
                  <Box sx={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={roomsUsageData} margin={{ left: 30, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                        <XAxis type="number" stroke={theme.palette.text.secondary} fontSize={11} domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2E7D32" radius={[0, 4, 4, 0]} name="Загруженность (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>Сводка посещаемости сотрудников</Typography>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<Download size={14} />} 
              onClick={handleExportTable}
            >
              Выгрузить таблицу
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500, pl: 3 }}>
                    Имя сотрудника
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <TableSortLabel
                      active={orderBy === 'daysActive'}
                      direction={order}
                      onClick={() => handleRequestSort('daysActive')}
                    >
                      Дней в офисе
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <TableSortLabel
                      active={orderBy === 'avgHours'}
                      direction={order}
                      onClick={() => handleRequestSort('avgHours')}
                    >
                      Ср. часов в день
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    Ср. время прихода
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedEmployeeStats.map((stat, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'background.default' } }}>
                    <TableCell sx={{ pl: 3, fontWeight: 600 }}>{stat.name}</TableCell>
                    <TableCell>{stat.daysActive} дн.</TableCell>
                    <TableCell>{stat.avgHours} ч</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{stat.avgCheckIn}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </React.Fragment>
      )}

      <Dialog 
        open={reportOpen} 
        onClose={() => setReportOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', border: '0.5px solid', borderColor: 'divider' } } }}
      >
        <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>
          Сформировать отчёт
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          
          <FormControl fullWidth>
            <InputLabel id="format-select-label">Формат файла</InputLabel>
            <Select
              labelId="format-select-label"
              value={reportFormat}
              label="Формат файла"
              onChange={(e) => setReportFormat(e.target.value)}
            >
              <MenuItem value="PDF">PDF Документ (Сводные графики)</MenuItem>
              <MenuItem value="Excel">Microsoft Excel (Кадровые таблицы)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="period-select-label">Глубина выборки</InputLabel>
            <Select
              labelId="period-select-label"
              value={reportPeriod}
              label="Глубина выборки"
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <MenuItem value="week">За текущую неделю</MenuItem>
              <MenuItem value="month">За прошедший месяц</MenuItem>
              <MenuItem value="quarter">За текущий квартал (3 мес)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2, border: '1px border', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mail size={16} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Отчет будет отправлен на подтвержденный email администратора: <b>{user?.email}</b>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Button onClick={() => setReportOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleSendReport}
            variant="contained" 
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Отправить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snack alert alerts */}
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
export default AnalyticsPage;
