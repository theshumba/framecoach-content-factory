import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{zIndex: 90, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 40,
          right: 40,
          height: 4,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#fff',
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
