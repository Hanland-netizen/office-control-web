import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Chip, 
  Snackbar, 
  Alert,
  Divider
} from '@mui/material';
import { User as UserIcon, Lock, Shield, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuthStore } from '../store/authStore';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  // Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toast feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbarMsg(msg);
    setSnackbarType(type);
    setSnackbarOpen(true);
  };

  const handleResetPersonalInfo = () => {
    if (user) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '+7 (999) 123-45-67');
    }
  };

  useEffect(() => {
    handleResetPersonalInfo();
  }, [user]);

  const handleSavePersonalInfo = () => {
    if (!firstName.trim()) {
      showToast('Имя не может быть пустым', 'error');
      return;
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    updateUser({
      name: fullName,
      email: email.trim(),
      phone: phone.trim()
    });
    showToast('Данные сохранены', 'success');
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      showToast('Введите текущий пароль', 'error');
      return;
    }
    if (!newPassword || !confirmPassword) {
      showToast('Заполните поля нового пароля', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Новый пароль и его подтверждение не совпадают!', 'error');
      return;
    }
    showToast('Пароль успешно изменен!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Admin': return 'Администратор';
      case 'Operator': return 'Оператор';
      default: return 'Наблюдатель';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Личный кабинет"
        description="Просмотр и редактирование учетной записи"
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3.5, mt: 3 }}>
        {/* LEFT COLUMN: Personal Data & Security */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          
          {/* Section 1: Personal Data */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <UserIcon size={20} className="text-indigo-600" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Личные данные
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField 
                  label="Имя" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth 
                />
                <TextField 
                  label="Фамилия" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth 
                />
                <TextField 
                  label="Email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth 
                />
                <TextField 
                  label="Телефон" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth 
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleResetPersonalInfo}
                >
                  Отмена
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSavePersonalInfo}
                >
                  Сохранить
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Section 2: Security */}
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Lock size={20} className="text-amber-500" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Безопасность
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField 
                  label="Текущий пароль" 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth 
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  <TextField 
                    label="Новый пароль" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth 
                  />
                  <TextField 
                    label="Повторите новое пароль" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth 
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={handleChangePassword}
                >
                  Сменить пароль
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* RIGHT COLUMN: Roles and info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          
          {/* Section 3: Roles and permissions */}
          <Card sx={{ height: '100%', minHeight: 320 }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Shield size={20} className="text-emerald-600" />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Роль и доступ
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.8, fontWeight: 600 }}>
                      Уровень привилегий системы
                    </Typography>
                    <Chip 
                      label={getRoleLabel(user?.role || 'Viewer')} 
                      color="primary" 
                      variant="filled" 
                      sx={{ fontWeight: 700, px: 1, py: 0.5 }} 
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Идентификатор сессии
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                      {user?.id || 'не определен'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Дата последнего входа
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {user?.lastLogin || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Sparkles size={16} className="text-indigo-600" />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Администратор обладает полным доступом к настройкам пропусков сотрудников, правилам охранной сигнализации и конфигурированию камер.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarType} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
