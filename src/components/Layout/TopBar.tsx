import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Badge, 
  Avatar, 
  Tooltip,
  Menu as MuiMenu,
  MenuItem,
  Divider
} from '@mui/material';
import { Menu as MenuIcon, Sun, Moon, Bell, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useOfficeStore } from '../../store/officeStore';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

interface TopBarProps {
  onToggleMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileSidebar }) => {
  const { officeMode, events, isEmergency } = useOfficeStore();
  const { themeMode, toggleTheme } = useUiStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Главная';
      case '/cameras':
        return 'Камеры';
      case '/cameras/multiscreen':
        return 'Мультиэкран';
      case '/employees':
        return 'Сотрудники';
      case '/events':
        return 'События';
      case '/zones':
        return 'Зоны офиса';
      case '/rules':
        return 'Правила автоматизации';
      case '/analytics':
        return 'Аналитика';
      case '/notifications':
        return 'Уведомления';
      case '/settings':
        return 'Настройки';
      case '/emergency':
        return 'Экстренные действия';
      default:
        return 'Главная';
    }
  };

  const newEventCount = events.filter((e) => e.status === 'new').length;

  const getCleanOfficeMode = (mode: string) => {
    if (mode.includes('Рабочий')) return { text: 'Рабочий день', color: '#27AE60' };
    if (mode.includes('После')) return { text: 'После работы', color: '#D97706' };
    if (mode.includes('Выходной')) return { text: 'Выходной день', color: '#C62828' };
    return { text: mode, color: '#888888' };
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onToggleMobileSidebar}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon size={22} />
          </IconButton>
          <Typography sx={{ fontWeight: 400, fontSize: '15px', color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
            {getPageTitle(location.pathname)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEmergency ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main' }} />
              <Typography sx={{ fontSize: '13px', color: 'error.main', fontWeight: 500 }}>
                Режим ЧС активен
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getCleanOfficeMode(officeMode).color }} />
              <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
                {getCleanOfficeMode(officeMode).text}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Tooltip title={themeMode === 'light' ? 'Тёмная тема' : 'Светлая тема'} arrow>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Новые события" arrow>
            <IconButton color="inherit" href="/events" size="small">
              <Badge badgeContent={newEventCount} color="error" overlap="circular">
                <Bell size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          {user && (
            <>
              <Tooltip title={user.name} arrow>
                <Avatar 
                  onClick={handleAvatarClick}
                  sx={{ 
                    width: 34, 
                    height: 34, 
                    bgcolor: 'primary.main', 
                    fontSize: '0.8rem', 
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {user.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Tooltip>
              <MuiMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      minWidth: 220,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                    {user.role === 'Admin' ? 'Администратор' : user.role === 'Operator' ? 'Оператор' : 'Наблюдатель'}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => handleNavigate('/profile')} sx={{ gap: 1.5, py:1 }}>
                  <UserIcon size={16} />
                  Личный кабинет
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/settings')} sx={{ gap: 1.5, py:1 }}>
                  <Settings size={16} />
                  Настройки
                </MenuItem>
                <MenuItem onClick={() => { toggleTheme(); handleClose(); }} sx={{ gap: 1.5, py:1 }}>
                  {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  {themeMode === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={() => { logout(); handleClose(); }} 
                  sx={{ gap: 1.5, py: 1, color: 'error.main', '&:hover': { bgcolor: 'rgba(218, 54, 51, 0.08)' } }}
                >
                  <LogOut size={16} />
                  Выйти
                </MenuItem>
              </MuiMenu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
