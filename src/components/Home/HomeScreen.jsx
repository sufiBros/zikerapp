import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography
} from '@mui/material';
import { PlayArrow, Edit, Delete, Settings } from '@mui/icons-material';

export default function HomeScreen({ plans, setPlans }) {
  const navigate = useNavigate();
  const [touchedIndex, setTouchedIndex] = useState(null);

  const handleDeletePlan = (index) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    setPlans(updatedPlans);
  };

  return (
    <Box sx={{ 
      p: 3,
      maxWidth: 800,
      margin: '0 auto'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ziker Qalbi Plans
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/plan/new')}
          fullWidth
        >
          Create New Plan
        </Button>
      </Box>

      {/* Plan Cards Grid */}
      <Grid container spacing={2}>
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} key={plan.id || `plan-${index}`}>
            <Card
              sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: touchedIndex === index ? 'scale(0.98)' : 'none',
                boxShadow: touchedIndex === index ? 1 : 3,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 6
                }
              }}
              onTouchStart={() => setTouchedIndex(index)}
              onTouchEnd={() => setTouchedIndex(null)}
              onClick={() => navigate(`/plan/${index}`)}
            >
              <CardContent>
                <Typography variant="h6">
                  {plan.name || `Plan ${index + 1}`}
                </Typography>
              </CardContent>
              <CardActions sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
                px: 2,
                pb: 2
              }}>
                <Button
                  startIcon={<PlayArrow />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/play/${index}`);
                  }}
                >
                  Start
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/plan/${index}`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<Delete />}
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(index);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Settings Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => navigate('/settings')}
          sx={{ width: '100%', maxWidth: 200 }}
        >
          Settings
        </Button>
      </Box>
    </Box>
  );
}