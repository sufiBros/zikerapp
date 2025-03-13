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
import { Delete as DeleteIcon, Save, Cancel, DragHandle } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

  useEffect(() => {
    if (!isNewPlan && !userPlans.some(p => p.id === id)) {
      navigate('/');
    }
  }, [userPlans, id, isNewPlan, navigate]);

  useEffect(() => {
    if (plan.intermediate?.isAuto && plan.userLataif[0]?.duration) {
      const newDuration = Math.round(plan.userLataif[0].duration / 3);
      setPlan(prev => ({
        ...prev,
        intermediate: {
          ...prev.intermediate,
          duration: newDuration > 0 ? newDuration : 1
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(plan.muraqbat);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPlan(prev => ({
      ...prev,
      muraqbat: items
    }));
  };

  const addLataif = (latifaIds) => {
    const newLataif = latifaIds
      .map(id => safeSettings.lataif.find(l => l.id === id))
      .filter(l => l && !plan.userLataif.some(ul => ul.id === l.id))
      .map(l => ({ ...l, duration: l.defaultDuration || 60 }));

    setPlan(prev => ({
      ...prev,
      userLataif: [
        ...prev.userLataif,
        ...newLataif
      ].sort((a, b) => a.id?.localeCompare(b.id)).slice(0, 7)
    }));
  };

  const addMuraqbat = (muraqbaIds) => {
    const newMuraqbat = muraqbaIds
      .map(id => safeSettings.muraqbat.find(m => m.id === id))
      .filter(m => m && !plan.muraqbat.some(um => um.id === m.id))
      .map(m => ({ ...m, duration: m.defaultDuration || 60 }));

    setPlan(prev => ({
      ...prev,
      muraqbat: [...prev.muraqbat, ...newMuraqbat]
    }));
  };

  const handleDurationChange = (type, index, value) => {
    const parsed = parseInt(value);
    setPlan(prev => ({
      ...prev,
      [type]: (prev[type] || []).map((item, i) => 
        i === index ? { ...item, duration: parsed } : item
      )
    }));
  };

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

          {/* Lataif Section */}
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
                disabled={plan.userLataif?.length >= 7}
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

          {/* Intermediate Duration */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Repeated Latifa 1 Duration
              <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                (Auto: 1/3 of first Latifa's time)
              </Typography>
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <TextField
                type="number"
                label="Seconds"
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
                {plan.intermediate?.isAuto ? 'Auto ✓' : 'Use Auto'}
              </Button>
            </Box>
            
            {plan.intermediate?.isAuto && plan.userLataif[0]?.duration && (
              <Typography variant="body2" color="textSecondary">
                Currently using {plan.intermediate.duration}s (1/3 of {plan.userLataif[0].duration}s)
              </Typography>
            )}
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

          {/* Muraqbat Section with Drag & Drop */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Muraqbat Sequence
              <Typography variant="body2" color="textSecondary">
                Drag to arrange order
              </Typography>
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
                  .filter(m => !plan.muraqbat?.some(um => m.id === um.id))
                  .map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name || `Muraqba ${m.id}`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="muraqbat">
                {(provided) => (
                  <List 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ userSelect: 'none' }}
                  >
                    {(plan.muraqbat || []).map((muraqba, index) => (
                      <Draggable 
                        key={muraqba.id} 
                        draggableId={muraqba.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              transition: 'all 0.2s ease',
                              bgcolor: snapshot.isDragging ? 'rgba(0, 0, 0, 0.05)' : 'inherit',
                              boxShadow: snapshot.isDragging ? 1 : 'none',
                              borderRadius: 1,
                              border: snapshot.isDragging ? '1px solid divider' : 'none'
                            }}
                          >
                            <DragHandle sx={{ mr: 1, color: 'action.active' }} />
                            <ListItemText 
                              primary={muraqba.name || `Muraqba ${muraqba.id}`} 
                            />
                            <TextField
                              type="number"
                              label="Seconds"
                              value={muraqba.duration}
                              onChange={e => handleDurationChange('muraqbat', index, e.target.value)}
                              sx={{ width: 120, ml: 2 }}
                              inputProps={{ min: 1 }}
                            />
                            <IconButton 
                              edge="end" 
                              onClick={() => removeItem('muraqbat', index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Box>

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={savePlan}
              size="large"
              sx={{ flex: 1 }}
            >
              {isNewPlan ? 'Create Plan' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate('/')}
              size="large"
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}