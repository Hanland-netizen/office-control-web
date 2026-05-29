import React, { useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useUiStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { useOfficeStore } from './store/officeStore';
import { getAppTheme } from './theme';

// Sound and Notification utils
import { playCriticalAlert, playWarningBeep } from './utils/soundUtils';
import { sendBrowserNotification } from './utils/notificationUtils';

// Hotkeys hook
import { useHotkeys } from './hooks/useHotkeys';

// Layout structure
import { Layout } from './components/Layout/Layout';

// Pages components
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CamerasPage } from './pages/CamerasPage';
import { CamerasMultiscreenPage } from './pages/CamerasMultiscreenPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EventsPage } from './pages/EventsPage';
import { ZonesPage } from './pages/ZonesPage';
import { RulesPage } from './pages/RulesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { KioskPage } from './pages/KioskPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected routing wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <React.Fragment>{children}</React.Fragment>;
};

// Internal wrapper to hook hooks inside the Router context
const AppContent: React.FC = () => {
  useHotkeys();

  const events = useOfficeStore(s => s.events);
  const prevCountRef = useRef(events.length);

  useEffect(() => {
    if (events.length > prevCountRef.current) {
      const newest = events[0];
      if (newest) {
        if (newest.level === 'critical') {
          playCriticalAlert();
          sendBrowserNotification(newest.name, newest.description, newest.level);
        } else if (newest.level === 'alert') {
          playWarningBeep();
          sendBrowserNotification(newest.name, newest.description, newest.level);
        }
      }
      prevCountRef.current = events.length;
    }
  }, [events]);

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Fullscreen kiosk mode (reception) */}
      <Route 
        path="/kiosk" 
        element={
          <ProtectedRoute>
            <KioskPage />
          </ProtectedRoute>
        } 
      />

      {/* Secure Pages wrapped inside main layout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="cameras" element={<CamerasPage />} />
        <Route path="cameras/multiscreen" element={<CamerasMultiscreenPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="zones" element={<ZonesPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="anomalies" element={<AnomaliesPage />} />
      </Route>

      {/* Fallback to Login/Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  const { themeMode } = useUiStore();
  const theme = React.useMemo(() => getAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
