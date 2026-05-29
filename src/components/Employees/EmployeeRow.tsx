import React from 'react';
import { TableRow, TableCell, Avatar, Box, Typography, Button } from '@mui/material';
import { Eye, ShieldAlert, StickyNote } from 'lucide-react';
import { Employee } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useUiStore } from '../../store/uiStore';

interface EmployeeRowProps {
  employee: Employee;
  isAdmin: boolean;
  onOpenDetails: (employee: Employee) => void;
}

export const EmployeeRow: React.FC<EmployeeRowProps> = ({ employee, isAdmin, onOpenDetails }) => {
  const { workSchedule } = useUiStore();

  const isLate = React.useMemo(() => {
    if (!employee.checkInTime || !workSchedule?.workStart) return false;
    return employee.checkInTime > workSchedule.workStart;
  }, [employee.checkInTime, workSchedule?.workStart]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F', '#AD1457', '#37474F'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'green': return '#2E7D32';
      case 'yellow': return '#F9A825';
      case 'red': return '#C62828';
      default: return '#718096';
    }
  };

  const hasNote = !!localStorage.getItem(`note_${employee.id}`);

  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'background.default' } }}>
      {/* 1. Employee Name & Avatar */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              bgcolor: getAvatarColor(employee.name), 
              fontSize: '0.85rem', 
              fontWeight: 600 
            }}
          >
            {getInitials(employee.name)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {employee.name}
              </Typography>
              {hasNote && (
                <StickyNote size={13} style={{ color: '#D97706' }} />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {employee.role}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* 2. Position */}
      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {employee.position}
      </TableCell>

      {/* 3. Status Chip */}
      <TableCell>
        <StatusBadge type="employee" status={employee.status} />
      </TableCell>

      {/* 4. CheckIn Time */}
      <TableCell sx={{ color: isLate ? '#EF4444' : 'text.primary', fontWeight: isLate ? 600 : 500 }}>
        {employee.checkInTime || '—'}
      </TableCell>

      {/* 5. Time Spent */}
      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {employee.timeSpent || '—'}
      </TableCell>

      {/* 6. Admin Only Activity Level */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              bgcolor: getActivityColor(employee.activityLevel)
            }} 
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>
            {employee.activityLevel === 'green' ? 'Высокая' : employee.activityLevel === 'yellow' ? 'Умеренная' : 'Низкая'}
          </Typography>
        </Box>
      </TableCell>

      {/* 7. Action Button */}
      <TableCell align="right">
        <Button 
          size="small" 
          variant="text" 
          startIcon={<Eye size={14} />} 
          onClick={() => onOpenDetails(employee)}
        >
          Подробнее
        </Button>
      </TableCell>
    </TableRow>
  );
};
export default EmployeeRow;
