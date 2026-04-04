import { useCurrentFrame, interpolate } from 'remotion';
import { FPS, COLORS } from '../lib/constants';

interface AnimatedTextProps {
  text: string;
  startAtSecond?: number;
  fontSize?: number;
  color?: string;
  style?: React.CSSProperties;
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  title: { fontSize: 72, fontWeight: 800, letterSpacing: -2 },
  subtitle: { fontSize: 42, fontWeight: 600, letterSpacing: -0.5 },
  body: { fontSize: 32, fontWeight: 400, lineHeight: 1.6 },
  caption: { fontSize: 24, fontWeight: 500, color: COLORS.textMuted },
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  startAtSecond = 0,
  fontSize,
  color = COLORS.text,
  style,
  variant = 'body',
}) => {
  const frame = useCurrentFrame();
  const startFrame = startAtSecond * FPS;

  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [startFrame, startFrame + 15], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        color,
        opacity,
        transform: `translateY(${y}px)`,
        ...VARIANT_STYLES[variant],
        ...(fontSize ? { fontSize } : {}),
        ...style,
      }}
    >
      {text}
    </div>
  );
};
