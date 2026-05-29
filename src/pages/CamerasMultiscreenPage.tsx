import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  ToggleButton, 
  ToggleButtonGroup,
  useTheme
} from '@mui/material';
import { ArrowLeft, Maximize2, Minimize2, Video, Grid3X3, LayoutGrid } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useOfficeStore } from '../store/officeStore';

export const CamerasMultiscreenPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { cameras } = useOfficeStore();

  const [isFullscreenSimulated, setIsFullscreenSimulated] = useState(false);
  const [columnsCount, setColumnsCount] = useState<6 | 4>(4); // Grid dimensions: 6 = 2 columns (2x2), 4 = 3 columns (3x3)

  const onlineCameras = cameras.filter((cam) => cam.status !== 'offline');

  const handleToggleFullscreen = () => {
    setIsFullscreenSimulated(!isFullscreenSimulated);
  };

  const handleToggleColumns = (event: any, nextVal: number | null) => {
    if (nextVal !== null) {
      setColumnsCount(nextVal as any);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenSimulated) {
        setIsFullscreenSimulated(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenSimulated]);

  // Combined video element
  const renderCamsMatrix = () => (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: columnsCount === 6 ? { xs: '1fr', sm: '1fr 1fr' } : { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
        gap: 1.5, 
        bgcolor: '#000000', 
        p: 1.5, 
        borderRadius: isFullscreenSimulated ? 0 : 3 
      }}
    >
      {onlineCameras.map((cam) => (
        <Box key={cam.id}>
          <Box 
            sx={{ 
              position: 'relative', 
              width: '100%', 
              paddingTop: '56.25%', // 16:9 Aspect Ratio
              bgcolor: '#090D14',
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid #1E293B'
            }}
          >
            {/* Simulation Canvas Overlay */}
            <Box 
              sx={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              {/* Pulsing indicator */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  left: 8, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5, 
                  bgcolor: 'rgba(0,0,0,0.6)', 
                  px: 0.8, 
                  py: 0.3, 
                  borderRadius: 1 
                }}
              >
                <Box 
                  sx={{ 
                    width: 6, 
                    height: 6, 
                    bgcolor: '#2E7D32', 
                    borderRadius: '50%', 
                    animation: 'flash-dot 1.5s infinite',
                    '@keyframes flash-dot': { '0%': { opacity: 0.4 }, '50%': { opacity: 1 }, '100%': { opacity: 0.4 } }
                  }} 
                />
                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.62rem', fontWeight: 700 }}>
                  {cam.name} • В эфире
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ position: 'absolute', top: 8, right: 8, color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>
                {cam.resolution}
              </Typography>

              {cam.currentDetect && (
                <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.65)', borderRadius: 1.5, textAlign: 'center', position: 'absolute', bottom: 8, left: 8 }}>
                  <Typography variant="body2" sx={{ color: 'white', fontSize: '0.72rem', fontWeight: 600 }}>Обнаружено: {cam.currentDetect}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box>
      {/* Immersive simulated Fullscreen container block */}
      {isFullscreenSimulated ? (
        <Box 
          sx={{ 
            position: 'fixed', 
            inset: 0, 
            bgcolor: '#000000', 
            zIndex: 9999, 
            display: 'flex', 
            flexDirection: 'column', 
            p: 2,
            overflowY: 'auto'
          }}
        >
          {/* Header controls inside fullscreen */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Video size={18} style={{ color: '#ffffff' }} />
              <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Панель камер: Режим полного экрана
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup
                value={columnsCount}
                exclusive
                onChange={handleToggleColumns}
                size="small"
                sx={{ bgcolor: '#1E293B', borderRadius: 1.5, '& .MuiToggleButton-root': { color: '#94A3B8', border: 'none', px: 1.5, py: 0.5, '&.Mui-selected': { color: 'white', bgcolor: '#334155' } } }}
              >
                <ToggleButton value={6} aria-label="2 columns">
                  <LayoutGrid size={14} />
                </ToggleButton>
                <ToggleButton value={4} aria-label="3 columns">
                  <Grid3X3 size={14} />
                </ToggleButton>
              </ToggleButtonGroup>

              <Button 
                variant="outlined" 
                color="inherit"
                startIcon={<Minimize2 size={16} />}
                onClick={handleToggleFullscreen}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
              >
                Выйти
              </Button>
            </Box>
          </Box>

          {/* Matrix render */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              {renderCamsMatrix()}
            </Box>
          </Box>
          
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', mt: 1.5 }}>
            Подсказка: Для быстрого возврата нажмите кнопку ESC или кликните Выйти.
          </Typography>
        </Box>
      ) : (
        // Standard non-fullscreen wrapped layout
        <Box>
          <PageHeader 
            title="Мультиэкран" 
            description="Видеонаблюдение со всех камер на одном экране."
            action={
              <Button 
                variant="outlined" 
                startIcon={<ArrowLeft size={16} />} 
                onClick={() => navigate('/cameras')}
              >
                Вернуться к списку
              </Button>
            }
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, p: 2, bgcolor: 'background.paper', borderRadius: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Video size={18} style={{ color: theme.palette.primary.main }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Активных онлайн потоков: {onlineCameras.length}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup
                value={columnsCount}
                exclusive
                onChange={handleToggleColumns}
                size="small"
              >
                <ToggleButton value={6} aria-label="2 columns">
                  <LayoutGrid size={16} />
                </ToggleButton>
                <ToggleButton value={4} aria-label="3 columns">
                  <Grid3X3 size={16} />
                </ToggleButton>
              </ToggleButtonGroup>

              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Maximize2 size={16} />} 
                onClick={handleToggleFullscreen}
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              >
                Полный экран
              </Button>
            </Box>
          </Box>

          {/* Core Grid Matrix */}
          {renderCamsMatrix()}
        </Box>
      )}
    </Box>
  );
};
export default CamerasMultiscreenPage;
