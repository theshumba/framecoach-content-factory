import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Background} from '../components/Background';
import {HEADING_FONT, BODY_FONT} from '../fonts';
import {BRAND} from '../brand';
import type {TextScene as TextSceneData} from '../types';

export const TextScene: React.FC<{data: TextSceneData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const tagColor = data.bg === 'light' ? BRAND.red : data.bg === 'dark' ? BRAND.redLight : 'rgba(255,255,255,0.6)';
  const headColor = data.bg === 'light' ? BRAND.dark : BRAND.white;
  const bodyColor = data.bg === 'light' ? BRAND.gray : 'rgba(255,255,255,0.55)';

  const tagEntrance = interpolate(frame, [0, 0.3 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleEntrance = spring({frame: frame - 0.15 * fps, fps, config: {damping: 200}});
  const bodyEntrance = interpolate(frame, [0.5 * fps, 0.9 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Background bg={data.bg} />
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          padding: '0 80px 200px',
        }}
      >
        <div style={{fontFamily: BODY_FONT, fontSize: 20, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase' as const, color: tagColor, marginBottom: 24, opacity: tagEntrance}}>
          {data.tag}
        </div>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 64,
            letterSpacing: -1,
            lineHeight: 1.05,
            color: headColor,
            marginBottom: 24,
            opacity: titleEntrance,
            transform: `translateY(${interpolate(titleEntrance, [0, 1], [30, 0])}px)`,
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 28,
            lineHeight: 1.55,
            color: bodyColor,
            opacity: bodyEntrance,
          }}
        >
          {data.body}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
