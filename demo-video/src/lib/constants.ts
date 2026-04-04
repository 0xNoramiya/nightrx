// demo-video/src/lib/constants.ts
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SCENE_DURATIONS = {
  scene1Problem: 15,
  scene2HowItWorks: 15,
  scene3Connect: 10,
  scene4Clinic: 35,
  scene5Patient: 35,
  scene6Pharmacy: 30,
  scene7Explorer: 15,
  scene8Closing: 15,
} as const;

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

export const COLORS = {
  brand: '#6366f1',
  brandDark: '#4338ca',
  bg: '#0f172a',
  bgOverlay: 'rgba(15, 23, 42, 0.75)',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  green: '#10b981',
  amber: '#f59e0b',
};
