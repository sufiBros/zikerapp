import { useState, useEffect } from 'react';
import { CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { loadState, saveState } from './utils/storage';
import { defaultSettings } from './config/settings';
import HomeScreen from './components/Home/HomeScreen';
import PlanEditor from './components/PlanEditor/PlanEditor';
import Settings from './components/Settings/Settings';
import TimerScreen from './components/Timer/TimerScreen';
import defaultBeep from './audio/default_beep.mp3';
import { defaultPlan } from './config/settings';
export default function App() {
  const [plans, setPlans] = useState(() => {
    const savedPlans = loadState('zikr-plans') || [];
    
    // Create default plan if no plans exist
    if (savedPlans.length === 0) {
      return [{
        name: "Testing Plan (15 Seconds)",
        userLataif: Array.from({ length: 7 }, (_, i) => ({
          id: `L${i + 1}`,
          name: `Latifa ${i + 1}`,
          duration: 2
        })),
        intermediate: { duration: 1, isAuto: false },
        raabta: { duration: 0 },
        muraqbat: [
          { id: 'M1', name: 'Ahdiyat', duration: 2 },
          { id: 'M2', name: 'Maiyyat', duration: 2 },
          { id: 'M3', name: 'Aqrabiyat', duration: 2 },
          { id: 'M4', name: 'Saer-e-Qaba', duration: 2 },
          { id: 'M5', name: 'Roza-e-Athar', duration: 2 },
          { id: 'M6', name: 'Masjid-e-Nabawi', duration: 2 },
        ],
        useStartAudio: true,
        useEndAudio: true
      }];
    }
    
    return savedPlans;
  });
  const [settings, setSettings] = useState(() => {
    const savedSettings = loadState('zikr-settings') || defaultSettings;
    // Initialize default audio if missing
    if (!savedSettings.audio.start.length) {
      return {
        ...savedSettings,
        audio: {
          start: [{ id: 'default', name: 'Default Beep', file: defaultBeep }],
          end: [{ id: 'default', name: 'Default Beep', file: defaultBeep }]
        }
      };
    }
    return savedSettings;
  });

  // Persist data to localStorage
  useEffect(() => {
    saveState('zikr-plans', plans);
    saveState('zikr-settings', settings);
  }, [plans, settings]);

  // Separate effect for audio initialization
  useEffect(() => {
    const initializeAudio = () => {
      setSettings(prev => {
        // Only update if audio settings are empty
        if (prev.audio.start.length === 0 || prev.audio.end.length === 0) {
          return {
            ...prev,
            audio: {
              start: [{ id: 'default', name: 'Default Beep', file: defaultBeep }],
              end: [{ id: 'default', name: 'Default Beep', file: defaultBeep }]
            }
          };
        }
        return prev;
      });
    };

    initializeAudio();
  }, []); // Empty dependency array ensures this runs only once

  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<HomeScreen plans={plans} setPlans={setPlans} />} />
          <Route 
            path="/plan/:index" 
            element={<PlanEditor plans={plans} setPlans={setPlans} settings={settings} />}
          />
          <Route 
            path="/settings" 
            element={<Settings settings={settings} setSettings={setSettings} />}
          />
          <Route 
  path="/play/:planId" 
  element={<TimerScreen plans={plans} settings={settings} />}
/>
        </Routes>
      </Container>
    </Router>
  );
}