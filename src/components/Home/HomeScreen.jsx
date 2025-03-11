import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Paper,
  Typography,
} from '@mui/material';
import { PlayArrow, Edit, Delete, Settings, Add, ContentCopy,AccessTime } from '@mui/icons-material';

export default function HomeScreen({ 
  defaultPlans,
  userPlans,
  onClonePlan,
  onDeletePlan,
  settings 
}) {
  const navigate = useNavigate();
  const [touchedId, setTouchedId] = useState(null);

  const getPlanDurations = (plan) => {
    const lataifDuration = (
      (plan?.userLataif?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0) +
      (plan?.raabta?.duration || 0) +
      (plan?.intermediate?.duration || 0)
    );
    
    const muraqbatDuration = plan?.muraqbat?.reduce((sum, m) => sum + (m.duration || 0), 0) || 0;
    const totalSeconds = lataifDuration + muraqbatDuration;

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

    return {
      total: formatDuration(totalSeconds),
      lataif: formatDuration(lataifDuration),
      muraqbat: formatDuration(muraqbatDuration)
    };
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
        {/* Header Section */}
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
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
          </Box>
        </Box>
  
        {/* User Plans Section */}
        {userPlans.length > 0 && (
          <Paper sx={{ 
            mt: 4,
            backgroundColor: (theme) => theme.palette.primary.light + '80', // 50% opacity
            backdropFilter: 'blur(5px)',
            p: 3,
            borderRadius: 4
          }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Your Plans
              </Typography>
              <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center'
              }}>
                {userPlans.map((plan) => {
                  const durations = getPlanDurations(plan);
                  return (
                  <Card
                    key={plan.id}
                    sx={{
                      width: 260,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      transform: touchedId === plan.id ? 'scale(0.98)' : 'none',
                      boxShadow: touchedId === plan.id ? 1 : 3,
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 6
                      }
                    }}
                    onTouchStart={() => setTouchedId(plan.id)}
                    onTouchEnd={() => setTouchedId(null)}
                  >
                    <CardContent sx={{ p: 1.5, pb: '0 !important' }}>
                      <Typography variant="subtitle1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime /> Total: {durations.total} | Lataif: {durations.lataif} | Muraqbat: {durations.muraqbat}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ 
                      justifyContent: 'space-between', 
                      p: 1,
                      pt: 0,
                      '& button': { 
                        minWidth: 'auto',
                        padding: '4px 8px',
                        fontSize: '0.8rem'
                      }
                    }}>
                      <Button
                        onClick={() => navigate(`/play/${plan.id}`)}
                        sx={{ color: 'primary.main' }}
                      >
                        Start
                      </Button>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          onClick={() => navigate(`/plan/${plan.id}`)}
                          sx={{ color: 'text.secondary' }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDeletePlan(plan.id)}
                          sx={{ color: 'error.main' }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        )}
  
        {/* Default Plans Section */}
        {settings.showDefaultPlans && (
          <Paper sx={{ 
            mt: 4,
            backgroundColor: (theme) => theme.palette.secondary.light + '80', // 50% opacity
            backdropFilter: 'blur(5px)',
            p: 3,
            borderRadius: 4
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Default Plans
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center'
            }}>
              {defaultPlans.map((plan) => {
                const durations = getPlanDurations(plan);
                return (
                  <Card
                  key={plan.id}
                  sx={{
                    width: 260,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    transform: touchedId === plan.id ? 'scale(0.98)' : 'none',
                    boxShadow: touchedId === plan.id ? 1 : 3,
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 6
                    }
                  }}
                  onTouchStart={() => setTouchedId(plan.id)}
                  onTouchEnd={() => setTouchedId(null)}
                >
                  <CardContent sx={{ p: 1, pb: '0 !important' }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime/>Total: {durations.total} | Lataif: {durations.lataif} | Muraqbat {durations.muraqbat}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ 
                    justifyContent: 'space-between', 
                    p: 0.5,
                    px: 1,
                    '& button': { 
                      minWidth: 40,
                      padding: '4px 8px'
                    }
                  }}>
                    <Button
                      size="small"
                      startIcon={<PlayArrow fontSize="small" />}
                      onClick={() => navigate(`/play/${plan.id}`)}
                    >
                      Start
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ContentCopy fontSize="small" />}
                      onClick={() => onClonePlan(plan)}
                    >
                      Clone
                    </Button>
                  </CardActions>
                </Card>
                );
              })}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}