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
import { PlayArrow, Pause, SkipNext, SkipPrevious, ArrowBack,AccessTime } from '@mui/icons-material';
import defaultBeep from '../../audio/default_beep.mp3';
import { Howl, Howler } from 'howler';

export default function TimerScreen({ defaultPlans = [], userPlans = [], settings = {} }) {
  const { planId } = useParams();
  const navigate = useNavigate();
  const plan = [...userPlans,...defaultPlans].find(plan => plan.id == planId);
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
      Howler.stop();
      releaseWakeLock();
      navigate('/');
    }
  };

  // Confirmation dialog actions
  const handleConfirmNavigation = () => {
    setIsRunning(false);
    setIsStarting(false);
    setShowConfirmDialog(false);
    Howler.stop();
    releaseWakeLock();
    navigate('/');
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
  };

  // Sequence generation
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

  // Progress calculations
  const totalDuration = useMemo(() => 
  sequence.reduce((sum, item) => sum + item.duration, 0), 
  [sequence]
);

const totalRemainingTime = useMemo(() => {
  if (currentInterval >= sequence.length) return 0;
  
  const validFutureSteps = sequence
    .slice(currentInterval + 1)
    .filter(step => step.duration > 0);
  
  return timeLeft + 
    validFutureSteps.reduce((sum, step) => sum + step.duration, 0);
}, [currentInterval, sequence, timeLeft]);

  const progress = useMemo(() => {
    const currentStep = sequence[currentInterval];
    if (!currentStep || currentStep.duration <= 0) return 0;
    return ((currentStep.duration - timeLeft) / currentStep.duration) * 100;
  }, [currentInterval, sequence, timeLeft]);

  const getAudioSource = (audioId) => {
    try {
      return require(`../../audio/${audioId}.mp3`);
    } catch {
      return defaultBeep;
    }
  };

  const playAudio = (audioId, onEnd) => {
    const audioSource = getAudioSource(audioId);
    
    Howler.stop();
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
            // This is the crucial change - update currentInterval even when ending naturally
            setCurrentInterval(nextInterval);
            if(settings.play_end) {
              setIsStarting(false);
              setIsRunning(false);
              playAudio(settings.audio.end || 'end', () => {
              });
            } else {
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

  useEffect(() => {
    return () => {
      releaseWakeLock();
      Howler.unload();
    };
  }, []);

  const formatMinutes = (seconds) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0')
    ].join(':');
  };

  const handleSkip = () => {
    if (currentInterval < sequence.length) {
      const nextInterval = currentInterval + 1;

      if (nextInterval < sequence.length) {
        setCurrentInterval(nextInterval);
        setTimeLeft(sequence[nextInterval].duration);
        playAudio(sequence[nextInterval]?.audioId || 'default_beep');
        if (!isRunning) setIsRunning(true);
      } else {
        setCurrentInterval(nextInterval);
        setIsRunning(false);
        setIsStarting(false);
        if (settings.play_end) {
          playAudio(settings.audio.end || 'end');
        }
      }
    }
  };

  const handleSkipBack = () => {
    if (currentInterval > 0) {
      const prevInterval = currentInterval - 1;
      setCurrentInterval(prevInterval);
      setTimeLeft(sequence[prevInterval].duration);
      playAudio(sequence[prevInterval].audioId);
      if (!isRunning) setIsRunning(true);
    }
  };

  const completionText = `
آمین
الحمدُ لِلّٰهِ رَبِّ العٰلَمینَ
الٰہی بحرمتِ حضرتِ محمّدٍ صلّی اللّٰہُ علیہِ وآلہِ وسلّم
الٰہی بحرمتِ حضرتِ أبو بکرٍ صدیقٍ رضی اللّٰہُ عنہُ
الٰہی بحرمتِ حضرتِ امامِ حسنٍ بصریٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ حضرتِ داؤدٍ طائیٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ حضرتِ جنیدٍ بغدادیٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ حضرتِ عبیدُ اللّٰہِ أحرارٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ حضرتِ مولانا عبدُ الرّحمٰنِ جامیٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ حضرتِ أبو أیّوب محمّدٍ صالحٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ حضرتِ سلطانِ العارفین خواجہ اللّٰہُ دینِ مدنیٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ حضرتِ عبدُ الرّحیمِ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ قلزمِ فیوضاتِ حضرتِ مولانا اللّٰہُ یار خانٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ قاسمِ فیوضاتِ حضرتِ مولانا أمیرُ محمّدٍ أکرم أعوانٍ رحمۃُ اللّٰہِ علیہِ
الٰہی بحرمتِ ختمِ خواجگانِ خاتمۂ من و خاتمۂ حضرتِ أمیرُ عبدُ القدیرِ أعوان مدّ ظلّہُ العالی بخیر گردان

وصَلّی اللّٰہُ تعالیٰ علیٰ حبیبہِ محمّدٍ وعلیٰ آلہِ وصحبہِ أجمعین برحمتکَ یا أرحمَ الرّاحمین
`;

  if (!plan) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Plan not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Return Home
        </Button>
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
          mb: 4,
          position: 'relative'
        }}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {plan.name} Session
          </Typography>
           {/* Total Remaining Badge */}
    <Paper 
      elevation={1} 
      sx={{ 
        bgcolor: 'primary.light', 
        px: 1.5, 
        py: 0.5, 
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          fontWeight: 'large', 
          color: 'common.white',
          lineHeight: 1 
        }}
      >
        Est: {formatTime(totalRemainingTime)}
      </Typography>
    </Paper>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onClose={handleCancelNavigation}>
          <DialogTitle>Confirm Navigation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to leave? The current session will be aborted.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelNavigation}>Cancel</Button>
            <Button onClick={handleConfirmNavigation} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {currentInterval < sequence.length ? (
          <>
            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
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
                {formatMinutes(timeLeft)}
              </Typography>

              <LinearProgress 
                variant="determinate" 
                value={progress}
                sx={{ height: 10, width: '80%', borderRadius: 5 }}
              />
            </Box>
            <Typography variant="h6" color="textSecondary">
              Next: {sequence[currentInterval + 1]?.name || 'Session Complete'}
            </Typography>
          </>
        ) : (
          <Box sx={{ 
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography 
              variant="h5" 
              component="div"
              sx={{ 
                whiteSpace: 'pre-line',
                textAlign: 'center',
                fontFamily: "'Noto Naskh Arabic', serif",
                lineHeight: 2,
                fontSize: '1.4rem',
                direction: 'rtl'
              }}
            >
              {completionText}
            </Typography>
          </Box>
        )}

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          {currentInterval < sequence.length ? (
            <>
              <IconButton 
                color="secondary" 
                size="large"
                sx={{ fontSize: '3rem' }}
                onClick={handleSkipBack}
                disabled={currentInterval <= 0}
              >
                <SkipPrevious fontSize="inherit" />
              </IconButton>

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
                disabled={currentInterval >= sequence.length}
              >
                <SkipNext fontSize="inherit" />
              </IconButton>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleBack}
              sx={{ fontSize: '1.5rem', mt: 3 }}
            >
              End Session
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}