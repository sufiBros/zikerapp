import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { PlayArrow, Pause, SkipNext, ArrowBack } from '@mui/icons-material';
import defaultBeep from '../../audio/default_beep.mp3';
import { Howl, Howler } from 'howler';

export default function TimerScreen({ plans, settings }) {
  const { planId } = useParams();
  const navigate = useNavigate();
  const plan = plans[planId];
  const [isRunning, setIsRunning] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const audioRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Wake Lock handling
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Screen Wake Lock released');
        });
      }
    } catch (err) {
      console.error('Error requesting wake lock:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };


  // Back button handling
  const handleBack = () => {
    if (isRunning || isStarting) {
      setShowConfirmDialog(true);
    } else {
      navigate('/');
    }
  };

  // Confirmation dialog actions
  const handleConfirmNavigation = () => {
    setIsRunning(false);
    setIsStarting(false);
    setShowConfirmDialog(false);
    Howler.stop();
    navigate('/');
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
  };

  // Sequence generation (unchanged)
  const sequence = useMemo(() => {
    if (!plan) return [];
    
    const seq = [];
    
    // User Lataif
    seq.push(...(plan.userLataif?.map(l => {
      const latifaConfig = settings.lataif.find(lc => lc.id === l.id);
      return {
        type: 'latifa',
        name: l.name,
        duration: l.duration,
        audioId: latifaConfig?.audio || 'default_beep'
      };
    }) || []));

    // Repeat 1st Latifa
    if (plan.userLataif?.length > 0) {
      const firstLatifa = settings.lataif.find(l => l.id === plan.userLataif[0].id);
      seq.push({
        type: 'repeat',
        name: `Repeat ${plan.userLataif[0].name}`,
        duration: plan.intermediate?.duration || 60,
        audioId: firstLatifa?.audio || 'default_beep'
      });
    }

    // Raabta with helper text logic
    if (plan.userLataif?.length === 7 && plan.raabta) {
      if (plan.raabta.duration > 0) {
        seq.push({
          type: 'raabta',
          name: 'Raabta',
          duration: plan.raabta.duration,
          audioId: settings.audio.raabta || 'default_beep'
        });
      }
      // Don't add anything if duration is 0
    }

    // Muraqbat
    seq.push(...(plan.muraqbat?.map(m => {
      const muraqbaConfig = settings.muraqbat.find(mc => mc.id === m.id);
      return {
        type: 'muraqba',
        name: m.name,
        duration: m.duration,
        audioId: muraqbaConfig?.audio || 'default_beep'
      };
    }) || []));

    return seq;
  }, [plan, settings]);

  // Add missing progress calculations
  const totalDuration = useMemo(() => 
    sequence.reduce((sum, item) => sum + item.duration, 0), 
    [sequence]
  );

  const progress = useMemo(() => 
    totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0, 
    [totalDuration, timeLeft]
  );

  const getAudioSource = (audioId) => {
    const allAudios = [
      ...settings.audio.start,
      ...settings.audio.end,
      ...settings.lataif,
      ...settings.muraqbat
    ];
    
    const foundAudio = allAudios.find(a => a.audio === audioId);
    if (foundAudio?.file) return foundAudio.file;

    try {
      return require(`../../audio/${audioId}.mp3`);
    } catch {
      return defaultBeep;
    }
  };

  const playAudio = (audioId, onEnd) => {
    const audioSource = getAudioSource(audioId);
    
    Howler.stop(); // Stop any existing audio

    const sound = new Howl({
      src: [audioSource],
      html5: true,
      onend: onEnd,
      onplayerror: () => {
        sound.once('unlock', () => sound.play());
      }
    });

    sound.play();
    return sound;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  const handlePlayPause = async () => {
    if (!isRunning && !isStarting) {
      setIsStarting(true);
      
      try {
        await requestWakeLock();
        console.log("")
        if(settings.play_start){
          playAudio(settings.audio.start || 'start', () => {
            setIsStarting(false);
            setIsRunning(true);
            // Start first interval audio after start audio
            playAudio(sequence[currentInterval]?.audioId || 'default_beep');
          });}else{
            setIsStarting(false);
            setIsRunning(true);
            playAudio(sequence[currentInterval]?.audioId || 'default_beep');
          }
        }catch (error) {
          console.error('Error starting session:', error);
          setIsStarting(false);
        }
    } else {
      setIsRunning(false);
      setIsStarting(false);
      Howler.stop();
      releaseWakeLock();
    }
  };

  useEffect(() => {
    if (isRunning && sequence.length > 0 && currentInterval < sequence.length) {
      setTimeLeft(sequence[currentInterval].duration);
    }
  }, [currentInterval, sequence, isRunning]);

  useEffect(() => {
  let timer;
  
  if (isRunning && timeLeft > 0) {
    timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          let nextInterval = currentInterval + 1;
          
          // Skip any intervals with 0 duration
          while (nextInterval < sequence.length && sequence[nextInterval].duration <= 0) {
            nextInterval++;
          }

          if (nextInterval < sequence.length) {
            setCurrentInterval(nextInterval);
            playAudio(sequence[nextInterval]?.audioId || 'default_beep');
          } else {
            if(settings.play_end){
            playAudio(settings.audio.end || 'end', () => {  setIsRunning(false);})}else{
              setIsRunning(false);
            }
          
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }

  return () => clearInterval(timer);
}, [isRunning, timeLeft, currentInterval, sequence, settings.audio.end]);

 // Cleanup on unmount
 useEffect(() => {
  return () => {
    releaseWakeLock();
    Howler.unload();
  };
}, []);

  // Add formatTime function
  const formatTime = (seconds) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkip = () => {
    if (currentInterval < sequence.length - 1) {
      const nextInterval = currentInterval + 1;
      setCurrentInterval(nextInterval);
      if(!isRunning){
        setIsRunning(true);
      }
      setTimeLeft(sequence[nextInterval].duration);
      playAudio(sequence[nextInterval]?.audioId || 'default_beep');
    }
  };

  if (!plan) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Plan not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {/* Back Button Header */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {plan.name} Session
          </Typography>
          <div style={{ width: 48 }} /> {/* Spacer for alignment */}
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onClose={handleCancelNavigation}>
          <DialogTitle>Confirm Navigation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to leave? The current session will be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelNavigation}>Cancel</Button>
            <Button onClick={handleConfirmNavigation} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          {sequence[currentInterval]?.name || 'Session Complete'}
          {sequence[currentInterval]?.duration === 0 && ' (Skipped)'}
        </Typography>

        <Box sx={{ 
          height: 200,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          mb: 4
        }}>
          <Typography variant="h1" component="div" sx={{ fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{ 
              height: 10,
              width: '80%',
              borderRadius: 5
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <IconButton 
            color="primary" 
            size="large"
            sx={{ fontSize: '3rem' }}
            onClick={handlePlayPause}
            disabled={isStarting}
          >
            {isStarting ? (
              <Pause fontSize="inherit" />
            ) : isRunning ? (
              <Pause fontSize="inherit" />
            ) : (
              <PlayArrow fontSize="inherit" />
            )}
          </IconButton>
          
          <IconButton 
            color="secondary" 
            size="large"
            sx={{ fontSize: '3rem' }}
            onClick={handleSkip}
            disabled={currentInterval >= sequence.length - 1}
          >
            <SkipNext fontSize="inherit" />
          </IconButton>
        </Box>

        <Typography variant="h6" color="textSecondary">
          Next: {sequence[currentInterval + 1]?.name || 'Session Complete'}
        </Typography>
      </Paper>
    </Container>
  );
}