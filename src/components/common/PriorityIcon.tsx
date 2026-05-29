import React from 'react';
import { 
  Info as InfoIcon, 
  AlertTriangle as AlertIcon, 
  HelpCircle as QuestionIcon,
  XCircle as CriticalIcon,
  ShieldAlert as AlarmIcon
} from 'lucide-react';
import { Box } from '@mui/material';

interface PriorityIconProps {
  priority: 'info' | 'warning' | 'alert' | 'critical';
  size?: number;
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({ priority, size = 18 }) => {
  switch (priority) {
    case 'info':
      return <InfoIcon size={size} style={{ color: '#1565C0' }} />;
    case 'warning':
      return <AlertIcon size={size} style={{ color: '#F9A825' }} />;
    case 'alert':
      return <AlarmIcon size={size} style={{ color: '#E65100' }} />;
    case 'critical':
      return <CriticalIcon size={size} style={{ color: '#C62828' }} />;
    default:
      return <QuestionIcon size={size} style={{ color: '#718096' }} />;
  }
};
export default PriorityIcon;
