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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import { PlayArrow, Edit, Delete, Settings, Add, ContentCopy, AccessTime } from '@mui/icons-material';

export default function HomeScreen({ 
  defaultPlans,
  userPlans,
  onClonePlan,
  onDeletePlan,
  settings 
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [touchedId, setTouchedId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  // Section header component with count badge
  const SectionHeader = ({ title, count, color = 'primary' }) => (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2,
      p: 1,
      bgcolor: (theme) => theme.palette[color].light + '80',
      borderRadius: 2
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Badge
        badgeContent={count}
        color={color}
        showZero
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.8rem',
            minWidth: 24,
            height: 24,
            borderRadius: 12,
            padding: '0 8px',
            position: 'static',
            transform: 'none',
          }
        }}
      />
    </Box>
  );

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

  const handleClonePlan = (plan) => {
    onClonePlan(plan);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ position: 'relative', pb: 3 }}>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletePlanId(null);
        }}
      >
        <DialogTitle>Delete Plan?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this plan? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onDeletePlan(deletePlanId);
              setDeleteDialogOpen(false);
            }}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Top Image */}
      <Box sx={{ position: 'relative' }}>
        <img
          src="app.png"
          alt="Header"
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Ziker Qalbi Plans
          </Typography>
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            flexDirection: 'row',
            justifyContent: 'center',
            '& > *': {
              flexShrink: 1,
              minWidth: 'fit-content'
            }
          }}>
            <Button
              variant="contained"
              onClick={() => navigate('/plan/new')}
              startIcon={<Add />}
              sx={{ 
                fontSize: '1.1rem',
                borderRadius: 2,
                px: 3,
                whiteSpace: 'nowrap'
              }}
            >
              Create New Plan
            </Button>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => navigate('/settings')}
              sx={{ 
                fontSize: '1.1rem',
                borderRadius: 2,
                px: 3,
                whiteSpace: 'nowrap'
              }}
            >
              Settings
            </Button>
          </Box>
        </Box>

        {/* User Plans Section */}
        <Paper sx={{ 
          mb: 3,
          borderRadius: 4,
          bgcolor: (theme) => theme.palette.primary.light + '80',
          backdropFilter: 'blur(5px)',
          p: 2
        }}>
          <SectionHeader 
            title="Your Plans" 
            count={userPlans.length} 
            color="primary"
          />
          
          {userPlans.length === 0 ? (
            <Typography variant="body1" color="textSecondary" align="center">
              You have no plans yet. Tap "Create New Plan" or copy a default plan below to get started.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
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
                      '&:active': { transform: 'scale(0.98)' }
                    }}
                    onTouchStart={() => setTouchedId(plan.id)}
                    onTouchEnd={() => setTouchedId(null)}
                  >
                    <CardContent sx={{ p: 1.5, pb: '0 !important', position: 'relative' }}>
                      {/* Total Time Badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'secondary.main',
                        color: 'white',
                        px: 1.2,
                        borderRadius: 2,
                        fontSize: '0.8rem'
                      }}>
                        <AccessTime fontSize="inherit" />
                        <span>{durations.total}</span>
                      </Box>
                      
                      <Typography variant="subtitle1" sx={{ 
                        fontSize: '1rem',
                        mb: 0.5,
                        pr: 4
                      }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        Lataif: {durations.lataif} | Muraqbat: {durations.muraqbat}
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
                      <Tooltip title="Start this plan" arrow>
                        <Button
                          size="small"
                          startIcon={<PlayArrow fontSize="small" />}
                          onClick={() => navigate(`/play/${plan.id}`)}
                        >
                          Start
                        </Button>
                      </Tooltip>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit this plan" arrow>
                          <Button
                            size="small"
                            startIcon={<Edit fontSize="small" />}
                            onClick={() => navigate(`/plan/${plan.id}`)}
                            sx={{ color: 'text.secondary' }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete this plan" arrow>
                          <Button
                            size="small"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => {
                              setDeletePlanId(plan.id);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </Card>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* Default Plans Section */}
        {settings.showDefaultPlans && (
          <Paper sx={{ 
            mb: 3,
            borderRadius: 4,
            backgroundColor: (theme) => theme.palette.secondary.light + '80',
            backdropFilter: 'blur(5px)',
            p: 2
          }}>
            <SectionHeader 
              title="Default Plans" 
              count={defaultPlans.length} 
              color="secondary"
            />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Tap "Copy & Customize" to quickly create your own plan based on this template.
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
                      '&:active': { transform: 'scale(0.98)' }
                    }}
                    onTouchStart={() => setTouchedId(plan.id)}
                    onTouchEnd={() => setTouchedId(null)}
                  >
                    <CardContent sx={{ p: 1, pb: '0 !important', position: 'relative' }}>
                      {/* Total Time Badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1.2,
                        borderRadius: 2,
                        fontSize: '0.8rem'
                      }}>
                        <AccessTime fontSize="inherit" />
                        <span>{durations.total}</span>
                      </Box>
                      
                      <Typography variant="subtitle1" noWrap sx={{ 
                        fontSize: '0.9rem',
                        mb: 0.5,
                        pr: 4
                      }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        Lataif: {durations.lataif} | Muraqbat: {durations.muraqbat}
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
                      <Tooltip title="Start this template" arrow>
                        <Button
                          size="small"
                          startIcon={<PlayArrow fontSize="small" />}
                          onClick={() => navigate(`/play/${plan.id}`)}
                        >
                          Start
                        </Button>
                      </Tooltip>
                      <Tooltip title="Make your own version" arrow>
                        <Button
                          size="small"
                          startIcon={<ContentCopy fontSize="small" />}
                          onClick={() => handleClonePlan(plan)}
                          sx={{ fontWeight: 600 }}
                        >
                          Copy & Customize
                        </Button>
                      </Tooltip>
                    </CardActions>
                  </Card>
                );
              })}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Snackbar for Copy Confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Plan copied to Your Plans successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}