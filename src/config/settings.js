/* config/settings.js */
export const defaultSettings = {
  userPlans: [],
  showDefaultPlans: true,
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
export const DEFAULT_PLANS = [
  {
    id: 'default-test',
    name: "Test Ziker",
    isDefault: true,
    userLataif: Array.from({ length: 7 }, (_, i) => ({
      id: `L${i + 1}`,
      name: `Latifa ${i + 1}`,
      duration: 2
    })),
    intermediate: { duration: 2, isAuto: false },
    raabta: { duration: 0 },
    muraqbat: [
      { id: 'M1', name: 'Ahdiyat', duration: 4 },
      { id: 'M2', name: 'Maiyyat', duration: 2 },
      { id: 'M3', name: 'Aqrabiyat', duration: 2 },
      { id: 'M4', name: 'Saer-e-Qaba', duration: 2 },
      { id: 'M5', name: 'Roza-e-Athar', duration: 2 },
      { id: 'M6', name: 'Masjid-e-Nabawi', duration: 2 },
    ],
    useStartAudio: true,
    useEndAudio: true
  },
 /* {
    id: 'default-lataif',
    name: "Lataif Ziker",
    isDefault: true,
    userLataif: Array.from({ length: 7 }, (_, i) => ({
      id: `L${i + 1}`,
      name: `Latifa ${i + 1}`,
      duration: 90
    })),
    intermediate: { duration: 30, isAuto: false },
    raabta: { duration: 30 },
    muraqbat: [],
    useStartAudio: true,
    useEndAudio: true
  },
  {
    id: 'default-short',
    name: "Short Ziker",
    isDefault: true,
    userLataif: Array.from({ length: 7 }, (_, i) => ({
      id: `L${i + 1}`,
      name: `Latifa ${i + 1}`,
      duration: 60
    })),
    intermediate: { duration: 20, isAuto: false },
    raabta: { duration: 0 },
    muraqbat: [
      { id: 'M1', name: 'Ahdiyat', duration: 60 },
      { id: 'M2', name: 'Maiyyat', duration: 60 },
      { id: 'M3', name: 'Aqrabiyat', duration: 60 },
      { id: 'M4', name: 'Saer-e-Qaba', duration: 60 },
      { id: 'M5', name: 'Roza-e-Athar', duration: 60 },
      { id: 'M6', name: 'Masjid-e-Nabawi', duration: 60 },
    ],
    useStartAudio: true,
    useEndAudio: true
  },
  {
    id: 'default-regular',
    name: "Regular Ziker",
    isDefault: true,
    userLataif: Array.from({ length: 7 }, (_, i) => ({
      id: `L${i + 1}`,
      name: `Latifa ${i + 1}`,
      duration: 120
    })),
    intermediate: { duration: 40, isAuto: false },
    raabta: { duration: 0 },
    muraqbat: [
      { id: 'M1', name: 'Ahdiyat', duration: 120 },
      { id: 'M2', name: 'Maiyyat', duration: 120 },
      { id: 'M3', name: 'Aqrabiyat', duration: 120 },
      { id: 'M4', name: 'Saer-e-Qaba', duration: 120 },
      { id: 'M5', name: 'Roza-e-Athar', duration: 120 },
      { id: 'M6', name: 'Masjid-e-Nabawi', duration: 180 },
    ],
    useStartAudio: true,
    useEndAudio: true
  },*/
  {
    id: 'default-long',
    name: "Long Ziker",
    isDefault: true,
    userLataif: Array.from({ length: 7 }, (_, i) => ({
      id: `L${i + 1}`,
      name: `Latifa ${i + 1}`,
      duration: 180
    })),
    intermediate: { duration: 40, isAuto: false },
    raabta: { duration: 0 },
    muraqbat: [
      { id: 'M1', name: 'Ahdiyat', duration: 180 },
      { id: 'M2', name: 'Maiyyat', duration: 180 },
      { id: 'M3', name: 'Aqrabiyat', duration: 180 },
      { id: 'M4', name: 'Saer-e-Qaba', duration: 180 },
      { id: 'M5', name: 'Roza-e-Athar', duration: 180 },
      { id: 'M6', name: 'Masjid-e-Nabawi', duration: 180 },
    ],
    useStartAudio: true,
    useEndAudio: true
  }
];

// Maintain original exports for compatibility
export const defaultPlan = DEFAULT_PLANS[0];
export const defaultLataifPlan = DEFAULT_PLANS[1];
export const defaultShortPlan = DEFAULT_PLANS[2];
export const defaultRegularPlan = DEFAULT_PLANS[3];
export const defaultLongPlan = DEFAULT_PLANS[4];