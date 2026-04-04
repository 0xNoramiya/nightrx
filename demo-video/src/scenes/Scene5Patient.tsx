import { AbsoluteFill, Sequence } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { NightRxBrand } from '../components/NightRxBrand';
import { TransitionWipe } from '../components/TransitionWipe';
import { COLORS, FPS, SCENE_DURATIONS } from '../lib/constants';

export const Scene5Patient: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={15 * FPS}>
      <SceneLayout screenshot="patient-import.png" audioFile="scene5.mp3">
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
              text="Step 2: Patient"
              variant="caption"
              startAtSecond={0}
              style={{ textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}
            />
            <AnimatedText
              text="Import & Generate ZK Proof"
              variant="subtitle"
              startAtSecond={0.5}
            />
            <AnimatedText
              text="&quot;I'm eligible for this medication&quot; — nothing more"
              variant="body"
              startAtSecond={3}
              color={COLORS.textMuted}
            />
          </div>
        </AbsoluteFill>
      </SceneLayout>
    </Sequence>

    <Sequence from={15 * FPS} durationInFrames={20 * FPS}>
      <SceneLayout screenshot="patient-proof.png" overlay={false}>
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
              text="Zero-Knowledge Proof Generated"
              variant="subtitle"
              startAtSecond={0.5}
              color={COLORS.green}
            />
            <AnimatedText
              text="Diagnosis never leaves the patient's device"
              variant="body"
              startAtSecond={2}
              color={COLORS.textMuted}
            />
          </div>
        </AbsoluteFill>
      </SceneLayout>
    </Sequence>
    <TransitionWipe durationInSeconds={SCENE_DURATIONS.scene5Patient} />
  </AbsoluteFill>
);
