import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { NightRxBrand } from '../components/NightRxBrand';
import { TransitionWipe } from '../components/TransitionWipe';
import { COLORS, FPS, SCENE_DURATIONS } from '../lib/constants';

const steps = [
  { icon: '🏥', label: 'Clinic issues credential', delay: 2 },
  { icon: '🔐', label: 'Patient generates ZK proof', delay: 5 },
  { icon: '💊', label: 'Pharmacy verifies on-chain', delay: 8 },
];

export const Scene2HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneLayout screenshot="landing-howitworks.png" audioFile="scene2.mp3">
      <NightRxBrand />
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 150px',
        }}
      >
        <AnimatedText
          text="How NightRx Works"
          variant="title"
          startAtSecond={0}
          style={{ marginBottom: 60 }}
        />
        <div style={{ display: 'flex', gap: 80 }}>
          {steps.map((step, i) => {
            const startFrame = step.delay * FPS;
            const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const scale = interpolate(frame, [startFrame, startFrame + 15], [0.8, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={i}
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 24,
                    background: 'rgba(99,102,241,0.15)',
                    border: `2px solid ${COLORS.brand}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    color: COLORS.text,
                    fontSize: 24,
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    textAlign: 'center',
                    maxWidth: 200,
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <TransitionWipe durationInSeconds={SCENE_DURATIONS.scene2HowItWorks} />
    </SceneLayout>
  );
};
