import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
    <Box>
      <Typography sx={{ fontSize: '17px', fontWeight: 500, color: 'text.primary' }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.3 }}>
          {description}
        </Typography>
      )}
    </Box>
    {action && (
      <Box sx={{ flexShrink: 0 }}>
        {action}
      </Box>
    )}
  </Box>
);

export default PageHeader;
