import { AbsoluteFill, Sequence } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { NightRxBrand } from '../components/NightRxBrand';
import { TransitionWipe } from '../components/TransitionWipe';
import { COLORS, FPS, SCENE_DURATIONS } from '../lib/constants';

export const Scene6Pharmacy: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={22 * FPS}>
      <SceneLayout screenshot="pharmacy-verify.png" audioFile="scene6a.mp3">
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
              text="Step 3: Pharmacy"
              variant="caption"
              startAtSecond={0}
              style={{ textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}
            />
            <AnimatedText
              text="Verify On-Chain"
              variant="subtitle"
              startAtSecond={0.5}
            />
            <AnimatedText
              text="Commitment exists · Issuer trusted · Not reused"
              variant="body"
              startAtSecond={3}
              color={COLORS.textMuted}
            />
          </div>
        </AbsoluteFill>
      </SceneLayout>
    </Sequence>

    <Sequence from={22 * FPS} durationInFrames={8 * FPS}>
      <SceneLayout screenshot="pharmacy-verified.png" audioFile="scene6b.mp3" overlay={false}>
        <NightRxBrand />
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AnimatedText
            text="✓ VERIFIED"
            variant="title"
            startAtSecond={0.3}
            fontSize={96}
            color={COLORS.green}
          />
          <AnimatedText
            text="No stigma. No discrimination. No data leaked."
            variant="subtitle"
            startAtSecond={1.5}
            color={COLORS.text}
          />
        </AbsoluteFill>
      </SceneLayout>
    </Sequence>
    <TransitionWipe durationInSeconds={SCENE_DURATIONS.scene6Pharmacy} />
  </AbsoluteFill>
);
