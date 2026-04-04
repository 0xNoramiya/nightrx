import { AbsoluteFill } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { NightRxBrand } from '../components/NightRxBrand';
import { TransitionWipe } from '../components/TransitionWipe';
import { COLORS, SCENE_DURATIONS } from '../lib/constants';

export const Scene3Connect: React.FC = () => (
  <SceneLayout screenshot="connect-wallet.png" audioFile="scene3.mp3" overlay={false}>
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
          text="Live On-Chain Demo"
          variant="subtitle"
          startAtSecond={0.5}
          color={COLORS.green}
        />
        <AnimatedText
          text="Connected to Midnight Preprod Testnet"
          variant="body"
          startAtSecond={1.5}
          color={COLORS.textMuted}
        />
      </div>
    </AbsoluteFill>
    <TransitionWipe durationInSeconds={SCENE_DURATIONS.scene3Connect} />
  </SceneLayout>
);
