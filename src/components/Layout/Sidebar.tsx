import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  Avatar, 
  IconButton
} from '@mui/material';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

import { useAuthStore } from '../../store/authStore';
import { useOfficeStore } from '../../store/officeStore';

const drawerWidth = 200;

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose, isMobile = false }) => {
  const { user, logout } = useAuthStore();
  const { cameras, events, employees } = useOfficeStore();
  const navigate = useNavigate();

  const anomalyCount = cameras.filter(c => c.status === 'offline').length
    + events.filter(e => e.level === 'critical' && e.status === 'new').length
    + employees.filter(e => !e.checkInTime).length;

  const menuGroups = [
    {
      title: 'Основное',
      items: [
        { name: 'Главная', path: '/dashboard', icon: <HomeOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Камеры', path: '/cameras', icon: <VideocamOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Сотрудники', path: '/employees', icon: <PeopleOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'События', path: '/events', icon: <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Отклонения', path: '/anomalies', icon: <ErrorOutlineOutlinedIcon sx={{ fontSize: 16 }} /> },
      ],
    },
    {
      title: 'Управление',
      items: [
        { name: 'Зоны офиса', path: '/zones', icon: <MapOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Правила', path: '/rules', icon: <BoltOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Аналитика', path: '/analytics', icon: <BarChartOutlinedIcon sx={{ fontSize: 16 }} />, adminOnly: true },
      ],
    },
    {
      title: 'Система',
      items: [
        { name: 'Профиль', path: '/profile', icon: <PersonOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Уведомления', path: '/notifications', icon: <NotificationsOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Настройки', path: '/settings', icon: <SettingsOutlinedIcon sx={{ fontSize: 16 }} /> },
        { name: 'Экстренные действия', path: '/emergency', icon: <WhatshotOutlinedIcon sx={{ fontSize: 16 }} />, isEmergency: true },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Администратор';
      case 'Operator':
        return 'Оператор';
      default:
        return 'Наблюдатель';
    }
  };

  const currentRole = user?.role || 'Viewer';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'text.primary' }}>
          Офис Контроль
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5 }}>
        {menuGroups.map((group, groupIdx) => (
          <Box key={groupIdx}>
            {groupIdx > 0 && <Divider sx={{ my: 1, mx: 1.5 }} />}
            <List sx={{ py: 0, px: 1 }}>
              {group.items.map((item) => {
                if (item.adminOnly && currentRole !== 'Admin') {
                  return null;
                }

                return (
                  <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={NavLink}
                      to={item.path}
                      onClick={onMobileClose}
                      sx={() => ({
                        borderRadius: '8px',
                        py: 0.8,
                        px: 1.5,
                        color: 'text.secondary',
                        '&.active': {
                          color: 'primary.main',
                          bgcolor: 'action.selected',
                        },
                        '&:hover': { bgcolor: 'action.hover' },
                      })}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                        {React.cloneElement(item.icon as React.ReactElement<any>, { sx: { fontSize: 16 } })}
                      </ListItemIcon>
                      <ListItemText primary={
                        <Typography sx={{ fontSize: '13px', fontWeight: 'inherit', color: 'inherit' }}>
                          {item.name}
                        </Typography>
                      } />
                      {item.name === 'Отклонения' && anomalyCount > 0 && (
                        <Box sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 500,
                          px: 0.8,
                          py: 0.2,
                          borderRadius: '99px',
                          minWidth: 18,
                          textAlign: 'center',
                          lineHeight: '16px',
                        }}>
                          {anomalyCount}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      {user && (
        <Box sx={{
          p: 1.5,
          mx: 1,
          mb: 1,
          borderRadius: '10px',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}>
          {(() => {
            const colors = ['#2563EB','#7C3AED','#D97706','#16A34A','#DC2626'];
            const idx = (user.name.charCodeAt(0) || 0) % colors.length;
            return (
              <Avatar sx={{ width: 30, height: 30, fontSize: '11px', fontWeight: 500, bgcolor: colors[idx], color: '#FFFFFF' }}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
            );
          })()}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.primary' }} noWrap>
              {user.name}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: 'text.secondary' }} noWrap>
              {getRoleLabel(user.role)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
            <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
