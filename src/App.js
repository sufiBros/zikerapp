import { useState, useEffect } from 'react';
import { CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { loadState, saveState } from './utils/storage';
import { DEFAULT_PLANS, defaultSettings } from './config/settings';
import HomeScreen from './components/Home/HomeScreen';
import PlanEditor from './components/PlanEditor/PlanEditor';
import Settings from './components/Settings/Settings';
import TimerScreen from './components/Timer/TimerScreen';
import defaultBeep from './audio/default_beep.mp3';

export default function App() {
  // Default plans are static and always loaded from settings
  const defaultPlans = DEFAULT_PLANS;

  // Load user plans, migrating old data if necessary
  const [userPlans, setUserPlans] = useState(() => {
    const oldPlans = loadState('zikr-plans'); // Legacy key
    if (oldPlans) {
      // Migrate old data: user plans are non-defaults
      const migratedUserPlans = oldPlans.filter((plan) => !plan.isDefault);
      saveState('zikr-user-plans', migratedUserPlans);
      saveState('zikr-plans', null); // Clear legacy data
      return migratedUserPlans;
    }
    return loadState('zikr-user-plans') || [];
  });

  // Settings with audio initialization
  const [settings, setSettings] = useState(() => {
    const savedSettings = loadState('zikr-settings') || defaultSettings;
    return {
      lataif: [],
      muraqbat: [],
      ...defaultSettings,
      ...savedSettings
    };
  });

  // Save user plans and settings
  useEffect(() => saveState('zikr-user-plans', userPlans), [userPlans]);
  useEffect(() => saveState('zikr-settings', settings), [settings]);

  // Clone a default plan into user plans
  const clonePlan = (defaultPlan) => {
    const newPlan = {
      ...defaultPlan,
      id: `${defaultPlan.id}-copy-${Date.now()}`, // Unique ID
      isDefault: false,
      name: `${defaultPlan.name} (Copy)`,
    };
    setUserPlans((prev) => [...prev, newPlan]);
  };


  // Delete a user plan
  const deleteUserPlan = (planId) => {
    setUserPlans((prev) => prev.filter((plan) => plan.id !== planId));
  };


  //Update a userPlan
  const handleSavePlan = (updatedPlan) => {
    setUserPlans(prev => {
      // Check if this is an existing plan
      const existingIndex = prev.findIndex(p => p.id === updatedPlan.id);
      
      if (existingIndex >= 0) {
        // Update existing plan
        const updated = [...prev];
        updated[existingIndex] = updatedPlan;
        return updated;
      }
      
      // Add new plan
      return [...prev, updatedPlan];
    });
  };

  return (
        <Routes>
          <Route
            path="/"
            element={
              <HomeScreen
                defaultPlans={defaultPlans}
                userPlans={userPlans}
                onClonePlan={clonePlan}
                onDeletePlan={deleteUserPlan}
                settings={settings}
              />
            }
          />
          <Route
            path="/plan/:id"
            element={
              <PlanEditor
                userPlans={userPlans}
                onSavePlan={handleSavePlan}
                settings={settings}
              />
            }
          />
          <Route
            path="/settings"
            element={<Settings settings={settings} setSettings={setSettings} />}
          />
          <Route
          path="/play/:planId" 
          element={
            <TimerScreen
              defaultPlans={defaultPlans}
              userPlans={userPlans}
              settings={settings}
            />
          }
        />
        </Routes>
  );
}