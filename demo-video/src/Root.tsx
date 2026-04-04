import { Composition } from 'remotion';
import { FPS, WIDTH, HEIGHT, TOTAL_DURATION } from './lib/constants';

const Placeholder: React.FC = () => (
  <div style={{ flex: 1, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <h1 style={{ color: 'white', fontSize: 60, fontFamily: 'sans-serif' }}>NightRx Demo</h1>
  </div>
);

export const Root: React.FC = () => (
  <>
    <Composition
      id="NightRxDemo"
      component={Placeholder}
      durationInFrames={TOTAL_DURATION * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
