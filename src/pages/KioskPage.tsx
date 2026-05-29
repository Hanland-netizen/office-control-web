import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Divider, Button, Avatar, List, ListItem, ListItemText, ListItemAvatar, Chip } from '@mui/material';
import { useOfficeStore } from '../store/officeStore';
import PriorityIcon from '../components/common/PriorityIcon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const KioskPage: React.FC = () => {
  const { employees, events, officeMode } = useOfficeStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const inOfficeEmployees = employees.filter(e => e.status === 'active' || e.checkInTime);
  const recentEvents = events.slice(0, 5);
  const latestEvent = events[0];

  const handleExitKiosk = () => {
    window.close();
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0A0F1D', 
        color: '#F8FAFC', 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Top bar with back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 2s infinite' }} />
          <Typography sx={{ fontSize: '14px', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 600 }}>
            RECEPTION KIOSK DISPLAY
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleExitKiosk}
          sx={{ 
            color: '#94A3B8', 
            borderColor: '#334155',
            fontSize: '12px',
            '&:hover': {
              borderColor: '#475569',
              bgcolor: 'rgba(148, 163, 184, 0.05)'
            }
          }}
        >
          Выйти из режима
        </Button>
      </Box>

      {/* Main 3 columns layout */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr 1fr' }, 
          gap: 3, 
          my: 2 
        }}
      >
        {/* Column 1: Сейчас в офисе */}
        <Card sx={{ bgcolor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1.5, color: '#38BDF8' }}>
              Сейчас в офисе ({inOfficeEmployees.length})
            </Typography>
            <Divider sx={{ bgcolor: '#1F2937', mb: 1.5 }} />
            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '55vh' }}>
              {inOfficeEmployees.length === 0 ? (
                <Typography sx={{ color: '#64748B', fontSize: '13px', textAlign: 'center', mt: 4 }}>
                  В офисе никого нет
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {inOfficeEmployees.map((emp) => (
                    <ListItem 
                      key={emp.id} 
                      disableGutters 
                      sx={{ 
                        py: 1.2, 
                        borderBottom: '1px solid #1F2937',
                        '&:last-child': { border: 'none' } 
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar sx={{ bgcolor: '#2563EB', width: 32, height: 32, fontSize: '12px', fontWeight: 600 }}>
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#F1F5F9' }}>
                            {emp.name}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                            {emp.position}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
                          {emp.checkInTime || '09:00'}
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                          Пришёл
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Column 2: Clock & Date */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContext: 'center', alignItems: 'center', gap: 3, p: 2 }}>
          <Box sx={{ textAlign: 'center', my: 'auto' }}>
            {/* Clock */}
            <Typography 
              sx={{ 
                fontSize: { xs: '54px', sm: '76px' }, 
                fontWeight: 700, 
                fontFamily: 'JetBrains Mono, monospace', 
                color: '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '-2px'
              }}
            >
              {time.toLocaleTimeString('ru-RU')}
            </Typography>

            {/* Date */}
            <Typography sx={{ fontSize: '18px', color: '#94A3B8', mt: 1.5, fontWeight: 500 }}>
              {time.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>

            {/* Status indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 4 }}>
              <Chip 
                label={officeMode} 
                sx={{ 
                  bgcolor: officeMode.includes('Рабочий') ? '#047857' : officeMode.includes('После') ? '#B45309' : '#BE123C', 
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  px: 1
                }} 
              />
              <Chip 
                label="Сервер: Connected" 
                variant="outlined"
                sx={{ 
                  borderColor: '#334155', 
                  color: '#10B981',
                  fontWeight: 500,
                  fontSize: '13px'
                }} 
              />
            </Box>
          </Box>
        </Box>

        {/* Column 3: Последние события */}
        <Card sx={{ bgcolor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1.5, color: '#F43F5E' }}>
              Последние события (Журнал)
            </Typography>
            <Divider sx={{ bgcolor: '#1F2937', mb: 1.5 }} />
            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '55vh' }}>
              {recentEvents.length === 0 ? (
                <Typography sx={{ color: '#64748B', fontSize: '13px', textAlign: 'center', mt: 4 }}>
                  Событий пока нет
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentEvents.map((evt) => (
                    <ListItem 
                      key={evt.id} 
                      disableGutters 
                      sx={{ 
                        py: 1, 
                        px: 1,
                        mb: 1,
                        borderRadius: '6px',
                        bgcolor: evt.level === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(31, 41, 55, 0.5)',
                        borderBottom: '1px solid #1F2937',
                        borderLeft: `3px solid ${
                          evt.level === 'critical' ? '#EF4444' : 
                          evt.level === 'alert' ? '#F97316' : 
                          evt.level === 'warning' ? '#EAB308' : '#3B82F6'
                        }`
                      }}
                    >
                      <Box sx={{ mr: 1.5, ml: 0.5 }}>
                        <PriorityIcon priority={evt.level} size={18} />
                      </Box>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#F1F5F9' }}>
                            {evt.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
                            <Typography sx={{ fontSize: '10px', color: '#94A3B8' }}>
                              {evt.location}
                            </Typography>
                            <Typography sx={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
                              {evt.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bottom ticker running line */}
      <Box 
        sx={{ 
          bgcolor: '#1E293B', 
          border: '1px solid #334155', 
          borderRadius: '8px', 
          py: 1.5, 
          px: 3, 
          display: 'flex', 
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <Chip 
          label="ПОСЛЕДНЕЕ СОБЫТИЕ" 
          size="small"
          sx={{ 
            bgcolor: '#EF4444', 
            color: '#FFFFFF', 
            fontWeight: 700, 
            fontSize: '10px', 
            mr: 3,
            flexShrink: 0 
          }} 
        />
        {/* We use HTML standard marquee which is perfect for this requirement */}
        {React.createElement(
          'marquee',
          {
            scrollamount: '4',
            style: { color: '#F1F5F9', fontSize: '14px', fontWeight: 500 }
          },
          latestEvent 
            ? `[${latestEvent.timestamp}] ${latestEvent.name.toUpperCase()} • ${latestEvent.location.toUpperCase()} • ${latestEvent.description}`
            : 'В системе нет активных происшествий. Наблюдение ведётся в автономном режиме.'
        )}
      </Box>

      {/* Small style tag for animation pulse */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

export default KioskPage;
