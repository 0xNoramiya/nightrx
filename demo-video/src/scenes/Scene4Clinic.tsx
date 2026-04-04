import { AbsoluteFill, Sequence } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { NightRxBrand } from '../components/NightRxBrand';
import { TransitionWipe } from '../components/TransitionWipe';
import { COLORS, FPS, SCENE_DURATIONS } from '../lib/constants';

export const Scene4Clinic: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={17 * FPS}>
      <SceneLayout screenshot="clinic-register.png" audioFile="scene4a.mp3">
        <NightRxBrand />
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 80px 80px 80px',
          }}
        >
          <div
            style={{
              background: COLORS.bgOverlay,
              backdropFilter: 'blur(20px)',
              borderRadius: 20,
              padding: '30px 40px',
              maxWidth: 700,
            }}
          >
            <AnimatedText
              text="Step 1: Clinic"
              variant="caption"
              startAtSecond={0}
              style={{ textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}
            />
            <AnimatedText
              text="Register as Trusted Issuer"
              variant="subtitle"
              startAtSecond={0.5}
            />
            <AnimatedText
              text="ZK proof verifies clinic's private key on-chain"
              variant="body"
              startAtSecond={3}
              color={COLORS.textMuted}
            />
          </div>
        </AbsoluteFill>
      </SceneLayout>
    </Sequence>

    <Sequence from={17 * FPS} durationInFrames={18 * FPS}>
      <SceneLayout screenshot="clinic-issue.png" audioFile="scene4b.mp3">
        <NightRxBrand />
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 80px 80px 80px',
          }}
        >
          <div
            style={{
              background: COLORS.bgOverlay,
              backdropFilter: 'blur(20px)',
              borderRadius: 20,
              padding: '30px 40px',
              maxWidth: 700,
            }}
          >
            <AnimatedText
              text="Issue Credential"
              variant="subtitle"
              startAtSecond={0.5}
            />
            <AnimatedText
              text="Only a hash goes on-chain — no medical data exposed"
              variant="body"
              startAtSecond={3}
              color={COLORS.textMuted}
            />
          </div>
        </AbsoluteFill>
      </SceneLayout>
    </Sequence>
    <TransitionWipe durationInSeconds={SCENE_DURATIONS.scene4Clinic} />
  </AbsoluteFill>
);
