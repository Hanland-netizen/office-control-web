import React from 'react';
import { Card, CardContent, CardActions, Typography, Box, Button, useTheme } from '@mui/material';
import { VideoOff, Eye, Play, Scan } from 'lucide-react';
import { Camera } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface CameraCardProps {
  camera: Camera;
  onOpenDetails: (camera: Camera) => void;
  onCaptureSnapshot: (camera: Camera) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({ 
  camera, 
  onOpenDetails, 
  onCaptureSnapshot 
}) => {
  const theme = useTheme();
  const isOnline = camera.status !== 'offline';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 1. Video stream layout */}
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 160, 
          bgcolor: isOnline ? '#0A0E17' : '#1E2530',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {isOnline ? (
          <>
            {/* Simple status badge */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 12, 
                left: 12, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.8,
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                px: 1,
                py: 0.3,
                borderRadius: 1
              }}
            >
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  bgcolor: '#2E7D32', 
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.65rem' }}>
                В эфире
              </Typography>
            </Box>

            {/* Resolution indicator right */}
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                zIndex: 10,
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.65rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                px: 1,
                py: 0.3,
                borderRadius: 1,
                fontFamily: 'monospace'
              }}
            >
              {camera.resolution}
            </Typography>

            {/* Detected indicator Center */}
            {camera.currentDetect && (
              <Box 
                sx={{ 
                  zIndex: 2, 
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  px: 1.2,
                  py: 0.5,
                  borderRadius: 1.5,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8
                }}
              >
                <Scan size={14} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                  Обнаружено: {camera.currentDetect}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'rgba(255,255,255,0.4)', gap: 1 }}>
            <VideoOff size={32} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Офлайн</Typography>
          </Box>
        )}
      </Box>

      {/* 2. Metadata description */}
      <CardContent sx={{ p: 2, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography sx={{ fontWeight: 500, fontSize: '14px', color: 'text.primary' }}>
            {camera.name}
          </Typography>
          <StatusBadge type="camera" status={camera.status} />
        </Box>
        
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
          {camera.location}
        </Typography>

        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
            Последнее событие:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }} noWrap>
              {camera.lastEvent || 'Нет событий'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, shrink: 0 }}>
              {camera.lastEventTime}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* 3. Card actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<Eye size={14} />}
          onClick={() => onOpenDetails(camera)}
          sx={{ flex: 1, mr: 1, py: 0.8 }}
        >
          Открыть
        </Button>
        <Button 
          size="small" 
          variant="text" 
          onClick={() => onCaptureSnapshot(camera)}
          disabled={!isOnline}
          sx={{ flex: 1, py: 0.8 }}
        >
          Снимок
        </Button>
      </CardActions>
    </Card>
  );
};
export default CameraCard;
