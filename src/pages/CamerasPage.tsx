import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  ToggleButtonGroup, 
  ToggleButton, 
  Button, 
  Typography,
  Snackbar,
  Alert,
  Skeleton
} from '@mui/material';
import { LayoutGrid, Maximize, Tv, Search } from 'lucide-react';

import { PageHeader } from '../components/common/PageHeader';
import { CameraCard } from '../components/Cameras/CameraCard';
import { CameraModal } from '../components/Cameras/CameraModal';
import { useOfficeStore } from '../store/officeStore';
import { useAuthStore } from '../store/authStore';
import { Camera } from '../types';

export const CamerasPage: React.FC = () => {
  const navigate = useNavigate();
  const { cameras, events } = useOfficeStore();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  
  // Grid layout column sizing
  // 6 = 2 columns, 4 = 3 columns, 3 = 4 columns
  const [gridSize, setGridSize] = useState<4 | 6 | 3>(4);

  // Selected camera details modal state
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Snackbar alerts
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // 800ms loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDetails = (camera: Camera) => {
    setSelectedCamera(camera);
    setModalOpen(true);
  };

  const handleCaptureSnapshot = (camera: Camera) => {
    setSnackbarMsg(`Снимок с камеры "${camera.name}" успешно сохранен.`);
    setSnackbarOpen(true);
  };

  const handleActionTriggered = (msg: string) => {
    // strip standard emoji prefix if details modal raises any
    const cleanMsg = msg.replace(/[^а-яА-Яa-zA-Z0-9\s.,?!"'()-:•]/g, '').trim();
    setSnackbarMsg(cleanMsg || msg);
    setSnackbarOpen(true);
  };

  const handleGridSizeChange = (
    event: React.MouseEvent<HTMLElement>,
    nextSize: number | null,
  ) => {
    if (nextSize !== null) {
      setGridSize(nextSize as 4 | 6 | 3);
    }
  };

  // Filtering cameras logic
  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch = 
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'online' && camera.status === 'online') ||
      (statusFilter === 'warning' && camera.status === 'alert') ||
      (statusFilter === 'offline' && camera.status === 'offline');
    
    const matchesArea = areaFilter === 'all' || camera.location.includes(areaFilter);

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Unique list of areas for filters
  const areas = Array.from(new Set(cameras.map((c) => c.location.split(' • ')[0] || c.location)));

  // Selected camera events list (filtered from general activity logs)
  const getCameraEvents = (cameraId: string) => {
    return events.filter((e) => e.location.includes(cameras.find(c => c.id === cameraId)?.location || ''));
  };

  const currentOpName = user?.name || 'Оператор Дежурный';

  return (
    <Box>
      <PageHeader 
        title="Камеры" 
        description="Видеонаблюдение и статус камер"
        action={
          <Button 
            variant="contained" 
            startIcon={<Tv size={16} />} 
            onClick={() => navigate('/cameras/multiscreen')}
            sx={{ bgcolor: 'primary.main', color: 'white', textTransform: 'none' }}
          >
            Включить мультиэкран
          </Button>
        }
      />

      {/* Top Controls Layout */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          mb: 3.5, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 3.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <TextField
          size="small"
          variant="outlined"
          placeholder="Поиск по названию или локации..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: <Search size={18} style={{ color: '#718096', marginRight: 8 }} />
            }
          }}
        />

        {/* Status filter selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Статус связи</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Статус связи"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Все статусы</MenuItem>
            <MenuItem value="online">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#2E7D32', borderRadius: '50%' }} />
                Активна
              </Box>
            </MenuItem>
            <MenuItem value="warning">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#F9A825', borderRadius: '50%' }} />
                Помехи / Логи
              </Box>
            </MenuItem>
            <MenuItem value="offline">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#C62828', borderRadius: '50%' }} />
                Нет сигнала
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Area filter selector */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="area-filter-label">Зона / Сектор</InputLabel>
          <Select
            labelId="area-filter-label"
            value={areaFilter}
            label="Зона / Сектор"
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <MenuItem value="all">Все помещения</MenuItem>
            {areas.map((area) => (
              <MenuItem key={area} value={area}>{area}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Grid controllers size switches */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={gridSize}
            exclusive
            onChange={handleGridSizeChange}
            aria-label="grid visual size"
            size="small"
            color="primary"
          >
            <ToggleButton value={6} aria-label="large grid 2 columns">
              <LayoutGrid size={16} />
            </ToggleButton>
            <ToggleButton value={4} aria-label="normal grid 3 columns">
              <Maximize size={16} style={{ rotate: '45deg' }} />
            </ToggleButton>
            <ToggleButton value={3} aria-label="4x4 grid">
              <Tv size={16} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Cameras grid rendering */}
      {isLoading ? (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: '1fr 1fr', 
              md: gridSize === 6 ? '1fr 1fr' : gridSize === 3 ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr' 
            }, 
            gap: 3 
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i}>
              <Skeleton variant="rounded" height={320} width="100%" sx={{ borderRadius: 3 }} />
            </Box>
          ))}
        </Box>
      ) : filteredCameras.length > 0 ? (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: '1fr 1fr', 
              md: gridSize === 6 ? '1fr 1fr' : gridSize === 3 ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr' 
            }, 
            gap: 3 
          }}
        >
          {filteredCameras.map((camera) => (
            <CameraCard 
              key={camera.id}
              camera={camera} 
              onOpenDetails={handleOpenDetails}
              onCaptureSnapshot={handleCaptureSnapshot}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ p: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Не зафиксировано камер, подходящих под текущие настройки фильтров.
          </Typography>
        </Box>
      )}

      {/* Details camera dialogue modal */}
      <CameraModal 
        camera={selectedCamera}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cameraEvents={selectedCamera ? getCameraEvents(selectedCamera.id) : []}
        onActionTriggered={handleActionTriggered}
      />

      {/* Toast Alert message panel */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
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
export default CamerasPage;
