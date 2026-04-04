import { useCurrentFrame, interpolate } from 'remotion';
import { COLORS, FPS } from '../lib/constants';

export const NightRxBrand: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const frame = useCurrentFrame();
  const opacity = show
    ? interpolate(frame, [0, FPS * 0.5], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: 50,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandDark})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 20,
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        Rx
      </div>
      <span
        style={{
          color: COLORS.text,
          fontSize: 28,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: -0.5,
        }}
      >
        NightRx
      </span>
    </div>
  );
};
