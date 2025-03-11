import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import { PlayArrow, Edit, Delete, Settings, Add } from '@mui/icons-material';

export default function HomeScreen({ plans, setPlans }) {
  const navigate = useNavigate();
  const [touchedIndex, setTouchedIndex] = useState(null);

  const handleDeletePlan = (index) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    setPlans(updatedPlans);
  };

  return (
    <Box sx={{ position: 'relative' }}>
    {/* Top Image Bar */}
    <Box sx={{ position: 'relative' }}>
        <img
          src="app.png"
          alt="Top Bar"
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>
    <Box sx={{ 
      p: 3,
      maxWidth: 800,
      margin: '0 auto'
    }}>
<Box sx={{ mb: 4, textAlign: 'center' }}>
  <Typography variant="h4" gutterBottom>
    Ziker Qalbi Plans
  </Typography>
  <Box sx={{ display: 'inline-flex', gap: 2 }}>
    <Button
      variant="contained"
      onClick={() => navigate('/plan/new')}
      startIcon={<Add />}
    >
      Create New Plan
    </Button>
          {/* Settings Button */}
    <Button
      variant="contained"
      startIcon={<Settings />}
      onClick={() => navigate('/settings')}
    >
      Settings
    </Button>
  </Box>
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
<Typography variant="body2" color="textSecondary">
    {(() => {
      // Calculate Lataif duration including raabta and intermediate durations
      const lataifDuration = (
        (plan?.userLataif?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0) +
        (plan?.raabta?.duration || 0) +
        (plan?.intermediate?.duration || 0)
      );
      
      // Calculate Muraqbat duration
      const muraqbatDuration = plan?.muraqbat?.reduce((sum, m) => sum + (m.duration || 0), 0) || 0;
      
      // Total duration is the sum of Lataif and Muraqbat durations
      const totalSeconds = lataifDuration + muraqbatDuration;

      // Helper function to format seconds as Hh Mm Ss
      const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [
          hours > 0 ? `${hours}h` : null,
          minutes > 0 ? `${minutes}m` : null,
          secs > 0 ? `${secs}s` : null
        ].filter(Boolean).join(' ') || '0s';
      };

      return `Total: ${formatDuration(totalSeconds)} | Lataif: ${formatDuration(lataifDuration)} | Muraqbat: ${formatDuration(muraqbatDuration)}`;
    })()}
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
    </Box>
    </Box>
  );
}