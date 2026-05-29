import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Информация', value: 12, color: '#1565C0' },
  { name: 'Предупреждения', value: 5, color: '#F9A825' },
  { name: 'Тревоги', value: 2, color: '#E65100' },
  { name: 'Критические', value: 1, color: '#C62828' },
];

export const EventsPieChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary' }}>
          События по типу
        </Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 1.5 }}>
          За сегодня
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: 'none'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={10}
                formatter={(value, entry: any) => (
                  <span style={{ fontSize: '11px', color: theme.palette.text.primary, fontWeight: 500 }}>
                    {value}: {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventsPieChart;
