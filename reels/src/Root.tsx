import {Composition, Folder} from 'remotion';
import {Reel} from './Reel';
import {reels} from './data/reels';
import {WIDTH, HEIGHT, FPS} from './brand';

function calcDuration(scenes: {duration: number}[], fps: number): number {
  const totalSceneDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const transitionOverlap = (scenes.length - 1) * 0.4;
  return Math.round((totalSceneDuration - transitionOverlap) * fps);
}

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="FrameCoach-Reels">
      {reels.map((reel) => (
        <Composition
          key={reel.id}
          id={reel.id}
          component={Reel}
          durationInFrames={calcDuration(reel.scenes, FPS)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{data: reel}}
        />
      ))}
    </Folder>
  );
};
