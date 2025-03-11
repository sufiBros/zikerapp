import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  FormControlLabel,
  Switch,
  Card
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
    <Card maxWidth="md" sx={{ p: 4 }}>
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
            label="Enable Starting Dua"
          />
          <Typography variant="body2" color="textSecondary">
            {settings.play_start ? 
              "Starting Dua will play when session begins" : 
              "Starting Dua disabled"
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
            label="Enable Shajrah Recitation"
          />
          <Typography variant="body2" color="textSecondary">
            {settings.play_end ? 
              "Shajrah will play when session completes" : 
              "Shajrah disabled"
            }
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}