import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

import { PageHeader } from '../components/common/PageHeader';
import { useOfficeStore } from '../store/officeStore';

interface Anomaly {
  id: string;
  type: 'late' | 'absent' | 'room' | 'camera' | 'overtime';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  time: string;
  action?: string;
}

export const AnomaliesPage: React.FC = () => {
  const navigate = useNavigate();
  const { employees, cameras, events } = useOfficeStore();

  const anomalies: Anomaly[] = [];

  // 1. Сотрудник не пришёл после 10:00
  employees.filter(e => !e.checkInTime).forEach(e => {
    anomalies.push({
      id: `absent-${e.id}`,
      type: 'absent',
      severity: 'medium',
      title: `${e.name} не появился`,
      description: `${e.position} — нет отметки о приходе`,
      time: 'Сегодня',
    });
  });

  // 2. Камера офлайн
  cameras.filter(c => c.status === 'offline').forEach(c => {
    anomalies.push({
      id: `cam-${c.id}`,
      type: 'camera',
      severity: 'high',
      title: 'Камера недоступна',
      description: `${c.name} — ${c.location}`,
      time: c.lastEventTime || 'Неизвестно',
      action: 'Перейти к камерам',
    });
  });

  // 3. Критические события не подтверждены
  events.filter(e => e.level === 'critical' && e.status === 'new').forEach(e => {
    anomalies.push({
      id: `evt-${e.id}`,
      type: 'room',
      severity: 'high',
      title: 'Необработанная тревога',
      description: `${e.name} — ${e.location}`,
      time: e.timestamp,
      action: 'Открыть событие',
    });
  });

  // Sort anomalies by severity: high -> medium -> low
  const severityWeight = { high: 3, medium: 2, low: 1 };
  anomalies.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

  const getSeverityColors = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return { color: '#DC2626' };
      case 'medium':
        return { color: '#D97706' };
      default:
        return { color: '#2563EB' };
    }
  };

  const handleActionClick = (actionText: string) => {
    if (actionText === 'Перейти к камерам') {
      navigate('/cameras');
    } else if (actionText === 'Открыть событие') {
      navigate('/events');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 0.5 }}>
      <PageHeader title="Отклонения" description="Требует внимания" />

      {anomalies.length === 0 ? (
        <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1.5 }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary' }}>
              Всё в порядке
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.5 }}>
              Отклонений не обнаружено
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '10px', overflow: 'hidden' }}>
          {anomalies.map((anomaly, idx) => {
            const { color } = getSeverityColors(anomaly.severity);
            return (
              <Box
                key={anomaly.id}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  px: 2, py: 1.5,
                  borderBottom: idx < anomalies.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary' }}>
                    {anomaly.title}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                    {anomaly.description}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary', flexShrink: 0 }}>
                  {anomaly.time}
                </Typography>
                {anomaly.action && (
                  <Button size="small" onClick={() => handleActionClick(anomaly.action!)} sx={{ ml: 1, fontSize: '11px', px: 1 }}>
                    {anomaly.action}
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default AnomaliesPage;
