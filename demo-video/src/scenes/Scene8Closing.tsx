import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { COLORS, FPS, SCENE_DURATIONS } from '../lib/constants';

export const Scene8Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const logoScale = interpolate(frame, [0, FPS * 1], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <SceneLayout audioFile="scene8.mp3">
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          background: `radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, ${COLORS.bg} 70%)`,
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale})`,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 36,
              fontWeight: 800,
              fontFamily: 'sans-serif',
            }}
          >
            Rx
          </div>
          <span
            style={{
              color: COLORS.text,
              fontSize: 64,
              fontWeight: 800,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: -2,
            }}
          >
            NightRx
          </span>
        </div>

        <AnimatedText
          text="Prove eligibility, not your diagnosis."
          variant="subtitle"
          startAtSecond={1}
          color={COLORS.brand}
          style={{ fontStyle: 'italic' }}
        />

        <div style={{ display: 'flex', gap: 40, marginTop: 40 }}>
          {['Compact Smart Contracts', 'Halo 2 ZK Proofs', 'Midnight Blockchain'].map(
            (tech, i) => (
              <AnimatedText
                key={tech}
                text={tech}
                variant="caption"
                startAtSecond={3 + i * 1}
              />
            ),
          )}
        </div>

        <AnimatedText
          text="Built for Midnight Healthcare Track"
          variant="caption"
          startAtSecond={7}
          color={COLORS.textMuted}
          style={{ marginTop: 60 }}
        />
      </AbsoluteFill>
    </SceneLayout>
  );
};
