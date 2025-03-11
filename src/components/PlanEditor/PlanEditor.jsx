import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardContent,
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

// Default plan creation with required properties
const createNewPlan = () => ({
  id: `plan-${Date.now()}`,
  name: 'New Plan',
  userLataif: [],
  intermediate: { duration: 20, isAuto: true },
  raabta: { duration: 10 },
  muraqbat: [],
  useStartAudio: false,
  useEndAudio: false
});

// Default settings fallback
const defaultSettings = {
  lataif: [],
  muraqbat: [],
  audio: {
    start: [],
    end: []
  }
};

export default function PlanEditor({ userPlans = [], onSavePlan, settings = defaultSettings }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewPlan = id === 'new';
  
  // Merge incoming settings with defaults
  const safeSettings = {
    ...defaultSettings,
    ...settings,
    lataif: settings?.lataif || [],
    muraqbat: settings?.muraqbat || []
  };

  // State initialization with required plan properties
  const [plan, setPlan] = useState(() => {
    // New plan case
    if (isNewPlan) return createNewPlan();

    // Existing plan case
    const existingPlan = userPlans.find(p => p.id === id) || {};
    
    return {
      ...createNewPlan(), // Start with defaults
      ...existingPlan,    // Override with existing values
      userLataif: existingPlan.userLataif || [],
      muraqbat: existingPlan.muraqbat || [],
      intermediate: existingPlan.intermediate || { duration: 20, isAuto: true },
      raabta: existingPlan.raabta || { duration: 10 }
    };
  });

  // Navigation guard for invalid IDs
  useEffect(() => {
    if (!isNewPlan && !userPlans.some(p => p.id === id)) {
      navigate('/');
    }
  }, [userPlans, id, isNewPlan, navigate]);

  const savePlan = () => {
    if (!plan.name?.trim()) {
      alert('Please enter a plan name');
      return;
    }

    onSavePlan?.(plan);
    navigate('/');
  };

  // Check if all 7 lataif are selected
  const hasAllLataif = new Set(plan.userLataif?.map(l => l.id)).size === 7;

  // Add latifa to sequence
  const addLatifa = (latifaId) => {
    const selected = safeSettings.lataif.find(l => l.id === latifaId);
    if (!selected) return;

    setPlan(prev => ({
      ...prev,
      userLataif: [
        ...(prev.userLataif || []),
        {
          ...selected,
          duration: selected.defaultDuration || 60
        }
      ].sort((a, b) => a.id?.localeCompare(b.id))
    }));
  };

  // Handle duration changes for any section
  const handleDurationChange = (type, index, value) => {
    const parsed = parseInt(value);
    setPlan(prev => ({
      ...prev,
      [type]: (prev[type] || []).map((item, i) => 
        i === index ? { ...item, duration: parsed } : item
      )
    }));
  };

  // Remove item from any section
  const removeItem = (type, index) => {
    setPlan(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index)
    }));
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {isNewPlan ? 'Create New Plan' : `Editing: ${plan.name}`}
          </Typography>

          {/* Plan Name Field */}
          <TextField
            fullWidth
            label="Plan Name"
            value={plan.name || ''}
            onChange={e => setPlan(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 3 }}
          />

          {/* Lataif Selection Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lataif Sequence (Select 1-7)
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Add Latifa</InputLabel>
              <Select
                value=""
                onChange={(e) => addLatifa(e.target.value)}
                disabled={(plan.userLataif?.length || 0) >= 7}
              >
                {safeSettings.lataif
                  .filter(l => !plan.userLataif?.some(ul => ul.id === l.id))
                  .map(lat => (
                    <MenuItem key={lat.id} value={lat.id}>
                      {lat.name || `Latifa ${lat.id}`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <List>
              {(plan.userLataif || []).map((latifa, idx) => (
                <ListItem key={latifa.id || idx}>
                  <ListItemText 
                    primary={latifa.name || `Latifa ${latifa.id}`} 
                  />
                  <TextField
                    type="number"
                    label="Seconds"
                    value={latifa.duration}
                    onChange={e => handleDurationChange('userLataif', idx, e.target.value)}
                    sx={{ width: 120, ml: 2 }}
                    inputProps={{ min: 1 }}
                  />
                  <IconButton 
                    edge="end" 
                    onClick={() => removeItem('userLataif', idx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Intermediate Duration Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Repeated Latifa 1
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                type="number"
                label="Duration (seconds)"
                value={plan.intermediate?.duration}
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
                  intermediate: { 
                    ...(prev.intermediate || {}), 
                    isAuto: true 
                  }
                }))}
                disabled={plan.intermediate?.isAuto}
              >
                Auto Calculate
              </Button>
            </Box>
          </Box>

          {/* Raabta Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Raabta Duration
              </Typography>
              
              <TextField
                fullWidth
                type="number"
                label="Duration in seconds (0 = no raabta)"
                value={plan.raabta?.duration}
                onChange={e => setPlan(prev => ({
                  ...prev,
                  raabta: { duration: Math.max(0, parseInt(e.target.value)) }
                }))}
                inputProps={{ min: 0 }}
              />
            </Box>

          {/* Muraqbat Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Muraqbat Sequence
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Add Muraqba</InputLabel>
                <Select
                  value=""
                  onChange={e => {
                    const selected = safeSettings.muraqbat.find(m => m.id === e.target.value);
                    if (selected) {
                      setPlan(prev => ({
                        ...prev,
                        muraqbat: [
                          ...(prev.muraqbat || []),
                          {
                            ...selected,
                            duration: selected.defaultDuration || 60
                          }
                        ]
                      }));
                    }
                  }}
                >
                  {safeSettings.muraqbat
                    .filter(m => !plan.muraqbat?.some(um => um.id === m.id))
                    .map(m => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name || `Muraqba ${m.id}`}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <List>
                {(plan.muraqbat || []).map((muraqba, idx) => (
                  <ListItem key={muraqba.id || idx}>
                    <ListItemText primary={muraqba.name || `Muraqba ${muraqba.id}`} />
                    <TextField
                      type="number"
                      label="Seconds"
                      value={muraqba.duration}
                      onChange={e => handleDurationChange('muraqbat', idx, e.target.value)}
                      sx={{ width: 120, ml: 2 }}
                      inputProps={{ min: 1 }}
                    />
                    <IconButton 
                      edge="end" 
                      onClick={() => removeItem('muraqbat', idx)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={savePlan}
              size="large"
            >
              {isNewPlan ? 'Create Plan' : 'Save Changes'}
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
        </CardContent>
      </Card>
    </Box>
  );
}