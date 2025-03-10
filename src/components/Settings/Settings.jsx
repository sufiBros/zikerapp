import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Input,
  IconButton
} from '@mui/material';
import { Upload as UploadIcon, ArrowBack, Delete } from '@mui/icons-material';

export default function Settings({ settings, setSettings }) {
  const navigate = useNavigate();

  const updateAudio = (type, files) => {
    setSettings(prev => ({
      ...prev,
      audio: {
        ...prev.audio,
        [type]: files.map(file => ({
          id: file.name,
          name: file.name.replace(/\.[^/.]+$/, ""),
          file: URL.createObjectURL(file)
        }))
      }
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
          <Typography variant="h6" gutterBottom>
            Start Audio
          </Typography>
          <Input
            accept="audio/*"
            id="start-audio-upload"
            type="file"
            onChange={e => updateAudio('start', Array.from(e.target.files))}
            sx={{ display: 'none' }}
          />
          <label htmlFor="start-audio-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Upload Start Audio
            </Button>
          </label>
          
          <List dense sx={{ mt: 2 }}>
            {settings.audio.start.map(audio => (
              <ListItem
                key={audio.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText primary={audio.name} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* End Audio Section */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            End Audio
          </Typography>
          <Input
            accept="audio/*"
            id="end-audio-upload"
            type="file"
            onChange={e => updateAudio('end', Array.from(e.target.files))}
            sx={{ display: 'none' }}
          />
          <label htmlFor="end-audio-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Upload End Audio
            </Button>
          </label>
          
          <List dense sx={{ mt: 2 }}>
            {settings.audio.end.map(audio => (
              <ListItem
                key={audio.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText primary={audio.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Container>
  );
}