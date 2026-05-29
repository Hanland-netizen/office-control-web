import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleToggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar - Desktop permanent, Mobile temporary */}
      <Sidebar isMobile={false} />
      <Sidebar 
        isMobile={true} 
        mobileOpen={mobileOpen} 
        onMobileClose={() => setMobileOpen(false)} 
      />

      {/* Main Content Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0, 
        }}
      >
        <TopBar onToggleMobileSidebar={handleToggleMobileSidebar} />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2.5, sm: 3.5 },
            overflowY: 'auto'
          }}
        >
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};
export default Layout;

