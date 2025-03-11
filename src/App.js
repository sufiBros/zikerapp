import { useState, useEffect } from 'react';
import { CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { loadState, saveState } from './utils/storage';
import { 
  defaultPlan, 
  defaultLataifPlan, 
  defaultShortPlan, 
  defaultRegularPlan, 
  defaultLongPlan, 
  defaultSettings 
} from './config/settings';
import HomeScreen from './components/Home/HomeScreen';
import PlanEditor from './components/PlanEditor/PlanEditor';
import Settings from './components/Settings/Settings';
import TimerScreen from './components/Timer/TimerScreen';
import defaultBeep from './audio/default_beep.mp3';

export default function App() {
  // Change this version whenever you update your default plans in code
  const CURRENT_DEFAULT_VERSION = "1.1";
  
  // Get the current default plans from code
  const currentDefaultPlans = [
    defaultPlan,
    defaultLataifPlan,
    defaultShortPlan,
    defaultRegularPlan,
    defaultLongPlan
  ];

  const [plans, setPlans] = useState(() => {
    const savedPlans = loadState('zikr-plans') || [];
    const savedDefaultVersion = loadState('zikr-defaultVersion');

    // If no plans exist, use the current default plans
    if (savedPlans.length === 0) {
      saveState('zikr-defaultVersion', CURRENT_DEFAULT_VERSION);
      return currentDefaultPlans;
    }
    
    // If the saved default version is outdated, update the default plans portion
    if (savedDefaultVersion !== CURRENT_DEFAULT_VERSION) {
      // Assume the first few plans are defaults and user plans follow
      const newPlans = [
        ...currentDefaultPlans, 
        ...savedPlans.slice(currentDefaultPlans.length)
      ];
      saveState('zikr-defaultVersion', CURRENT_DEFAULT_VERSION);
      return newPlans;
    }
    
    // Otherwise, return the saved plans as is
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
