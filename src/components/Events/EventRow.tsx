import React from 'react';
import { TableRow, TableCell, Box, Typography, Button, useTheme } from '@mui/material';
import { ShieldCheck, FlameKindling, Info, AlertOctagon } from 'lucide-react';
import { OfficeEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityIcon } from '../common/PriorityIcon';

interface EventRowProps {
  event: OfficeEvent;
  onAcknowledge: (id: string) => void;
  onOpenDetails: (event: OfficeEvent) => void;
}

export const EventRow: React.FC<EventRowProps> = ({ event, onAcknowledge, onOpenDetails }) => {
  const theme = useTheme();
  const isCritical = event.level === 'critical';
  const isAlert = event.level === 'alert';
  const isNew = event.status === 'new';

  return (
    <TableRow 
      sx={{ 
        bgcolor: isCritical 
          ? 'rgba(198, 40, 40, 0.03)' 
          : isAlert 
            ? 'rgba(230, 81, 0, 0.02)' 
            : 'inherit',
        borderLeft: isCritical 
          ? '4px solid #C62828' 
          : isAlert 
            ? '4px solid #E65100' 
            : 'none',
        '&:hover': { bgcolor: 'background.default' }
      }}
    >
      {/* 1. Level Indicator */}
      <TableCell sx={{ pl: isCritical || isAlert ? 1.5 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PriorityIcon priority={event.level} size={18} />
        </Box>
      </TableCell>

      {/* 2. Timestamp */}
      <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
        {event.timestamp}
      </TableCell>

      {/* 3. Event Name & Description */}
      <TableCell sx={{ maxWidth: 320 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: isNew ? 700 : 500, 
            color: isCritical ? '#C62828' : 'text.primary',
            fontSize: '0.85rem'
          }}
        >
          {event.name}
        </Typography>
        <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
          {event.description}
        </Typography>
      </TableCell>

      {/* 4. Location */}
      <TableCell sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.82rem' }}>
        {event.location}
      </TableCell>

      {/* 5. Status Badge */}
      <TableCell>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <StatusBadge type="event" status={event.status} />
          {event.acknowledgedBy && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
              от: {event.acknowledgedBy}
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* 6. Actions */}
      <TableCell align="right">
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {isNew && (
            <Button 
              size="small" 
              variant="outlined" 
              color="success" 
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge(event.id);
              }}
              sx={{ py: 0.3, fontSize: '0.72rem', height: 26 }}
            >
              Ок
            </Button>
          )}
          <Button 
            size="small" 
            variant="text" 
            onClick={() => onOpenDetails(event)}
            sx={{ py: 0.3, fontSize: '0.72rem', height: 26 }}
          >
            Подробнее
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
};
export default EventRow;
