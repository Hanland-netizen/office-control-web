import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton, 
  CircularProgress,
  Alert
} from '@mui/material';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [serverAddr, setServerAddr] = useState('192.168.1.100:8080');
  const [loginVal, setLoginVal] = useState('admin');
  const [passwordVal, setPasswordVal] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (loginVal.trim() === '' || passwordVal.trim() === '' || serverAddr.trim() === '') {
      setErrorMessage('Пожалуйста, заполните все поля!');
      return;
    }

    try {
      const success = await login(loginVal, passwordVal, serverAddr);
      if (success) {
        navigate('/dashboard');
      } else {
        setErrorMessage('Не удалось выполнить вход во внутреннюю систему!');
      }
    } catch (err) {
      setErrorMessage('Внутренняя ошибка авторизации сервера.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Левая часть — форма */}
      <Box sx={{
        width: { xs: '100%', md: '420px' },
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        px: { xs: 4, md: 6 },
        bgcolor: 'background.paper',
        borderRight: { xs: 'none', md: '1px solid' }, 
        borderColor: 'divider',
      }}>
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
            Офис Контроль
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Войти в систему
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
          {errorMessage && (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 1.5, py: 0.5, px: 2, fontSize: '0.85rem' }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Адрес сервера"
            variant="outlined"
            fullWidth
            disabled={isLoading}
            value={serverAddr}
            onChange={(e) => setServerAddr(e.target.value)}
          />

          <TextField
            label="Логин"
            variant="outlined"
            fullWidth
            disabled={isLoading}
            value={loginVal}
            onChange={(e) => setLoginVal(e.target.value)}
            placeholder="Администратор или оператор"
          />

          <TextField
            label="Пароль"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            disabled={isLoading}
            value={passwordVal}
            onChange={(e) => setPasswordVal(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end" size="small">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
            disabled={isLoading}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              py: 1.5, 
              fontSize: '13px', 
              fontWeight: 500,
              borderRadius: '7px',
              boxShadow: 'none',
              mt: 1,
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Войти в систему'
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 5, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <ShieldCheck size={16} />
          <Typography sx={{ fontSize: '11px', fontWeight: 500 }}>
            Все данные хранятся на локальном сервере
          </Typography>
        </Box>
      </Box>

      {/* Правая часть — только на десктопе */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' },
        alignItems: 'center', justifyContent: 'center',
        bgcolor: 'background.default', flexDirection: 'column', gap: 2,
        p: 4
      }}>
        <Typography sx={{ fontSize: '20px', fontWeight: 500, color: 'text.primary', textAlign: 'center', maxWidth: 320 }}>
          Мониторинг офиса в реальном времени
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary', textAlign: 'center', maxWidth: 280, lineHeight: 1.7 }}>
          Камеры, сотрудники, безопасность — всё в одном месте. Данные хранятся на вашем сервере.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
