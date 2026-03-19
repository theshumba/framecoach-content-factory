import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Background} from '../components/Background';
import {Logo} from '../components/Logo';
import {HEADING_FONT, BODY_FONT} from '../fonts';
import {BRAND} from '../brand';
import type {CtaScene as CtaSceneData} from '../types';

export const CtaScene: React.FC<{data: CtaSceneData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleEntrance = spring({frame: frame - 0.4 * fps, fps, config: {damping: 200}});
  const subtitleEntrance = interpolate(frame, [0.7 * fps, 1.0 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const btnEntrance = spring({frame: frame - 1.0 * fps, fps, config: {damping: 15, stiffness: 200}});
  const footerEntrance = interpolate(frame, [1.3 * fps, 1.6 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Background bg="gradient" />
      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          fontFamily: HEADING_FONT,
          fontSize: 500,
          color: 'rgba(255,255,255,0.03)',
          bottom: 80,
          left: -40,
          lineHeight: 1,
          pointerEvents: 'none',
        }}
      >
        FC
      </div>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 80px',
          textAlign: 'center',
        }}
      >
        <Logo inverted />

        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 64,
            letterSpacing: -1,
            lineHeight: 1.05,
            color: BRAND.white,
            marginTop: 48,
            marginBottom: 16,
            opacity: titleEntrance,
            transform: `translateY(${interpolate(titleEntrance, [0, 1], [20, 0])}px)`,
          }}
        >
          {data.title}
        </div>

        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 28,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
            maxWidth: 700,
            opacity: subtitleEntrance,
          }}
        >
          {data.subtitle}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '28px 64px',
            background: BRAND.light,
            color: BRAND.redDark,
            fontFamily: BODY_FONT,
            fontWeight: 600,
            fontSize: 28,
            borderRadius: 56,
            marginTop: 48,
            opacity: btnEntrance,
            transform: `scale(${interpolate(btnEntrance, [0, 1], [0.8, 1])})`,
          }}
        >
          {data.button}
        </div>

        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 22,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 32,
            opacity: footerEntrance,
          }}
        >
          {data.footer || 'framecoach.io'}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
