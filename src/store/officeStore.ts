import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Employee, Camera, OfficeEvent, Zone, Rule, User } from '../types';
import { mockEmployees, mockCameras, mockEvents, mockZones, mockRules, mockUsers } from '../data/mockData';

interface OfficeState {
  officeMode: string;
  isEmergency: boolean;
  emergencyType: 'fire' | 'other' | 'none';
  employees: Employee[];
  cameras: Camera[];
  events: OfficeEvent[];
  zones: Zone[];
  rules: Rule[];
  users: User[];
  isServerConnected: boolean;

  changeOfficeMode: (mode: string) => void;
  triggerEmergency: (type: 'fire' | 'other') => void;
  resetEmergency: () => void;
  toggleRule: (id: string) => void;
  acknowledgeEvent: (id: string, userName: string) => void;
  addEmployee: (employeeVal: Omit<Employee, 'id' | 'visitsHistory' | 'attendanceHistory'> & { image?: File | null }) => void;
  updateEmployee: (updated: Employee) => void;
  deleteEmployee: (id: string) => void;
  addRule: (ruleVal: Omit<Rule, 'id'>) => void;
  updateRule: (updated: Rule) => void;
  deleteRule: (id: string) => void;
  addUser: (userVal: User) => void;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: 'Admin' | 'Operator' | 'Viewer') => void;
  checkServerConnection: (addr: string) => Promise<boolean>;
  triggerTelegramCheck: (token: string, chatId: string) => Promise<boolean>;
  triggerEmailCheck: (email: string) => Promise<boolean>;
  updateZoneMonitoring: (zoneId: string, active: boolean) => void;
  updateZoneRules: (zoneId: string, workHours: string, afterHours: string, weekend: string) => void;
  updateZonePeopleCount: (zoneId: string, count: number) => void;
  addEvent: (event: OfficeEvent) => void;
  updateEvent: (updated: OfficeEvent) => void;
  resetToDefaults: () => void;
}

export const useOfficeStore = create<OfficeState>()(
  persist(
    (set) => ({
      // Персистентные данные (сохраняются)
      officeMode: 'Рабочий день',
      employees: mockEmployees,
      zones: mockZones,
      rules: mockRules,
      users: mockUsers,

      // Живые данные (сбрасываются при перезагрузке)
      isEmergency: false,
      emergencyType: 'none' as const,
      cameras: mockCameras,
      events: mockEvents,
      isServerConnected: true,

      changeOfficeMode: (mode) => set({ officeMode: mode }),

      triggerEmergency: (type) => {
        set((state) => {
          const newEvent: OfficeEvent = {
            id: `ev-emerg-${Date.now()}`,
            level: 'critical',
            timestamp: new Date().toLocaleTimeString('ru-RU'),
            name: type === 'fire' ? 'Пожарная тревога' : 'Экстренный режим ЧС',
            location: 'Все зоны офиса',
            status: 'new',
            description: type === 'fire'
              ? 'Объявлен режим пожарной ЧС. Запущена сирена эвакуации.'
              : 'Активирован ручной сигнал экстренного вызова охраны.',
          };
          return { isEmergency: true, emergencyType: type, events: [newEvent, ...state.events] };
        });
      },

      resetEmergency: () => {
        set((state) => {
          const resetEvent: OfficeEvent = {
            id: `ev-emerg-reset-${Date.now()}`,
            level: 'info',
            timestamp: new Date().toLocaleTimeString('ru-RU'),
            name: 'Режим ЧС отменён',
            location: 'Все зоны офиса',
            status: 'acknowledged',
            acknowledgedBy: 'Администратор',
            description: 'Экстренный режим деактивирован.',
          };
          return { isEmergency: false, emergencyType: 'none', events: [resetEvent, ...state.events] };
        });
      },

      toggleRule: (id) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
          ),
        }));
      },

      acknowledgeEvent: (id, userName) => {
        set((state) => ({
          events: state.events.map((evt) =>
            evt.id === id ? { ...evt, status: 'acknowledged', acknowledgedBy: userName } : evt
          ),
        }));
      },

      addEmployee: (employeeVal) => {
        set((state) => {
          const newEmployee: Employee = {
            ...employeeVal,
            id: `emp-${Date.now()}`,
            attendanceHistory: [
              { day: 'Пн', hours: 8.0 },
              { day: 'Вт', hours: 8.0 },
              { day: 'Ср', hours: 8.0 },
              { day: 'Чт', hours: 8.0 },
              { day: 'Пт', hours: 8.0 },
              { day: 'Сб', hours: 0 },
              { day: 'Вс', hours: 0 },
            ],
            visitsHistory: [],
          };
          return { employees: [newEmployee, ...state.employees] };
        });
      },

      updateEmployee: (updated) => {
        set((state) => ({
          employees: state.employees.map((emp) => (emp.id === updated.id ? updated : emp)),
        }));
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
        }));
      },

      addRule: (ruleVal) => {
        set((state) => ({
          rules: [...state.rules, { ...ruleVal, id: `rule-${Date.now()}` }],
        }));
      },

      updateRule: (updated) => {
        set((state) => ({
          rules: state.rules.map((rule) => (rule.id === updated.id ? updated : rule)),
        }));
      },

      deleteRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== id),
        }));
      },

      addUser: (userVal) => {
        set((state) => ({ users: [...state.users, userVal] }));
      },

      deleteUser: (id) => {
        set((state) => ({ users: state.users.filter((user) => user.id !== id) }));
      },

      updateUserRole: (id, role) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, role } : user)),
        }));
      },

      checkServerConnection: async (addr) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const success = addr.trim().length > 0;
        set({ isServerConnected: success });
        return success;
      },

      triggerTelegramCheck: async (token, chatId) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return token.length > 5 && chatId.length > 3;
      },

      triggerEmailCheck: async (email) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return email.includes('@') && email.includes('.');
      },

      updateZoneMonitoring: (zoneId, active) => {
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId ? { ...zone, monitoringActive: active } : zone
          ),
        }));
      },

      updateZoneRules: (zoneId, workHours, afterHours, weekend) => {
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId ? { ...zone, rules: { workHours, afterHours, weekend } } : zone
          ),
        }));
      },

      updateZonePeopleCount: (zoneId, count) => {
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId ? { ...zone, peopleCount: count } : zone
          ),
        }));
      },

      addEvent: (event) => {
        set((state) => ({
          events: [event, ...state.events],
        }));
      },

      updateEvent: (updated) => {
        set((state) => ({
          events: state.events.map((evt) => (evt.id === updated.id ? updated : evt)),
        }));
      },

      resetToDefaults: () => {
        set({
          employees: mockEmployees,
          zones: mockZones,
          rules: mockRules,
          users: mockUsers,
          officeMode: 'Рабочий день',
        });
      },
    }),

    {
      name: 'office-control-storage', // ключ в localStorage
      storage: createJSONStorage(() => localStorage),
      // Сохранять ТОЛЬКО эти поля:
      partialize: (state) => ({
        employees: state.employees,
        rules: state.rules,
        users: state.users,
        zones: state.zones,
        officeMode: state.officeMode,
      }),
    }
  )
);
