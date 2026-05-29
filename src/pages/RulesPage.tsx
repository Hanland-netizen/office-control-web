import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Switch, 
  Button, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Snackbar,
  Alert,
  Divider,
  FormHelperText,
  useTheme,
  FormControlLabel
} from '@mui/material';
import { Plus, Sliders, Zap, Trash2, Edit2, AlertOctagon } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { PriorityIcon } from '../components/common/PriorityIcon';
import { useOfficeStore } from '../store/officeStore';
import { Rule } from '../types';

export const RulesPage: React.FC = () => {
  const theme = useTheme();
  const { rules, addRule, updateRule, deleteRule, toggleRule } = useOfficeStore();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>(['Рабочий день']);
  const [selectedPriority, setSelectedPriority] = useState<'info' | 'warning' | 'alert' | 'critical'>('info');

  // Form validations
  const [formTouched, setFormTouched] = useState(false);

  // Toast feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const conditionOptions = [
    'Движение в закрытой зоне',
    'Задымление обнаружено',
    'Неизвестное лицо на входе',
    'Камера ушла офлайн',
    'Свет горит в пустой комнате > 15 мин',
    'Сотрудник отсутствует > 3 часов',
    'Температура в серверной > 35°C',
    'Протечка воды обнаружена'
  ];

  const actionOptions = [
    'Отправить Push-уведомление руководству',
    'Отправить фото в Telegram охраны',
    'Включить сирену эвакуации',
    'Заблокировать дверь серверной',
    'Отключить электропитание розеток',
    'Отправить SMS на номер'
  ];

  const modeOptions = ['Рабочий день', 'После работы', 'Выходной'];

  const handleOpenAdd = () => {
    setEditingRule(null);
    setRuleName('');
    setSelectedCondition('');
    setSelectedAction('');
    setSelectedModes(['Рабочий день']);
    setSelectedPriority('info');
    setFormTouched(false);
    setWizardOpen(true);
  };

  const handleOpenEdit = (rule: Rule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setSelectedCondition(rule.condition);
    setSelectedAction(rule.action);
    setSelectedModes(rule.activeModes);
    setSelectedPriority(rule.priority);
    setFormTouched(false);
    setWizardOpen(true);
  };

  const handleSaveRule = () => {
    setFormTouched(true);

    if (ruleName.trim() === '' || selectedCondition === '' || selectedAction === '' || selectedModes.length === 0) {
      return; // Validation fails
    }

    if (editingRule) {
      updateRule({
        ...editingRule,
        name: ruleName,
        condition: selectedCondition,
        action: selectedAction,
        activeModes: selectedModes,
        priority: selectedPriority,
      });
      setSnackbarMsg(`Правило "${ruleName}" успешно изменено.`);
    } else {
      addRule({
        name: ruleName,
        condition: selectedCondition,
        action: selectedAction,
        activeModes: selectedModes,
        priority: selectedPriority,
        enabled: true,
      });
      setSnackbarMsg(`Правило "${ruleName}" добавлено в систему.`);
    }

    setSnackbarOpen(true);
    setWizardOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteRule(id);
    setSnackbarMsg(`Правило "${name}" удалено.`);
    setSnackbarOpen(true);
  };

  const handleToggle = (id: string, name: string, isEnabled: boolean) => {
    toggleRule(id);
    setSnackbarMsg(`Правило "${name}" ${!isEnabled ? 'включено' : 'выключено'}.`);
    setSnackbarOpen(true);
  };

  const handleModeChange = (event: any) => {
    const value = event.target.value;
    setSelectedModes(typeof value === 'string' ? value.split(',') : value);
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'critical': return 'Критический';
      case 'alert': return 'Тревога';
      case 'warning': return 'Предупреждение';
      case 'info': return 'Информация';
      default: return p;
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Правила" 
        description="Автоматические сценарии реагирования"
        action={
          <Button 
            variant="contained" 
            startIcon={<Plus size={16} />} 
            onClick={handleOpenAdd}
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Добавить правило
          </Button>
        }
      />

      {/* Rules card layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {rules.map((rule) => (
          <Box key={rule.id}>
            <Card sx={{ opacity: rule.enabled ? 1 : 0.68, transition: 'all 0.2s', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                {/* Rule title header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: '75%' }}>
                    <PriorityIcon priority={rule.priority} size={20} />
                    <Typography variant="h5" sx={{ fontWeight: 850, color: 'text.primary' }}>
                      {rule.name}
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch 
                        checked={rule.enabled} 
                        onChange={() => handleToggle(rule.id, rule.name, rule.enabled)}
                        size="small"
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {/* If/Then content panel */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>ЕСЛИ:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary', mt: 0.2 }}>
                      {rule.condition}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>ТО:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 650, color: 'primary.main', mt: 0.2 }}>
                      {rule.action}
                    </Typography>
                  </Box>
                </Box>

                {/* Active modes list */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 650, mr: 0.5 }}>
                    Режимы:
                  </Typography>
                  {rule.activeModes.map((mode) => (
                    <Chip 
                      key={mode} 
                      label={mode} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                    />
                  ))}
                  <Chip 
                    label={getPriorityLabel(rule.priority)} 
                    size="small"
                    sx={{ 
                      ml: 'auto', 
                      fontSize: '0.68rem', 
                      fontWeight: 800,
                      bgcolor: 
                        rule.priority === 'critical' ? 'rgba(198,40,40,0.12)' :
                        rule.priority === 'alert' ? 'rgba(230,81,0,0.12)' : 
                        rule.priority === 'warning' ? 'rgba(249,168,37,0.12)' : 'rgba(21,101,192,0.12)',
                      color:
                        rule.priority === 'critical' ? '#C62828' :
                        rule.priority === 'alert' ? '#E65100' :
                        rule.priority === 'warning' ? '#F9A825' : '#1565C0',
                    }}
                  />
                </Box>

              </CardContent>

              <CardActions sx={{ px: 3, pb: 2.5, pt: 0, justifyContent: 'flex-end', borderTop: 'none' }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<Edit2 size={13} />}
                  onClick={() => handleOpenEdit(rule)}
                >
                  Редактировать
                </Button>
                <Button 
                  size="small" 
                  variant="text" 
                  color="error" 
                  startIcon={<Trash2 size={13} />}
                  onClick={() => handleDelete(rule.id, rule.name)}
                >
                  Удалить
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      <Dialog 
        open={wizardOpen} 
        onClose={() => setWizardOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '12px', border: '0.5px solid', borderColor: 'divider' }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid', borderColor: 'divider' }}>
          {editingRule ? 'Редактирование правила' : 'Новое правило'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          
          <TextField 
            label="Название сценария" 
            variant="outlined" 
            fullWidth 
            required
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            error={formTouched && ruleName.trim() === ''}
            helperText={formTouched && ruleName.trim() === '' ? 'Поле обязательно для ввода' : ''}
          />

          <FormControl fullWidth error={formTouched && selectedCondition === ''}>
            <InputLabel id="condition-select-label">Условие</InputLabel>
            <Select
              labelId="condition-select-label"
              value={selectedCondition}
              label="Условие"
              onChange={(e) => setSelectedCondition(e.target.value)}
            >
              <MenuItem value=""><em>Выбрать условие</em></MenuItem>
              {conditionOptions.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
            {formTouched && selectedCondition === '' && (
              <FormHelperText>Выберите условие срабатывания</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth error={formTouched && selectedAction === ''}>
            <InputLabel id="action-select-label">Действие</InputLabel>
            <Select
              labelId="action-select-label"
              value={selectedAction}
              label="Действие"
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <MenuItem value=""><em>Выбрать действие автоматики</em></MenuItem>
              {actionOptions.map((a) => (
                <MenuItem key={a} value={a}>{a}</MenuItem>
              ))}
            </Select>
            {formTouched && selectedAction === '' && (
              <FormHelperText>Выберите выполняемое действие</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth error={formTouched && selectedModes.length === 0}>
            <InputLabel id="modes-select-label">Активные режимы офиса</InputLabel>
            <Select
              labelId="modes-select-label"
              multiple
              value={selectedModes}
              onChange={handleModeChange}
              input={<OutlinedInput label="Активные режимы офиса" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {modeOptions.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  <Checkbox checked={selectedModes.indexOf(mode) > -1} />
                  <ListItemText primary={mode} />
                </MenuItem>
              ))}
            </Select>
            {formTouched && selectedModes.length === 0 && (
              <FormHelperText>Выберите хотя бы один активный режим</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="priority-select-label">Приоритет</InputLabel>
            <Select
              labelId="priority-select-label"
              value={selectedPriority}
              label="Приоритет"
              onChange={(e) => setSelectedPriority(e.target.value as any)}
            >
              <MenuItem value="info">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: '#1565C0', borderRadius: '50%' }} />
                  Информация (Низкая)
                </Box>
              </MenuItem>
              <MenuItem value="warning">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: '#F9A825', borderRadius: '50%' }} />
                  Предупреждение (Средняя)
                </Box>
              </MenuItem>
              <MenuItem value="alert">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: '#E65100', borderRadius: '50%' }} />
                  Тревога (Высокая)
                </Box>
              </MenuItem>
              <MenuItem value="critical">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: '#C62828', borderRadius: '50%' }} />
                  Критическая ЧС (Максимальная)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

         </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Button onClick={() => setWizardOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleSaveRule}
            variant="contained"
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alerts */}
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
export default RulesPage;
