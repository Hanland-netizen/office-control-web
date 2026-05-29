import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Button, 
  Chip, 
  Skeleton, 
  Snackbar, 
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Search, 
  Upload, 
  FilterX,
  Image as ImageIcon 
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EmployeeRow } from '../components/Employees/EmployeeRow';
import { EmployeeDrawer } from '../components/Employees/EmployeeDrawer';
import { useOfficeStore } from '../store/officeStore';
import { useAuthStore } from '../store/authStore';
import { Employee } from '../types';

export const EmployeesPage: React.FC = () => {
  const { employees, addEmployee, updateEmployee } = useOfficeStore();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'active' | 'absent' | 'break'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name_asc');

  // Selected employee drawer state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add employee modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPosition, setNewEmpPosition] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Сотрудник');
  const [newEmpDept, setNewEmpDept] = useState('Общий отдел');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Toast feedback state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const isAdmin = user?.role === 'Admin';

  // Simulation loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getEmployeeDept = (emp: Employee): string => {
    if (emp.department) return emp.department;
    const pos = emp.position.toLowerCase();
    if (pos.includes('продаж')) return 'Отдел продаж';
    if (pos.includes('бухг')) return 'Бухгалтерия';
    if (pos.includes('it') || pos.includes('ит')) return 'IT департамент';
    if (pos.includes('hr') || pos.includes('кадр')) return 'Отдел кадров';
    if (pos.includes('дирек') || pos.includes('руковод')) return 'Администрация';
    if (pos.includes('юр')) return 'Юридический отдел';
    if (pos.includes('охран') || pos.includes('безоп')) return 'Служба безопасности';
    return 'Общий отдел';
  };

  const handleOpenDrawer = (emp: Employee) => {
    // Enrich with dynamic fields for editing if they do not exist
    const enriched: Employee = {
      ...emp,
      department: getEmployeeDept(emp),
      email: emp.email || `${emp.name.toLowerCase().replace(/\s/g, '.')}@office-control.ru`,
      phone: emp.phone || '+7 (999) 000-00-11'
    };
    setSelectedEmployee(enriched);
    setDrawerOpen(true);
  };

  const handleSaveFromDrawer = (updated: Employee) => {
    updateEmployee(updated);
    setSnackbarMsg(`Данные сотрудника ${updated.name} успешно сохранены!`);
    setSnackbarOpen(true);
  };

  const handleExportExcel = () => {
    const mapStatus = (status: string) => {
      switch (status) {
        case 'active': return 'В офисе';
        case 'absent': return 'Отсутствует';
        case 'break': return 'Перерыв';
        default: return status;
      }
    };

    const mapActivity = (lvl: string) => {
      switch (lvl) {
        case 'green': return 'Высокая';
        case 'yellow': return 'Средняя';
        case 'red': return 'Низкая';
        default: return lvl;
      }
    };

    const data = employees.map(emp => ({
      'Имя': emp.name,
      'Должность': emp.position,
      'Статус': mapStatus(emp.status),
      'Время прихода': emp.checkInTime || '—',
      'Время в офисе': emp.timeSpent || '—',
      'Активность': mapActivity(emp.activityLevel)
    }));

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const date = `${dd}-${mm}-${yyyy}`;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Сотрудники');
    XLSX.writeFile(wb, `employees_${date}.xlsx`);

    setSnackbarMsg(`Экспорт в Excel завершен! Скачивается файл "employees_${date}.xlsx"`);
    setSnackbarOpen(true);
  };

  // Drag-and-drop upload mock interactions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPresenceFilter('all');
    setDeptFilter('all');
    setSortBy('name_asc');
  };

  const handleCreateEmployee = () => {
    if (newEmpName.trim() === '' || newEmpPosition.trim() === '') {
      return;
    }

    addEmployee({
      name: newEmpName,
      position: newEmpPosition,
      role: newEmpRole,
      status: 'absent', // Initially absent
      activityLevel: 'red', // Initially low activity
      department: newEmpDept,
      email: newEmpEmail || `${newEmpName.toLowerCase().replace(/\s/g, '.')}@office-control.ru`,
      phone: newEmpPhone || '+7 (999) 000-00-11'
    });

    setSnackbarMsg(`Сотрудник "${newEmpName}" успешно добавлен в систему!`);
    setSnackbarOpen(true);

    // Reset fields & close
    setAddModalOpen(false);
    setNewEmpName('');
    setNewEmpPosition('');
    setNewEmpRole('Сотрудник');
    setNewEmpDept('Общий отдел');
    setNewEmpEmail('');
    setNewEmpPhone('');
    setUploadedFileName(null);
  };

  // Dynamic unique departments list
  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach(e => {
      depts.add(getEmployeeDept(e));
    });
    return Array.from(depts);
  }, [employees]);

  // Filter & Sort computations (БЛОК 1)
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) => {
        const q = searchQuery.toLowerCase();
        const dept = getEmployeeDept(e);
        return [e.name, e.position, dept, e.email || '', e.phone || '']
          .some((f) => (f || '').toLowerCase().includes(q));
      })
      .filter((e) => presenceFilter === 'all' || e.status === presenceFilter)
      .filter((e) => deptFilter === 'all' || getEmployeeDept(e) === deptFilter)
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'ru');
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name, 'ru');
        if (sortBy === 'checkin') return (a.checkInTime || '99:99').localeCompare(b.checkInTime || '99:99');
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
      });
  }, [employees, searchQuery, presenceFilter, deptFilter, sortBy]);

  const activeCount = employees.filter((e) => e.status === 'active').length;
  const totalCount = employees.length;

  return (
    <Box>
      <PageHeader
        title="Сотрудники"
        description="Присутствие и активность"
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              variant="outlined" 
              startIcon={<FileSpreadsheet size={16} />}
              onClick={handleExportExcel}
            >
              Экспорт в Excel
            </Button>
            {isAdmin && (
              <Button 
                variant="contained" 
                startIcon={<UserPlus size={16} />}
                onClick={() => setAddModalOpen(true)}
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              >
                Добавить сотрудника
              </Button>
            )}
          </Box>
        }
      />

      {/* Control Filters Bar */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2, 
          mb: 3.5, 
          p: 2.5, 
          bgcolor: 'background.paper', 
          borderRadius: 3.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '3.5fr 2.2fr 2.2fr 2.3fr 1.8fr' }, gap: 2, alignItems: 'center' }}>
          {/* 1. Полнотекстовый поиск */}
          <Box>
            <TextField
              size="small"
              placeholder="Поиск сотрудника..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: '#718096', marginRight: 8 }} />
                }
              }}
            />
          </Box>

          {/* 2. Фильтр по присутствию */}
          <Box>
            <FormControl size="small" fullWidth>
              <InputLabel id="presence-filter-label">Присутствие</InputLabel>
              <Select
                labelId="presence-filter-label"
                value={presenceFilter}
                label="Присутствие"
                onChange={(e) => setPresenceFilter(e.target.value as any)}
              >
                <MenuItem value="all">Все статусы</MenuItem>
                <MenuItem value="active">В офисе</MenuItem>
                <MenuItem value="break">На перерыве</MenuItem>
                <MenuItem value="absent">Отсутствуют</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 3. Фильтр по отделу (БЛОК 1) */}
          <Box>
            <FormControl size="small" fullWidth>
              <InputLabel id="dept-filter-label">Отдел</InputLabel>
              <Select
                labelId="dept-filter-label"
                value={deptFilter}
                label="Отдел"
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <MenuItem value="all">Все отделы</MenuItem>
                {departmentsList.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 4. Сортировка (БЛОК 1) */}
          <Box>
            <FormControl size="small" fullWidth>
              <InputLabel id="sort-filter-label">Сортировка</InputLabel>
              <Select
                labelId="sort-filter-label"
                value={sortBy}
                label="Сортировка"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name_asc">По имени А-Я</MenuItem>
                <MenuItem value="name_desc">По имени Я-А</MenuItem>
                <MenuItem value="checkin">По времени прихода</MenuItem>
                <MenuItem value="status">По статусу</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 5. Кнопка сброса */}
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              size="medium"
              startIcon={<FilterX size={16} />}
              onClick={handleResetFilters}
            >
              Сброс
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Chip 
            label={`Сейчас в офисе: ${activeCount} из ${totalCount}`} 
            color="primary" 
            variant="outlined" 
            sx={{ fontWeight: 700, fontSize: '0.8rem' }} 
          />
        </Box>
      </Box>

      {/* Corporate list table layout */}
      {isLoading ? (
        <React.Fragment>
          <Skeleton variant="rectangular" height={360} width="100%" sx={{ borderRadius: 3.5, mb: 1 }} />
        </React.Fragment>
      ) : filteredEmployees.length > 0 ? (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 500, px: 3 }}>Сотрудник</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Должность</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Приход сегодня</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Время в офисе</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Активность</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500, pr: 3 }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <EmployeeRow 
                  key={emp.id} 
                  employee={emp} 
                  isAdmin={isAdmin} 
                  onOpenDetails={handleOpenDrawer}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Не удалось найти сотрудников, подходящих под критерии фильтрации.
          </Typography>
        </Box>
      )}

      {/* Detailed side drawer */}
      <EmployeeDrawer 
        employee={selectedEmployee}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaveEmployee={handleSaveFromDrawer}
      />

      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', border: '0.5px solid', borderColor: 'divider' } } }}
      >
        <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>
          Новый сотрудник
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <TextField 
                label="ФИО сотрудника" 
                variant="outlined" 
                fullWidth 
                required
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
                error={newEmpName.trim() === ''}
                helperText={newEmpName.trim() === '' ? 'ФИО является обязательным полем' : ''}
              />
            </Box>
            <Box>
              <TextField 
                label="Должность" 
                variant="outlined" 
                fullWidth 
                required
                value={newEmpPosition}
                onChange={(e) => setNewEmpPosition(e.target.value)}
                error={newEmpPosition.trim() === ''}
                helperText={newEmpPosition.trim() === '' ? 'Укажите текущую должность' : ''}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField 
                label="Отдел" 
                variant="outlined" 
                fullWidth 
                value={newEmpDept}
                onChange={(e) => setNewEmpDept(e.target.value)}
              />
              <TextField 
                label="Роль в системе" 
                variant="outlined" 
                fullWidth 
                select
                value={newEmpRole}
                onChange={(e) => setNewEmpRole(e.target.value)}
              >
                <MenuItem value="Сотрудник">Сотрудник (Доступ к проходу)</MenuItem>
                <MenuItem value="Оператор">Оператор сис-панелей</MenuItem>
                <MenuItem value="Администратор">Администратор (Полный доступ)</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField 
                label="Email" 
                variant="outlined" 
                fullWidth 
                value={newEmpEmail}
                onChange={(e) => setNewEmpEmail(e.target.value)}
              />
              <TextField 
                label="Телефон" 
                variant="outlined" 
                fullWidth 
                value={newEmpPhone}
                onChange={(e) => setNewEmpPhone(e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}>
                Фотография профиля сотрудника
              </Typography>

              <Box 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                sx={{ 
                  bgcolor: dragActive ? 'rgba(21, 101, 192, 0.05)' : 'background.default',
                  border: '1px solid',
                  borderColor: dragActive ? 'primary.main' : 'divider',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(21, 101, 192, 0.02)'
                  }
                }}
              >
                <input 
                  type="file" 
                  id="photo-file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileInputChange}
                />
                <label htmlFor="photo-file" style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={32} style={{ color: '#1565C0', margin: '0 auto 12px auto' }} />
                  {uploadedFileName ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                       <ImageIcon size={16} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {uploadedFileName}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Перетащите изображение профиля или выберите файл
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Поддерживаются форматы JPG, PNG (разрешение до 10MB)
                      </Typography>
                    </Box>
                  )}
                </label>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Button onClick={() => setAddModalOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateEmployee}
            disabled={newEmpName.trim() === '' || newEmpPosition.trim() === ''}
            variant="contained"
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global alert toaster feedback */}
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
export default EmployeesPage;
