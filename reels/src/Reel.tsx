import React from 'react';
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

  const elements: React.ReactNode[] = [];
  data.scenes.forEach((scene, i) => {
    const frames = Math.round(scene.duration * fps);
    elements.push(
      <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={frames}>
        <SceneRenderer scene={scene} />
      </TransitionSeries.Sequence>
    );
    if (i < data.scenes.length - 1) {
      elements.push(
        <TransitionSeries.Transition
          key={`t-${i}`}
          presentation={fade()}
          timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
        />
      );
    }
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#141414'}}>
      <TransitionSeries>
        {elements}
      </TransitionSeries>
      <Corners />
      <ProgressBar />
    </AbsoluteFill>
  );
};
