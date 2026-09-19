import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Background} from '../components/Background';
import {Logo} from '../components/Logo';
import {Whoosh, Pop} from '../components/SFX';
import {HEADING_FONT, BODY_FONT} from '../fonts';
import {BRAND} from '../brand';
import type {CtaScene as CtaSceneData} from '../types';

export const CtaScene: React.FC<{data: CtaSceneData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleEntrance = spring({frame: frame - 0.3 * fps, fps, config: {damping: 200}});
  const subtitleEntrance = interpolate(frame, [0.6 * fps, 0.9 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const btnEntrance = spring({frame: frame - 0.8 * fps, fps, config: {damping: 12, stiffness: 200}});
  const footerEntrance = interpolate(frame, [1.1 * fps, 1.4 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Background bg="gradient" />
      <Whoosh at={0} />
      <Pop at={0.8} />
      <div style={{position: 'absolute', fontFamily: HEADING_FONT, fontSize: 500, color: 'rgba(255,255,255,0.03)', bottom: 80, left: -40, lineHeight: 1, pointerEvents: 'none'}}>FC</div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 60px', textAlign: 'center'}}>
        <Logo inverted />
        <div style={{fontFamily: HEADING_FONT, fontSize: 80, letterSpacing: -1, lineHeight: 1.05, color: BRAND.white, marginTop: 44, marginBottom: 20, opacity: titleEntrance, transform: `translateY(${interpolate(titleEntrance, [0, 1], [20, 0])}px)`}}>{data.title}</div>
        <div style={{fontFamily: BODY_FONT, fontSize: 34, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, maxWidth: 800, opacity: subtitleEntrance}}>{data.subtitle}</div>
        <div style={{display: 'inline-flex', alignItems: 'center', padding: '36px 72px', background: BRAND.light, color: BRAND.redDark, fontFamily: BODY_FONT, fontWeight: 700, fontSize: 34, borderRadius: 60, marginTop: 52, opacity: btnEntrance, transform: `scale(${interpolate(btnEntrance, [0, 1], [0.75, 1])})`}}>{data.button}</div>
        <div style={{fontFamily: BODY_FONT, fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 36, opacity: footerEntrance}}>{data.footer || 'framecoach.io'}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
