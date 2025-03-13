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
  
  const safeSettings = {
    ...defaultSettings,
    ...settings,
    lataif: settings?.lataif || [],
    muraqbat: settings?.muraqbat || []
  };

  const [plan, setPlan] = useState(() => {
    if (isNewPlan) return createNewPlan();
    const existingPlan = userPlans.find(p => p.id === id) || {};
    return {
      ...createNewPlan(),
      ...existingPlan,
      userLataif: existingPlan.userLataif || [],
      muraqbat: existingPlan.muraqbat || [],
      intermediate: existingPlan.intermediate || { duration: 20, isAuto: true },
      raabta: existingPlan.raabta || { duration: 10 }
    };
  });

  // Auto-calculate intermediate duration when L1 changes
  useEffect(() => {
    if (plan.intermediate?.isAuto && plan.userLataif?.length > 0) {
      const l1Duration = plan.userLataif[0].duration;
      const calculatedDuration = Math.round(l1Duration / 3);
      setPlan(prev => ({
        ...prev,
        intermediate: {
          ...prev.intermediate,
          duration: calculatedDuration > 0 ? calculatedDuration : 1
        }
      }));
    }
  }, [plan.userLataif, plan.intermediate?.isAuto]);

  const savePlan = () => {
    if (!plan.name?.trim()) {
      alert('Please enter a plan name');
      return;
    }
    onSavePlan?.(plan);
    navigate('/');
  };

  // Add multiple lataif at once
  const addLataif = (latifaIds) => {
    const newLataif = latifaIds
      .map(id => safeSettings.lataif.find(l => l.id === id))
      .filter(l => l && !plan.userLataif.some(ul => ul.id === l.id))
      .map(l => ({ ...l, duration: l.defaultDuration || 60 }));

    if (newLataif.length > 0) {
      setPlan(prev => ({
        ...prev,
        userLataif: [
          ...prev.userLataif,
          ...newLataif
        ].sort((a, b) => a.id?.localeCompare(b.id))
      }));
    }
  };

  // Add multiple muraqbat at once
  const addMuraqbat = (muraqbaIds) => {
    const newMuraqbat = muraqbaIds
      .map(id => safeSettings.muraqbat.find(m => m.id === id))
      .filter(m => m && !plan.muraqbat.some(um => um.id === m.id))
      .map(m => ({ ...m, duration: m.defaultDuration || 60 }));

    if (newMuraqbat.length > 0) {
      setPlan(prev => ({
        ...prev,
        muraqbat: [...prev.muraqbat, ...newMuraqbat]
      }));
    }
  };

  // Common handler for duration changes
  const handleDurationChange = (type, index, value) => {
    const parsed = parseInt(value);
    setPlan(prev => ({
      ...prev,
      [type]: (prev[type] || []).map((item, i) => 
        i === index ? { ...item, duration: parsed } : item
      )
    }));
  };

  // Common handler for removing items
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

          <TextField
            fullWidth
            label="Plan Name"
            value={plan.name || ''}
            onChange={e => setPlan(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 3 }}
          />

          {/* Lataif Section with Multi-Select */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lataif Sequence (Select 1-7)
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Add Lataif</InputLabel>
              <Select
                multiple
                value={[]}
                onChange={(e) => addLataif(e.target.value)}
                disabled={(plan.userLataif?.length || 0) >= 7}
                renderValue={() => "Select Lataif"}
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
                  <ListItemText primary={latifa.name || `Latifa ${latifa.id}`} />
                  <TextField
                    type="number"
                    label="Seconds"
                    value={latifa.duration}
                    onChange={e => handleDurationChange('userLataif', idx, e.target.value)}
                    sx={{ width: 120, ml: 2 }}
                    inputProps={{ min: 1 }}
                  />
                  <IconButton onClick={() => removeItem('userLataif', idx)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Intermediate Duration with Auto-Calculate */}
          <Box sx={{ mb: 3 }}>
  <Typography variant="h6" gutterBottom>
    Repeated Latifa 1 Duration
  </Typography>
  
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
    <TextField
      type="number"
      label="Duration (seconds)"
      value={plan.intermediate?.duration || 0}
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
        onClick={() => {
          if (plan.userLataif[0]?.duration) {
            setPlan(prev => ({
              ...prev,
              intermediate: {
                duration: Math.round(plan.userLataif[0].duration / 3),
                isAuto: true
              }
            }));
          }
        }}
      >
        Auto Calculate
        {plan.intermediate?.isAuto && ' ✓'}
      </Button>
  </Box>
  
  <Typography variant="body2" color="textSecondary">
    {plan.intermediate?.isAuto ? 
      "Currently using 1/3 of First Latifa's duration" :
      "Tip: Use 'Auto Calculate' to set based on first Latifa time"
    }
  </Typography>
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

          {/* Muraqbat Section with Multi-Select */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Muraqbat Sequence
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Add Muraqbat</InputLabel>
              <Select
                multiple
                value={[]}
                onChange={(e) => addMuraqbat(e.target.value)}
                renderValue={() => "Select Muraqbat"}
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
                  <IconButton onClick={() => removeItem('muraqbat', idx)}>
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