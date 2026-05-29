import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { time: '08:00', people: 2 },
  { time: '09:00', people: 5 },
  { time: '10:00', people: 11 },
  { time: '11:00', people: 12 },
  { time: '12:00', people: 10 },
  { time: '13:00', people: 7 },
  { time: '14:00', people: 11 },
  { time: '15:00', people: 12 },
  { time: '16:00', people: 10 },
  { time: '17:00', people: 9 },
  { time: '18:00', people: 6 },
  { time: '19:00', people: 3 },
  { time: '20:00', people: 1 },
];

export const ActivityChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary' }}>
          Активность офиса
        </Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 1.5 }}>
          Сегодня по часам
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={theme.palette.mode === 'light' ? '#EBEBEB' : '#2A2D35'} 
              />
              <XAxis 
                dataKey="time" 
                stroke={theme.palette.text.secondary} 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={theme.palette.text.secondary} 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: 'none'
                }}
                labelStyle={{ fontWeight: 500 }}
              />
              <Area 
                type="monotone" 
                dataKey="people" 
                name="Сотрудников"
                stroke={theme.palette.primary.main} 
                strokeWidth={1.5}
                fillOpacity={0.08} 
                fill={theme.palette.primary.main} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
