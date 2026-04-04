import { AbsoluteFill } from 'remotion';
import { SceneLayout } from '../components/SceneLayout';
import { AnimatedText } from '../components/AnimatedText';
import { NightRxBrand } from '../components/NightRxBrand';
import { TransitionWipe } from '../components/TransitionWipe';
import { COLORS, SCENE_DURATIONS } from '../lib/constants';

export const Scene1Problem: React.FC = () => (
  <SceneLayout screenshot="landing-hero.png" audioFile="scene1.mp3">
    <NightRxBrand />
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 200px',
        textAlign: 'center',
      }}
    >
      <AnimatedText
        text="The Problem"
        variant="caption"
        startAtSecond={0}
        style={{ marginBottom: 20, textTransform: 'uppercase', letterSpacing: 4 }}
      />
      <AnimatedText
        text="Patients avoid medication because"
        variant="title"
        startAtSecond={0.5}
      />
      <AnimatedText
        text="they're forced to reveal their diagnosis."
        variant="title"
        startAtSecond={1.5}
        color={COLORS.amber}
      />
      <AnimatedText
        text="HIV treatment  ·  Mental health  ·  Addiction recovery"
        variant="subtitle"
        startAtSecond={4}
        color={COLORS.textMuted}
        style={{ marginTop: 40 }}
      />
    </AbsoluteFill>
    <TransitionWipe durationInSeconds={SCENE_DURATIONS.scene1Problem} />
  </SceneLayout>
);
