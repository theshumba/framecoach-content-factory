import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Background} from '../components/Background';
import {HEADING_FONT, BODY_FONT} from '../fonts';
import {BRAND} from '../brand';
import type {PointScene as PointSceneData} from '../types';

export const PointScene: React.FC<{data: PointSceneData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const tagColor = data.bg === 'light' ? BRAND.red : BRAND.redLight;
  const headColor = data.bg === 'light' ? BRAND.dark : BRAND.white;
  const bodyColor = data.bg === 'light' ? BRAND.gray : 'rgba(255,255,255,0.55)';
  const numColor = data.bg === 'light' ? 'rgba(0,0,0,0.06)' : data.bg === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)';
  const lineColor = data.bg === 'light' ? BRAND.red : BRAND.redLight;
  const tipBg = data.bg === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
  const tipBorder = data.bg === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';

  const numEntrance = spring({frame, fps, config: {damping: 200}});
  const titleEntrance = spring({frame: frame - 0.2 * fps, fps, config: {damping: 15, stiffness: 200}});
  const lineWidth = interpolate(frame, [0.4 * fps, 0.8 * fps], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bodyEntrance = interpolate(frame, [0.5 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tipEntrance = interpolate(frame, [0.8 * fps, 1.1 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background bg={data.bg} />
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          padding: '0 80px 160px',
        }}
      >
        {/* Big number */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 240,
            lineHeight: 0.8,
            letterSpacing: -6,
            color: numColor,
            opacity: numEntrance,
            transform: `translateY(${interpolate(numEntrance, [0, 1], [60, 0])}px)`,
          }}
        >
          {data.num}
        </div>

        {/* Tag */}
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase' as const,
            color: tagColor,
            marginBottom: 24,
            marginTop: 16,
            opacity: titleEntrance,
          }}
        >
          {data.tag}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 64,
            letterSpacing: -1,
            lineHeight: 1.05,
            color: headColor,
            marginBottom: 20,
            opacity: titleEntrance,
            transform: `translateX(${interpolate(titleEntrance, [0, 1], [-40, 0])}px)`,
          }}
        >
          {data.title}
        </div>

        {/* Red line */}
        <div
          style={{
            width: lineWidth,
            height: 6,
            background: lineColor,
            borderRadius: 3,
            marginBottom: 24,
          }}
        />

        {/* Body */}
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 28,
            lineHeight: 1.5,
            color: bodyColor,
            opacity: bodyEntrance,
          }}
        >
          {data.body}
        </div>

        {/* Tip box */}
        {data.tip && (
          <div
            style={{
              marginTop: 28,
              padding: '24px 28px',
              borderRadius: 16,
              background: tipBg,
              border: `1px solid ${tipBorder}`,
              opacity: tipEntrance,
              transform: `translateY(${interpolate(tipEntrance, [0, 1], [20, 0])}px)`,
            }}
          >
            <div style={{fontFamily: BODY_FONT, fontSize: 18, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' as const, color: tagColor, marginBottom: 8}}>
              Pro Tip
            </div>
            <div style={{fontFamily: BODY_FONT, fontSize: 24, color: bodyColor, lineHeight: 1.45}}>
              {data.tip}
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
