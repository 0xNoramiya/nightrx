import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, FPS } from '../lib/constants';

interface TransitionWipeProps {
  durationInSeconds: number;
}

export const TransitionWipe: React.FC<TransitionWipeProps> = ({ durationInSeconds }) => {
  const frame = useCurrentFrame();
  const totalFrames = durationInSeconds * FPS;

  const fadeOut = interpolate(
    frame,
    [totalFrames - FPS * 0.5, totalFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        opacity: fadeOut,
        pointerEvents: 'none',
      }}
    />
  );
};
