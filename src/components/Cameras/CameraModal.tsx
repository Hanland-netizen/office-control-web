import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  useTheme,
  IconButton
} from '@mui/material';
import { Play, Download, X, Scan, Activity, Database, RefreshCw } from 'lucide-react';
import { Camera, OfficeEvent } from '../../types';
import PriorityIcon from '../common/PriorityIcon';

interface CameraModalProps {
  camera: Camera | null;
  open: boolean;
  onClose: () => void;
  cameraEvents: OfficeEvent[];
  onActionTriggered: (msg: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ 
  camera, 
  open, 
  onClose, 
  cameraEvents,
  onActionTriggered
}) => {
  const theme = useTheme();
  if (!camera) return null;

  const isOnline = camera.status !== 'offline';

  const handleOpenPlayer = () => {
    onActionTriggered(`Плеер запущен: подключение к ${camera.rtspUrl}`);
  };

  const handleDownloadSnapshot = () => {
    onActionTriggered(`Снимок с камеры "${camera.name}" успешно скачан в папку Загрузки.`);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '12px', border: '0.5px solid', borderColor: 'divider', overflow: 'hidden' } } }}
    >
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {camera.name}
          </Typography>
          <Chip 
            label={isOnline ? 'Активна' : 'Нет связи'} 
            color={isOnline ? 'success' : 'error'} 
            size="small" 
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' } }}>
          {/* Main Visual Stream Column */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box 
              sx={{ 
                width: '100%', 
                height: { xs: 200, sm: 320, md: '100%' }, 
                minHeight: { md: 360 },
                bgcolor: '#080C11',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isOnline ? (
                <>
                  {/* Flashing Dot */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      left: 16, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      zIndex: 10,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      px: 1.2,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        bgcolor: 'success.main', 
                        borderRadius: '50%',
                        animation: 'flash 1.2s infinite',
                        '@keyframes flash': { '0%': { opacity: 0.5 }, '50%': { opacity: 1 }, '100%': { opacity: 0.5 } }
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                      Прямой эфир
                    </Typography>
                  </Box>

                  {/* Tech indicators bottom left */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      left: 16, 
                      bgcolor: 'rgba(0,0,0,0.6)',
                      px: 1.2,
                      py: 0.8,
                      borderRadius: 1.5,
                      zIndex: 10,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', fontWeight: 500 }}>Параметры</Typography>
                    <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 600, mt: 0.2 }}>
                      {camera.resolution} • {camera.fps} FPS
                    </Typography>
                  </Box>

                  {/* Cyberpunk vector grid backdrop */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      inset: 0, 
                      backgroundImage: 'linear-gradient(rgba(21, 101, 192, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(21, 101, 192, 0.04) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }} 
                  />

                  {/* Dynamic target lock boxes */}
                  {camera.currentDetect && camera.currentDetect !== 'Нет активности' && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        border: '1px solid #D32F2F', 
                        width: '120px', 
                        height: '140px',
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 0.5,
                        zIndex: 5
                      }}
                    >
                      <Typography sx={{ color: 'white', bgcolor: '#D32F2F', px: 0.5, py: 0.1, fontSize: '0.55rem', fontWeight: 500, alignSelf: 'flex-start' }}>
                        Neural Lock
                      </Typography>
                      <Typography sx={{ color: '#D32F2F', fontSize: '0.6rem', fontWeight: 500, alignSelf: 'flex-end', fontFamily: 'monospace' }}>
                        98.4%
                      </Typography>
                    </Box>
                  )}

                  {/* Detections display bottom right */}
                  {camera.currentDetect && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 16, 
                        right: 16, 
                        bgcolor: 'primary.dark', 
                        px: 1.5, 
                        py: 0.8, 
                        borderRadius: 1.5, 
                        color: 'white', 
                        zIndex: 10,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.62rem', fontWeight: 500, display: 'block' }}>
                        Обнаружено:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                        {camera.currentDetect}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>Нет видеосигнала с этой камеры</Typography>
              )}
            </Box>
          </Box>

          {/* Details & Actions Column */}
          <Box sx={{ borderLeft: { md: '1px solid' }, borderColor: 'divider', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3 }}>
              {/* Tech details */}
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Технические характеристики
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
                <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>RTSP Поток</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2, fontFamily: 'monospace' }} noWrap>{camera.rtspUrl}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Разрешение</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2 }}>{camera.resolution}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Частота кадров</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2 }}>{camera.fps} FPS</Typography>
                </Box>
                <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Расположение</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2 }} noWrap>{camera.location}</Typography>
                </Box>
              </Box>

              {/* Event list */}
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Последние события ({cameraEvents.length})
              </Typography>
              {cameraEvents.length > 0 ? (
                <List sx={{ py: 0, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                  {cameraEvents.slice(0, 5).map((evt, idx) => (
                    <React.Fragment key={evt.id}>
                      <ListItem sx={{ py: 1.2, px: 2 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <PriorityIcon priority={evt.level} size={16} />
                        </ListItemIcon>
                        <ListItemText>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary' }}>
                            {evt.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {evt.timestamp} • {evt.description}
                          </Typography>
                        </ListItemText>
                      </ListItem>
                      {idx < 4 && idx < cameraEvents.length - 1 && <hr style={{ border: 'none', borderBottom: '1px solid', borderColor: theme.palette.divider, margin: 0 }} />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Нет зарегистрированных событий</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          variant="outlined" 
          startIcon={<Play size={16} />} 
          onClick={handleOpenPlayer}
          disabled={!isOnline}
        >
          Открыть в плеере
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Download size={16} />} 
          onClick={handleDownloadSnapshot}
          disabled={!isOnline}
        >
          Скачать снимок
        </Button>
        <Button onClick={onClose} variant="contained" sx={{ ml: 'auto' }}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default CameraModal;
