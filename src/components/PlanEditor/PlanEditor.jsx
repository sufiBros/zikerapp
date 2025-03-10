import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Delete as DeleteIcon, Save, Cancel } from '@mui/icons-material';

const defaultPlan = {
  name: '',
  userLataif: [],
  intermediate: { duration: 20, isAuto: true },
  raabta: { duration: 10 },
  muraqbat: [],
  useStartAudio: false,
  useEndAudio: false
};

export default function PlanEditor({ plans, setPlans, settings }) {
  // Hooks must be called first at the top level
  const { index } = useParams();
  const navigate = useNavigate();
  const isNewPlan = index === 'new';
  const parsedIndex = isNewPlan ? null : parseInt(index, 10);

  // State initialization with proper index handling
  const [plan, setPlan] = useState(() => {
    if (!isNewPlan) {
      if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= plans.length) {
        navigate('/');
        return defaultPlan;
      }
      return plans[parsedIndex];
    }
    return defaultPlan;
  });

  // Handle invalid indexes in useEffect
  useEffect(() => {
    if (!isNewPlan && (
      isNaN(parsedIndex) || 
      parsedIndex < 0 || 
      parsedIndex >= plans.length
    )) {
      navigate('/');
    }
  }, [isNewPlan, parsedIndex, plans.length, navigate]);

  // Save function moved after hooks
  const savePlan = () => {
    if (!plan.name.trim()) {
      alert('Please enter a plan name');
      return;
    }
    
    const newPlans = [...plans];
    if (isNewPlan) {
      newPlans.push(plan);
    } else {
      if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= newPlans.length) {
        alert('Invalid plan index');
        return;
      }
      newPlans[parsedIndex] = plan;
    }
    setPlans(newPlans);
    navigate('/');
  };

  const hasAllLataif = new Set(plan.userLataif.map(l => l.id)).size === 7;

  // Rest of the component logic remains similar with proper index handling
  const addLatifa = (latifaId) => {
    const selected = settings.lataif.find(l => l.id === latifaId);
    setPlan(prev => ({
      ...prev,
      userLataif: [...prev.userLataif, {
        ...selected,
        duration: selected.defaultDuration
      }].sort((a, b) => a.id.localeCompare(b.id))
    }));
  };

  const handleDurationChange = (type, index, value) => {
    const parsed = Math.max(0, parseInt(value) || 0);
    const updated = [...plan[type]];
    updated[index].duration = parsed;
    setPlan(prev => ({ ...prev, [type]: updated }));
  };

  const removeItem = (type, index) => {
    const updatedItems = [...plan[type]];
    updatedItems.splice(index, 1);
    setPlan(prev => ({ ...prev, [type]: updatedItems }));
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        {isNewPlan ? 'Create New Plan' : `Editing: ${plan.name}`}
      </Typography>

      {/* Plan Name */}
      <TextField
        fullWidth
        label="Plan Name"
        value={plan.name}
        onChange={e => setPlan(prev => ({ ...prev, name: e.target.value }))}
        sx={{ mb: 3 }}
      />

      {/* Lataif Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Lataif Sequence (Select 1-7)</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Add Latifa</InputLabel>
          <Select
            value=""
            onChange={(e) => addLatifa(e.target.value)}
            disabled={plan.userLataif.length >= 7}
          >
            {settings.lataif
              .filter(l => !plan.userLataif.some(ul => ul.id === l.id))
              .map(lat => (
                <MenuItem key={lat.id} value={lat.id}>{lat.name}</MenuItem>
              ))}
          </Select>
        </FormControl>

        <List>
          {plan.userLataif.map((latifa, idx) => (
            <ListItem 
              key={latifa.id}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  onClick={() => removeItem('userLataif', idx)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={latifa.name} />
              <TextField
                type="number"
                label="Seconds"
                value={latifa.duration}
                onChange={e => handleDurationChange('userLataif', idx, e.target.value)}
                sx={{ width: 120, ml: 2 }}
                inputProps={{ min: 1 }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Intermediate Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Repeated Latifa 1</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            type="number"
            label="Duration (seconds)"
            value={plan.intermediate.duration}
            onChange={e => setPlan(prev => ({
              ...prev,
              intermediate: {
                duration: Math.max(1, parseInt(e.target.value)),
                isAuto: false
              }
            }))}
            sx={{ width: 200 }}
            inputProps={{ min: 1 }}
          />
          <Button
            variant="outlined"
            onClick={() => setPlan(prev => ({
              ...prev,
              intermediate: { ...prev.intermediate, isAuto: true }
            }))}
            disabled={plan.intermediate.isAuto}
          >
            Auto Calculate
          </Button>
        </Box>
      </Box>

      {/* Raabta Section (Conditional) */}
      {hasAllLataif && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Raabta Duration</Typography>
          <TextField
            fullWidth
            type="number"
            label="Duration in seconds (0 = no raabta)"
            value={plan.raabta.duration}
            onChange={e => setPlan(prev => ({
              ...prev,
              raabta: { duration: Math.max(0, parseInt(e.target.value)) }
            }))}
            inputProps={{ min: 0 }}
          />
        </Box>
      )}

      {/* Muraqbat Section (Conditional) */}
      {hasAllLataif && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Muraqbat Sequence</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Add Muraqba</InputLabel>
            <Select
              value=""
              onChange={e => {
                const selected = settings.muraqbat.find(m => m.id === e.target.value);
                if (selected) {
                  setPlan(prev => ({
                    ...prev,
                    muraqbat: [...prev.muraqbat, {
                      ...selected,
                      duration: selected.defaultDuration
                    }]
                  }));
                }
              }}
            >
              {settings.muraqbat
                .filter(m => !plan.muraqbat.some(um => um.id === m.id))
                .map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
            </Select>
          </FormControl>

          <List>
            {plan.muraqbat.map((muraqba, idx) => (
              <ListItem 
                key={muraqba.id}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={() => removeItem('muraqbat', idx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={muraqba.name} />
                <TextField
                  type="number"
                  label="Seconds"
                  value={muraqba.duration}
                  onChange={e => handleDurationChange('muraqbat', idx, e.target.value)}
                  sx={{ width: 120, ml: 2 }}
                  inputProps={{ min: 1 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={savePlan}
          size="large"
        >
          Save Plan
        </Button>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={() => navigate('/')}
          size="large"
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}