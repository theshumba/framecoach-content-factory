import {AbsoluteFill, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Corners} from './components/Corners';
import {ProgressBar} from './components/ProgressBar';
import {HookScene} from './scenes/HookScene';
import {PointScene} from './scenes/PointScene';
import {BoldScene} from './scenes/BoldScene';
import {TextScene} from './scenes/TextScene';
import {CtaScene} from './scenes/CtaScene';
import type {ReelData, SceneData} from './types';

const SceneRenderer: React.FC<{scene: SceneData}> = ({scene}) => {
  switch (scene.type) {
    case 'hook': return <HookScene data={scene} />;
    case 'point': return <PointScene data={scene} />;
    case 'bold': return <BoldScene data={scene} />;
    case 'text': return <TextScene data={scene} />;
    case 'cta': return <CtaScene data={scene} />;
    default: return null;
  }
};

export const Reel: React.FC<{data: ReelData}> = ({data}) => {
  const {fps} = useVideoConfig();
  const TRANSITION_FRAMES = Math.round(0.4 * fps);

  return (
    <AbsoluteFill style={{backgroundColor: '#141414'}}>
      <TransitionSeries>
        {data.scenes.map((scene, i) => {
          const frames = Math.round(scene.duration * fps);
          return (
            <TransitionSeries.Sequence key={i} durationInFrames={frames}>
              <SceneRenderer scene={scene} />
              {i < data.scenes.length - 1 && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
                />
              )}
            </TransitionSeries.Sequence>
          );
        })}
      </TransitionSeries>
      <Corners />
      <ProgressBar />
    </AbsoluteFill>
  );
};
