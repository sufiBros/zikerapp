import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

export default function Settings({ settings, setSettings }) {
  const navigate = useNavigate();

  const toggleAudio = (type) => {
    setSettings(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 4 }}
      >
        Back to Home
      </Button>

      <Typography variant="h4" gutterBottom>
        Application Settings
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Start Audio Section */}
        <Box sx={{ flex: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.play_start}
                onChange={() => toggleAudio('play_start')}
              />
            }
            label="Enable Start Audio"
          />
          <Typography variant="body2" color="textSecondary">
            {settings.audio.start.enabled ? 
              "Start audio will play when session begins" : 
              "Start audio disabled"
            }
          </Typography>
        </Box>

        {/* End Audio Section */}
        <Box sx={{ flex: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.play_end}
                onChange={() => toggleAudio('play_end')}
              />
            }
            label="Enable End Audio"
          />
          <Typography variant="body2" color="textSecondary">
            {settings.audio.end.enabled ? 
              "End audio will play when session completes" : 
              "End audio disabled"
            }
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}