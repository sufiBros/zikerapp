export const defaultSettings = {
    lataif: Array.from({ length: 7 }, (_, i) => ({
      id: `L${i + 1}`,
      name: `Latifa ${i + 1}`,
      audio: `L${i + 1}`,
      defaultDuration: 60
    })),
    muraqbat: [
        { id: 'M1', name: 'Ahdiyat', audio: 'm1', defaultDuration: 60 },
        { id: 'M2', name: 'Maiyyat', audio: 'm2', defaultDuration: 60 },
        { id: 'M3', name: 'Aqrabiyat', audio: 'm3', defaultDuration: 60 },
        { id: 'M4', name: 'Saer-e-Qaba', audio: 'm4', defaultDuration: 60 },
        { id: 'M5', name: 'Roza-e-Athar', audio: 'm5', defaultDuration: 60 },
        { id: 'M6', name: 'Masjid-e-Nabawi', audio: 'm6', defaultDuration: 60 },
    ],
    audio: {
        start: 'start',
        end: 'end',
        raabta: 'r',
      },
    play_start: true,
    play_end:true
  };

  // In config/settings.js
export const defaultPlan = {
    name: "Testing Ziker (15 Seconds)",
    userLataif: Array.from({ length: 7 }, (_, i) => ({
      id: `L${i + 1}`,
      name: `Latifa ${i + 1}`,
      duration: 2
    })),
    intermediate: { duration: 2, isAuto: false },
    raabta: { duration: 10 },
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
  };