import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title, value, badge, badgeColor = 'text.secondary', onClick
}) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.15s',
      '&:hover': onClick ? { borderColor: 'primary.main' } : {},
    }}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: 1.5, fontWeight: 400 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography sx={{ fontSize: '28px', fontWeight: 500, color: 'text.primary', lineHeight: 1 }}>
          {value}
        </Typography>
        {badge && (
          <Typography sx={{ fontSize: '12px', color: badgeColor, fontWeight: 400 }}>
            {badge}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default MetricCard;
