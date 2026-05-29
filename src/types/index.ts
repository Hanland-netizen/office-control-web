export interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'absent' | 'break'; // 'В офисе', 'Отсутствует', 'Перерыв'
  checkInTime?: string;
  timeSpent?: string;
  activityLevel: 'green' | 'yellow' | 'red'; // Active status indicator
  avatarUrl?: string;
  role: string;
  visitsHistory?: VisitHistoryItem[];
  attendanceHistory?: { day: string; hours: number }[];
  department?: string;
  email?: string;
  phone?: string;
}

export interface VisitHistoryItem {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalTime: string;
}

export interface Camera {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'alert';
  currentDetect?: string; // e.g. 'Человек', 'Автомобиль', 'Движение', 'Пусто'
  location: string;
  lastEvent?: string;
  lastEventTime?: string;
  rtspUrl: string;
  resolution: string;
  fps: number;
}

export interface OfficeEvent {
  id: string;
  level: 'info' | 'warning' | 'alert' | 'critical';
  timestamp: string;
  name: string;
  location: string;
  status: 'new' | 'acknowledged' | 'ignored';
  acknowledgedBy?: string;
  cameraName?: string;
  zoneName?: string;
  description: string;
}

export interface Zone {
  id: string;
  name: string;
  status: 'normal' | 'motion' | 'alert' | 'empty';
  peopleCount: number;
  cameras: string[]; // Camera IDs or names
  accessLevel: 'public' | 'restricted' | 'high-security';
  monitoringActive: boolean;
  rules: {
    workHours: string;
    afterHours: string;
    weekend: string;
  };
  svgCoords?: { x: number; y: number; width: number; height: number }; // coords on visual map layout
  maxCapacity?: number;
}

export interface Rule {
  id: string;
  name: string;
  condition: string;
  action: string;
  activeModes: string[]; // e.g. ['Рабочий день', 'После работы', 'Выходной']
  priority: 'info' | 'warning' | 'alert' | 'critical';
  enabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operator' | 'Viewer';
  lastLogin: string;
  phone?: string;
}

export interface WorkSchedule {
  workStart: string;  // '09:00'
  workEnd: string;    // '18:00'
  lunchStart: string; // '13:00'
  lunchEnd: string;   // '14:00'
  workDays: number[]; // [1,2,3,4,5] (пн-пт)
}
