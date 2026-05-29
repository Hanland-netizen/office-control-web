import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Button, 
  Divider,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { Bell, Send, Mail, Radio, Key, Volume2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';

export const NotificationsPage: React.FC = () => {
  // Severity alerts
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyAlert, setNotifyAlert] = useState(true);
  const [notifyWarning, setNotifyWarning] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState(false);

  // Connection channels
  const [channelPush, setChannelPush] = useState(true);
  const [channelTelegram, setChannelTelegram] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);
  const [channelAudio, setChannelAudio] = useState(true);

  // Fields parameters
  const [telegramChatId, setTelegramChatId] = useState('-10019283746');
  const [recipientEmail, setRecipientEmail] = useState('novikov@officecontrol.ru');
  const [telegramToken, setTelegramToken] = useState('6283948293:AAGfD_mX_E3r1W...');

  // Toast feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info'>('success');

  const handleSaveSettings = () => {
    setSnackbarSeverity('success');
    setSnackbarMsg('Настройки оповещений успешно сохранены.');
    setSnackbarOpen(true);
  };

  const handleTestChannels = () => {
    setSnackbarSeverity('info');
    setSnackbarMsg('Отправка сигналов тестирования: проверьте Telegram и почтовый ящик!');
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <PageHeader 
        title="Уведомления" 
        description="Каналы оповещения"
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3.5, mb: 3.5 }}>
        
        {/* Left Side: Filter severity levels */}
        <Box>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bell size={18} style={{ color: '#1565C0' }} />
                Разрешенные триггеры
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                Укажите, при каких уровнях угроз система должна запускать внешнюю рассылку
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch checked={notifyCritical} onChange={(e) => setNotifyCritical(e.target.checked)} color="error" />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: '#C62828', borderRadius: '50%' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#C62828' }}>Критические инциденты (ЧС)</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>Пожар, протечка воды, несанкционированный взлом в нерабочее время</Typography>
                    </Box>
                  }
                />
                <Divider />

                <FormControlLabel
                  control={<Switch checked={notifyAlert} onChange={(e) => setNotifyAlert(e.target.checked)} color="warning" />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: '#E65100', borderRadius: '50%' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#E65100' }}>Тревоги</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>Подозрительные лица, драка, уход ключевых камер наблюдения в офлайн</Typography>
                    </Box>
                  }
                />
                <Divider />

                <FormControlLabel
                  control={<Switch checked={notifyWarning} onChange={(e) => setNotifyWarning(e.target.checked)} color="primary" />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: '#F9A825', borderRadius: '50%' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#F9A825' }}>Предупреждения</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>Забытый включенный свет, опоздание сотрудника, повышенная температура серверов</Typography>
                    </Box>
                  }
                />
                <Divider />

                <FormControlLabel
                  control={<Switch checked={notifyInfo} onChange={(e) => setNotifyInfo(e.target.checked)} />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: '#1565C0', borderRadius: '50%' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>Системные события</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>Обычный приход сотрудников, завершение планового обновления</Typography>
                    </Box>
                  }
                />
              </Box>

            </CardContent>
          </Card>
        </Box>

        {/* Right Side: Channels and setups */}
        <Box>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Radio size={18} style={{ color: '#1565C0' }} />
                Каналы информирования
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                Маршруты доставки сигналов дежурному оператору и руководству
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3.5 }}>
                <FormControlLabel
                  control={<Switch checked={channelPush} onChange={(e) => setChannelPush(e.target.checked)} />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Браузерные Push-уведомления</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Мгновенные всплывающие карточки на экране диспетчера</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={<Switch checked={channelTelegram} onChange={(e) => setChannelTelegram(e.target.checked)} />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Оповещения в Telegram</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Отправка фото и скриншотов нарушений в чат охраны</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={<Switch checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Сводные Email рассылки</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Каталог аналитических отчетов за день / неделю</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={<Switch checked={channelAudio} onChange={(e) => setChannelAudio(e.target.checked)} />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Звуковая сирена в веб-панели</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Проигрывание аварийного сигнала тревоги при критических событиях</Typography>
                    </Box>
                  }
                />
              </Box>

            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Channels coordinates fields inputs */}
      <Box>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 3 }}>Подключения</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <TextField 
                    label="Telegram Chat ID группы охраны" 
                    variant="outlined" 
                    fullWidth
                    disabled={!channelTelegram}
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <IconButton disabled={!channelTelegram} sx={{ p: 0, mr: 1 }}><Send size={16} /></IconButton>
                      }
                    }}
                  />
                </Box>

                <Box>
                  <TextField 
                    label="Email получателя инцидент-сводок" 
                    variant="outlined" 
                    fullWidth
                    disabled={!channelEmail}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <IconButton disabled={!channelEmail} sx={{ p: 0, mr: 1 }}><Mail size={16} /></IconButton>
                      }
                    }}
                  />
                </Box>

                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <TextField 
                    label="API Ключ Telegram Бота (секретный токен)" 
                    variant="outlined" 
                    type="password"
                    fullWidth
                    disabled={!channelTelegram}
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <IconButton disabled={!channelTelegram} sx={{ p: 0, mr: 1 }}><Key size={16} /></IconButton>
                      }
                    }}
                  />
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Box>

      {/* Main Trigger Actions footer */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', p: 1 }}>
        <Button 
          variant="outlined" 
          startIcon={<Volume2 size={16} />}
          onClick={handleTestChannels}
          sx={{ py: 1.2, px: 3, fontWeight: 700 }}
        >
          Тестировать каналы связи
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSaveSettings}
          sx={{ py: 1.2, px: 3.5, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}
        >
          Сохранить настройки
        </Button>
      </Box>

      {/* Snackbar Alerts */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default NotificationsPage;
