import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Switch, 
  FormControlLabel, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  useTheme,
  Snackbar,
  Alert,
  IconButton,
  ButtonGroup,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  ChevronDown, 
  Map, 
  Users, 
  Shield, 
  Monitor, 
  HelpCircle,
  Eye,
  Settings2,
  Lock,
  Plus,
  Minus,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { useOfficeStore } from '../store/officeStore';
import { Zone } from '../types';

export const ZonesPage: React.FC = () => {
  const theme = useTheme();
  const { zones, updateZoneMonitoring, updateZoneRules, updateZonePeopleCount } = useOfficeStore();

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit fields states
  const [editedWork, setEditedWork] = useState('');
  const [editedAfter, setEditedAfter] = useState('');
  const [editedWeekend, setEditedWeekend] = useState('');
  const [editedMaxCapacity, setEditedMaxCapacity] = useState('10');

  // Toast feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleMonitorChange = (zoneId: string, checked: boolean) => {
    updateZoneMonitoring(zoneId, checked);
    const zName = zones.find(z => z.id === zoneId)?.name || '';
    setSnackbarMsg(`Мониторинг в зоне "${zName}" ${checked ? 'активирован' : 'деактивирован'}.`);
    setSnackbarOpen(true);
  };

  const handleOpenEdit = (zone: Zone) => {
    setSelectedZone(zone);
    setEditedWork(zone.rules.workHours);
    setEditedAfter(zone.rules.afterHours);
    setEditedWeekend(zone.rules.weekend);
    setEditedMaxCapacity(String(zone.maxCapacity || 10));
    setEditModalOpen(true);
  };

  const handleSaveRules = () => {
    if (selectedZone) {
      // Rule saving
      updateZoneRules(selectedZone.id, editedWork, editedAfter, editedWeekend);
      
      // Update max capacity in local store zone state
      const capInt = parseInt(editedMaxCapacity) || 10;
      useOfficeStore.setState({
        zones: zones.map(z => z.id === selectedZone.id ? { ...z, maxCapacity: capInt } : z)
      });

      setSnackbarMsg(`Параметры и лимиты зоны "${selectedZone.name}" успешно закреплены.`);
      setSnackbarOpen(true);
      setEditModalOpen(false);
    }
  };

  const handleAdjustPeopleCount = (zoneId: string, delta: number) => {
    const cur = zones.find(z => z.id === zoneId)?.peopleCount || 0;
    const nextVal = Math.max(0, cur + delta);
    updateZonePeopleCount(zoneId, nextVal);
  };

  // Convert zone status to human, CSS color tokens
  const getZoneStatusDetails = (zone: Zone) => {
    const limit = zone.maxCapacity || 10;
    const isOverCapacity = zone.peopleCount > limit;

    if (isOverCapacity) {
      return { label: 'Превышен லிмиτ', color: '#D32F2F', bg: 'rgba(211, 47, 47, 0.12)', fill: '#D32F2F' };
    }

    switch (zone.status) {
      case 'normal':
        return { label: 'Норма', color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.12)', fill: '#2E7D32' };
      case 'motion':
        return { label: 'Движение', color: '#F9A825', bg: 'rgba(249, 168, 37, 0.12)', fill: '#F9A825' };
      case 'alert':
        return { label: 'Тревога!', color: '#E65100', bg: 'rgba(230, 81, 0, 0.12)', fill: '#E65100' };
      case 'empty':
        return { label: 'Пусто', color: '#718096', bg: 'rgba(113, 128, 150, 0.12)', fill: '#718096' };
      default:
        return { label: 'Норма', color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.12)', fill: '#2E7D32' };
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'public':
        return 'Общий доступ';
      case 'restricted':
        return 'Ограниченный';
      case 'high-security':
        return 'Строгий контроль';
      default:
        return 'Ограниченный';
    }
  };

  // БЛОК 9.2: История заполняемости зоны за день (Historical occupancy charts)
  const getZoneHistoryData = (zoneName: string) => {
    switch (zoneName) {
      case 'Главный вход':
        return [
          { hour: '08:00', people: 3 },
          { hour: '10:00', people: 11 },
          { hour: '12:00', people: 6 },
          { hour: '14:00', people: 8 },
          { hour: '16:00', people: 4 },
          { hour: '18:00', people: 12 },
        ];
      case 'Опен-спейс':
        return [
          { hour: '08:00', people: 5 },
          { hour: '10:00', people: 18 },
          { hour: '12:00', people: 22 },
          { hour: '14:00', people: 25 },
          { hour: '16:00', people: 19 },
          { hour: '18:00', people: 8 },
        ];
      case 'Серверная':
        return [
          { hour: '08:00', people: 0 },
          { hour: '10:00', people: 1 },
          { hour: '12:00', people: 1 },
          { hour: '14:00', people: 2 },
          { hour: '16:00', people: 0 },
          { hour: '18:00', people: 1 },
        ];
      default:
        return [
          { hour: '08:00', people: 1 },
          { hour: '10:00', people: 3 },
          { hour: '12:00', people: 4 },
          { hour: '14:00', people: 2 },
          { hour: '16:00', people: 5 },
          { hour: '18:00', people: 2 },
        ];
    }
  };

  return (
    <Box>
      <PageHeader
        title="Зоны офиса"
        description="Статус и правила мониторинга"
      />

      {/* 1. Visual SVG Floorplan Map */}
      <Card sx={{ mb: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', overflow: 'hidden', borderRadius: '12px' }}>
        <CardContent sx={{ p: 0, position: 'relative' }}>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Map size={18} style={{ color: '#1565C0' }} />
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>
                Интерактивный план зон
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, bgcolor: '#2E7D32', borderRadius: '50%'}} /><Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>Норма</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, bgcolor: '#F9A825', borderRadius: '50%'}} /><Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>Движение</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, bgcolor: '#C62828', borderRadius: '50%'}} /><Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>Тревога/Лимит</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, bgcolor: '#718096', borderRadius: '50%'}} /><Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>Пусто</Typography></Box>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 4 }, overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <svg 
              viewBox="0 0 800 450" 
              width="100%" 
              style={{ minWidth: 640, maxWidth: 800, height: 'auto', borderRadius: 4 }}
            >
              <rect width="800" height="450" fill="#F8FAFC" rx="8" />
              <rect x="10" y="10" width="780" height="430" fill="none" stroke="#CBD5E1" strokeWidth="2" opacity="0.6" />
              
              {zones.map((zone) => {
                const s = getZoneStatusDetails(zone);
                const coords = zone.svgCoords || { x: 50, y: 50, width: 100, height: 100 };
                const isSelected = selectedZone?.id === zone.id;

                return (
                  <g 
                    key={zone.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <rect 
                      x={coords.x} 
                      y={coords.y} 
                      width={coords.width} 
                      height={coords.height} 
                      fill={s.fill}
                      fillOpacity={isSelected ? 0.22 : 0.08}
                      stroke={isSelected ? '#1565C0' : s.fill}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={zone.monitoringActive ? 'none' : '4 4'}
                      rx="6"
                      style={{ transition: 'all 0.2s' }}
                    />
                    
                    <text 
                      x={coords.x + 12} 
                      y={coords.y + 24} 
                      fill="#1E293B" 
                      fontSize="11.5" 
                      fontWeight="700"
                    >
                      {zone.name}
                    </text>

                    <text 
                      x={coords.x + 12} 
                      y={coords.y + 44} 
                      fill={s.color} 
                      fontSize="10" 
                      fontWeight="bold"
                    >
                      {s.label} ({zone.peopleCount} чел.)
                    </text>

                    {zone.accessLevel === 'high-security' && (
                      <circle 
                        cx={coords.x + coords.width - 16} 
                        cy={coords.y + 16} 
                        r="6" 
                        fill="#C62828" 
                      />
                    )}
                  </g>
                );
              })}

              <text x="370" y="440" fill="rgba(0,0,0,0.3)" fontSize="10" fontWeight="700">Южный вход</text>
              <text x="375" y="24" fill="rgba(0,0,0,0.3)" fontSize="10" fontWeight="700">Северное крыло</text>
            </svg>
          </Box>
        </CardContent>
      </Card>

      {/* Zone selection feedback */}
      {selectedZone && (
        <Alert 
          severity={selectedZone.peopleCount > (selectedZone.maxCapacity || 10) ? 'error' : 'info'} 
          variant="outlined" 
          sx={{ mb: 3.5, borderRadius: 3, display: 'flex', alignItems: 'center' }}
          action={
            <Button size="small" variant="text" onClick={() => handleOpenEdit(selectedZone)}>
              Настроить директивы
            </Button>
          }
        >
          {selectedZone.peopleCount > (selectedZone.maxCapacity || 10) ? (
            <span><b>Внимание! Превышена вместимость в зоне {selectedZone.name}!</b> ({selectedZone.peopleCount} из {selectedZone.maxCapacity || 10} чел. max)</span>
          ) : (
            <span><b>Выбрана зона: {selectedZone.name}</b>. Нажмите кнопку справа или изучите параметры внизу.</span>
          )}
        </Alert>
      )}

      {/* 2. Detailed grid list */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {zones.map((zone) => {
          const s = getZoneStatusDetails(zone);
          const isSelected = selectedZone?.id === zone.id;
          const limit = zone.maxCapacity || 10;
          const isOverCapacity = zone.peopleCount > limit;
          const occupancyPercent = Math.min(100, Math.round((zone.peopleCount / limit) * 100));

          return (
            <Box key={zone.id}>
              <Card 
                sx={{ 
                  border: isSelected ? `2.5px solid #1565C0` : (isOverCapacity ? '2px solid #D32F2F' : '1px solid'),
                  borderColor: isSelected ? 'primary.main' : (isOverCapacity ? '#D32F2F' : 'divider'),
                  bgcolor: 'background.paper',
                  boxShadow: isSelected ? '0 4px 14px rgba(21, 101, 192, 0.1)' : 'none',
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  
                  {/* Title and Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Monitor size={18} style={{ color: isOverCapacity ? '#D32F2F' : '#1565C0' }} />
                        {zone.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                        Группа допуска: <b>{getAccessLevelLabel(zone.accessLevel)}</b>
                      </Typography>
                    </Box>

                    <Chip 
                      label={s.label} 
                      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 800, fontSize: '0.75rem', height: 26 }}
                    />
                  </Box>

                  {/* БЛОК 9.1: Люди в зоне и кнопки ручной корректировки (+/-) */}
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2.5, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" style={{ color: theme.palette.text.secondary, display: 'block' }}>Детекция (сейчас)</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.7 }}>
                        <Users size={15} color={isOverCapacity ? '#D32F2F' : '#1565C0'} />
                        {zone.peopleCount} / {limit} чел.
                      </Typography>
                    </Box>

                    {/* Button incrementors */}
                    <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleAdjustPeopleCount(zone.id, -1)}
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px 0 0 4px', p: 0.8 }}
                      >
                        <Minus size={14} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleAdjustPeopleCount(zone.id, 1)}
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '0 4px 4px 0', p: 0.8 }}
                      >
                        <Plus size={14} />
                      </IconButton>
                    </ButtonGroup>
                  </Box>

                  {/* БЛОК 9.3: Индикатор уровня заполненности (Threshold indicator) */}
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Заполненность лимита:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: isOverCapacity ? 'error.main' : 'text.primary' }}>{occupancyPercent}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, occupancyPercent)} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3, 
                        bgcolor: 'divider',
                        '& .MuiLinearProgress-bar': { bgcolor: isOverCapacity ? '#E53E3E' : (occupancyPercent > 80 ? '#F6AD55' : 'success.main') }
                      }} 
                    />
                    {isOverCapacity && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8, color: '#E53E3E' }}>
                        <AlertTriangle size={12} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>ПРЕВЫШЕН МАКСИМАЛЬНЫЙ ЛИМИТ ЗОНЫ!</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* БЛОК 9.2: График истории заполняемости за день */}
                  <Box sx={{ width: '100%', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, fontWeight: 700 }}>
                      <Clock size={12} /> ДИНАМИКА ПРИСУТСТВИЯ ЗА СЕГОДНЯ
                    </Typography>
                    <Box sx={{ width: '100%', height: 90, bgcolor: 'background.default', p: 1, borderRadius: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getZoneHistoryData(zone.name)} margin={{ top: 2, right: 5, left: -25, bottom: 0 }}>
                          <XAxis dataKey="hour" stroke={theme.palette.text.secondary} fontSize={8} tickLine={false} axisLine={false} />
                          <YAxis stroke={theme.palette.text.secondary} fontSize={8} tickLine={false} axisLine={false} allowDecimals={false} />
                          <ChartTooltip />
                          <Area type="monotone" dataKey="people" stroke={isOverCapacity ? '#E53E3E' : theme.palette.primary.main} fill={isOverCapacity ? 'rgba(229,62,62,0.1)' : 'rgba(21,101,192,0.1)'} strokeWidth={1.5} name="Человек" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>

                  {/* Active Toggler and Rules summary */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Мониторинг зоны активен:
                    </Typography>
                    <Switch 
                      checked={zone.monitoringActive}
                      onChange={(e) => handleMonitorChange(zone.id, e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  <Accordion disableGutters elevation={0} variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={14} />}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Посмотреть правила реагирования</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>В рабочие часы:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{zone.rules.workHours}</Typography>
                      </Box>
                      <Divider sx={{ my: 0.5 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>После окончания работы:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{zone.rules.afterHours}</Typography>
                      </Box>
                      <Divider sx={{ my: 0.5 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>В выходные дни:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{zone.rules.weekend}</Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Button 
                    fullWidth 
                    size="small"
                    variant="outlined" 
                    startIcon={<Settings2 size={14} />}
                    onClick={() => handleOpenEdit(zone)}
                  >
                    Редактировать зону
                  </Button>

                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Edit dialog */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '12px', border: '0.5px solid', borderColor: 'divider' } }
        }}
      >
        {selectedZone && (
          <React.Fragment>
            <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>
              Настройка зоны: {selectedZone.name}
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
              <TextField 
                label="Реакция (Рабочий день)" 
                variant="outlined" 
                fullWidth
                multiline
                rows={2}
                value={editedWork}
                onChange={(e) => setEditedWork(e.target.value)}
              />
              <TextField 
                label="Реакция (После работы)" 
                variant="outlined" 
                fullWidth
                multiline
                rows={2}
                value={editedAfter}
                onChange={(e) => setEditedAfter(e.target.value)}
              />
              <TextField 
                label="Реакция (Выходной)" 
                variant="outlined" 
                fullWidth
                multiline
                rows={2}
                value={editedWeekend}
                onChange={(e) => setEditedWeekend(e.target.value)}
              />
              <TextField 
                label="Максимальная вместимость (чел.)" 
                variant="outlined" 
                type="number"
                color="primary"
                fullWidth
                value={editedMaxCapacity}
                onChange={(e) => setEditedMaxCapacity(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
              <Button 
                onClick={handleSaveRules}
                variant="contained"
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              >
                Сохранить
              </Button>
            </DialogActions>
          </React.Fragment>
        )}
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
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
export default ZonesPage;
