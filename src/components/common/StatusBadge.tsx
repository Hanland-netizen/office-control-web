import React from 'react';
import { Chip } from '@mui/material';

interface StatusBadgeProps {
  type: 'employee' | 'camera' | 'event';
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  if (type === 'employee') {
    switch (status) {
      case 'active':
        return (
          <Chip 
            label="В офисе" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(46, 125, 50, 0.12)', 
              color: '#2E7D32',
              fontWeight: 600,
              fontSize: '0.75rem'
            }} 
          />
        );
      case 'break':
        return (
          <Chip 
            label="Перерыв" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(249, 168, 37, 0.12)', 
              color: '#F9A825',
              fontWeight: 600,
              fontSize: '0.75rem'
            }} 
          />
        );
      case 'absent':
        return (
          <Chip 
            label="Отсутствует" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(113, 128, 150, 0.12)', 
              color: '#718096',
              fontWeight: 600,
              fontSize: '0.75rem'
            }} 
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  }

  if (type === 'camera') {
    switch (status) {
      case 'online':
        return (
          <Chip 
            label="Онлайн" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(46, 125, 50, 0.12)', 
              color: '#2E7D32',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 20
            }} 
          />
        );
      case 'offline':
        return (
          <Chip 
            label="Офлайн" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(198, 40, 40, 0.12)', 
              color: '#C62828',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 20
            }} 
          />
        );
      case 'alert':
        return (
          <Chip 
            label="Тревога" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(230, 81, 0, 0.12)', 
              color: '#E65100',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 20
            }} 
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  }

  if (type === 'event') {
    switch (status) {
      case 'new':
        return (
          <Chip 
            label="Новое" 
            color="error" 
            size="small" 
            sx={{ fontWeight: 600, fontSize: '0.72rem', height: 20 }} 
          />
        );
      case 'acknowledged':
        return (
          <Chip 
            label="Подтверждено" 
            color="success" 
            variant="outlined" 
            size="small" 
            sx={{ fontWeight: 600, fontSize: '0.72rem', height: 20 }} 
          />
        );
      case 'ignored':
        return (
          <Chip 
            label="Игнорировано" 
            color="default" 
            variant="outlined" 
            size="small" 
            sx={{ fontWeight: 600, fontSize: '0.72rem', height: 20 }} 
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  }

  return null;
};
export default StatusBadge;
