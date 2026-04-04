import { Composition } from 'remotion';
import { FPS, WIDTH, HEIGHT, TOTAL_DURATION } from './lib/constants';
import { Video } from './Video';

export const Root: React.FC = () => (
  <>
    <Composition
      id="NightRxDemo"
      component={Video}
      durationInFrames={TOTAL_DURATION * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
