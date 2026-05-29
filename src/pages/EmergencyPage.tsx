import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Lock, 
  Unlock, 
  RotateCcw
} from 'lucide-react';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsInputHdmiIcon from '@mui/icons-material/SettingsInputHdmi';

import { PageHeader } from '../components/common/PageHeader';
import { useOfficeStore } from '../store/officeStore';
import { useAuthStore } from '../store/authStore';

export const EmergencyPage: React.FC = () => {
  const theme = useTheme();
  const { isEmergency, emergencyType, triggerEmergency, resetEmergency } = useOfficeStore();
  const { user } = useAuthStore();

  const [authCancelOpen, setAuthCancelOpen] = useState(false);
  const [operatorPassword, setOperatorPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Toast feedback state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleTrigger = (type: 'fire' | 'intruder' | 'other') => {
    triggerEmergency(type === 'fire' ? 'fire' : 'other');
    
    let msg = 'Сигнал тревоги отправлен';
    if (type === 'fire') msg = 'Сигнал пожарной тревоги отправлен';
    if (type === 'intruder') msg = 'Сигнал охране отправлен';
    if (type === 'other') msg = 'Сигнал об утечке газа отправлен'; // or other simple

    setSnackbarMsg(msg);
    setSnackbarOpen(true);
  };

  const handleOpenCancel = () => {
    setOperatorPassword('');
    setAuthError(false);
    setAuthCancelOpen(true);
  };

  const handleConfirmCancel = () => {
    if (operatorPassword === '') {
      setAuthError(true);
      return;
    }
    resetEmergency();
    setAuthCancelOpen(false);
    setSnackbarMsg('Режим ЧС отменен');
    setSnackbarOpen(true);
  };

  const handleTestSiren = () => {
    setSnackbarMsg('Тест звукового сигнала на 3 секунды');
    setSnackbarOpen(true);
  };

  const handleTestValves = () => {
    setSnackbarMsg('Проверка электронных замков');
    setSnackbarOpen(true);
  };

  const getEmergencyTitle = () => {
    switch (emergencyType) {
      case 'fire': return 'Пожарная тревога';
      case 'other': return 'Режим ЧС активен';
      default: return 'Система работает штатно';
    }
  };

  const contacts = [
    { name: 'Служба спасения', number: '+993 112' },
    { name: 'Пожарная служба', number: '+993 101' },
    { name: 'Охрана',          number: '+993 12 46-00-00' },
  ];

  return (
    <Box>
      <PageHeader 
        title="Экстренные действия" 
        description="Быстрый вызов помощи и управление ЧС"
      />

      {isEmergency ? (
        <Card 
          sx={{ 
            mb: 4, 
            bgcolor: 'rgba(198, 40, 40, 0.08)', 
            border: '1px solid',
            borderColor: '#C62828',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 48, color: '#C62828' }} />
            </Box>

            <Typography variant="h4" sx={{ color: '#C62828', fontWeight: 600, letterSpacing: '-0.02em', mb: 1 }}>
              {getEmergencyTitle()}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600, maxWidth: 580, mx: 'auto', mb: 3.5 }}>
              Службы оповещены. Следуйте инструкции по эвакуации.
            </Typography>

            <Button 
              variant="contained" 
              color="success" 
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={handleOpenCancel}
              sx={{ py: 1.5, px: 4, fontWeight: 700, borderRadius: 2 }}
            >
              Отменить тревогу
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ p: 2, bgcolor: 'action.hover', color: 'success.main', borderRadius: '50%', display: 'flex' }}>
              <CheckCircleIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 500, color: 'success.main' }}>
                Система работает штатно
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Нет активных тревог
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Typography variant="h5" sx={{ fontWeight: 500, mb: 1.5 }}>Вызов помощи</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
        Выберите тип ЧС для отправки сигнала
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4.5 }}>
        
        <Box>
          <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: '#C62828' } }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(198, 40, 40, 0.1)', color: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>Пожар / Задымление</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                Оповещение пожарной службы и сирена эвакуации
              </Typography>
              <Button 
                fullWidth 
                variant="contained" 
                color="error" 
                size="medium"
                startIcon={<LocalFireDepartmentIcon />}
                onClick={() => handleTrigger('fire')}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Сообщить
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: '#E65100' } }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(230, 81, 0, 0.1)', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <ShieldIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>Проникновение / Кнопка охраны</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                Вызов охраны и фиксация на всех камерах
              </Typography>
              <Button 
                fullWidth 
                variant="contained" 
                color="error" 
                size="medium"
                startIcon={<ShieldIcon />}
                onClick={() => handleTrigger('intruder')}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Сообщить
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: '#E5E7EB' } }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(113, 128, 150, 0.1)', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <WarningAmberIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>Другая ЧС</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                Оповещение аварийной службы
              </Typography>
              <Button 
                fullWidth 
                variant="contained" 
                color="error" 
                size="medium"
                startIcon={<WarningAmberIcon />}
                onClick={() => handleTrigger('other')}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Сообщить
              </Button>
            </CardContent>
          </Card>
        </Box>

      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 1.5 }}>Тесты систем</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
              <Box sx={{ p: 2, bgcolor: 'background.default', color: 'primary.main', borderRadius: 2, mr: 2.5, display: 'flex' }}>
                <VolumeUpIcon />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Тестирование динамиков и сирен</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  Тест звукового сигнала на 3 секунды
                </Typography>
                <Button size="small" variant="outlined" onClick={handleTestSiren}>Проверить сирены</Button>
              </Box>
            </Card>

            <Card sx={{ display: 'flex', alignItems: 'center', p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
              <Box sx={{ p: 2, bgcolor: 'background.default', color: 'primary.main', borderRadius: 2, mr: 2.5, display: 'flex' }}>
                <SettingsInputHdmiIcon />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Электронные замки</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  Проверка электронных замков
                </Typography>
                <Button size="small" variant="outlined" onClick={handleTestValves}>Проверить замки</Button>
              </Box>
            </Card>
          </Box>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 1.5 }}>Контакты экстренных служб</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
            <Table size="medium">
              <TableBody>
                {contacts.map((contact, index) => (
                  <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{contact.name}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>{contact.number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <Dialog 
        open={authCancelOpen} 
        onClose={() => setAuthCancelOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', border: '0.5px solid', borderColor: 'divider' } } }}
      >
        <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>
          Сброс тревоги
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
            Для отмены режима ЧС подтвердите действие паролем администратора:
          </Typography>
          
          <TextField 
            label="Пароль" 
            variant="outlined" 
            type="password"
            fullWidth
            value={operatorPassword}
            onChange={(e) => {
              setOperatorPassword(e.target.value);
              setAuthError(false);
            }}
            error={authError}
            helperText={authError ? 'Поле обязательно для заполнения' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Button onClick={() => setAuthCancelOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleConfirmCancel}
            variant="contained" 
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Сбросить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default EmergencyPage;
