import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Background} from '../components/Background';
import {HEADING_FONT, BODY_FONT} from '../fonts';
import {BRAND} from '../brand';
import type {BoldScene as BoldSceneData} from '../types';

export const BoldScene: React.FC<{data: BoldSceneData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const tagColor = data.bg === 'light' ? BRAND.red : data.bg === 'dark' ? BRAND.redLight : 'rgba(255,255,255,0.6)';
  const textColor = data.bg === 'light' ? BRAND.dark : BRAND.white;

  const entrance = spring({frame, fps, config: {damping: 200}});
  const tagEntrance = interpolate(frame, [0, 0.3 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Background bg={data.bg} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 80px',
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase' as const,
            color: tagColor,
            marginBottom: 28,
            opacity: tagEntrance,
          }}
        >
          {data.tag}
        </div>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 88,
            letterSpacing: -1,
            lineHeight: 1.0,
            color: textColor,
            textAlign: 'center',
            opacity: entrance,
            transform: `scale(${interpolate(entrance, [0, 1], [0.85, 1])})`,
          }}
        >
          {data.text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
