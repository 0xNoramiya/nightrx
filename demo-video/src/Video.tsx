import { Sequence } from 'remotion';
import { FPS, SCENE_DURATIONS } from './lib/constants';
import { Scene1Problem } from './scenes/Scene1Problem';
import { Scene2HowItWorks } from './scenes/Scene2HowItWorks';
import { Scene3Connect } from './scenes/Scene3Connect';
import { Scene4Clinic } from './scenes/Scene4Clinic';
import { Scene5Patient } from './scenes/Scene5Patient';
import { Scene6Pharmacy } from './scenes/Scene6Pharmacy';
import { Scene7Explorer } from './scenes/Scene7Explorer';
import { Scene8Closing } from './scenes/Scene8Closing';

const scenes = [
  { id: 'scene1', Component: Scene1Problem, duration: SCENE_DURATIONS.scene1Problem },
  { id: 'scene2', Component: Scene2HowItWorks, duration: SCENE_DURATIONS.scene2HowItWorks },
  { id: 'scene3', Component: Scene3Connect, duration: SCENE_DURATIONS.scene3Connect },
  { id: 'scene4', Component: Scene4Clinic, duration: SCENE_DURATIONS.scene4Clinic },
  { id: 'scene5', Component: Scene5Patient, duration: SCENE_DURATIONS.scene5Patient },
  { id: 'scene6', Component: Scene6Pharmacy, duration: SCENE_DURATIONS.scene6Pharmacy },
  { id: 'scene7', Component: Scene7Explorer, duration: SCENE_DURATIONS.scene7Explorer },
  { id: 'scene8', Component: Scene8Closing, duration: SCENE_DURATIONS.scene8Closing },
];

export const Video: React.FC = () => {
  let offset = 0;
  return (
    <>
      {scenes.map(({ id, Component, duration }) => {
        const from = offset;
        offset += duration * FPS;
        return (
          <Sequence key={id} from={from} durationInFrames={duration * FPS}>
            <Component />
          </Sequence>
        );
      })}
    </>
  );
};
