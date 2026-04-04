import { AbsoluteFill } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { NightRxBrand } from '../components/NightRxBrand';
import { TransitionWipe } from '../components/TransitionWipe';
import { COLORS, SCENE_DURATIONS } from '../lib/constants';

export const Scene7Explorer: React.FC = () => (
  <SceneLayout screenshot="explorer-contract.png" audioFile="scene7.mp3" overlay={false}>
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
          maxWidth: 800,
        }}
      >
        <AnimatedText
          text="On-Chain Verification"
          variant="subtitle"
          startAtSecond={0.5}
          color={COLORS.green}
        />
        <AnimatedText
          text="Every TX verifiable on Midnight Preprod Explorer"
          variant="body"
          startAtSecond={2}
          color={COLORS.textMuted}
        />
        <AnimatedText
          text="Medical data is never exposed — only hashed commitments"
          variant="body"
          startAtSecond={4}
          color={COLORS.textMuted}
        />
      </div>
    </AbsoluteFill>
    <TransitionWipe durationInSeconds={SCENE_DURATIONS.scene7Explorer} />
  </SceneLayout>
);
