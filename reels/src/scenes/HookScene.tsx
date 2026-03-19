import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Background} from '../components/Background';
import {HEADING_FONT, BODY_FONT} from '../fonts';
import {BRAND} from '../brand';
import type {HookScene as HookSceneData} from '../types';

export const HookScene: React.FC<{data: HookSceneData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

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
        {/* Red glow */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(227,35,38,0.12) 0%, transparent 70%)',
            top: '30%',
            left: '20%',
          }}
        />

        {data.lines.map((line, i) => {
          const delay = (line.delay ?? i * 0.5) * fps;
          const entrance = spring({
            frame: frame - delay,
            fps,
            config: i === 1 ? {damping: 15, stiffness: 200} : {damping: 200},
          });
          const translateY = interpolate(entrance, [0, 1], [80, 0]);
          const scale = i === 1 ? interpolate(entrance, [0, 1], [1.4, 1]) : 1;

          return (
            <div
              key={i}
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 140,
                color: line.color || BRAND.white,
                letterSpacing: -2,
                lineHeight: 0.9,
                textAlign: 'center',
                opacity: entrance,
                transform: `translateY(${translateY}px) scale(${scale})`,
              }}
            >
              {line.text}
            </div>
          );
        })}

        {data.subtitle && (
          <div
            style={{
              fontFamily: BODY_FONT,
              fontSize: 32,
              color: 'rgba(255,255,255,0.5)',
              marginTop: 40,
              textAlign: 'center',
              opacity: interpolate(frame, [1.5 * fps, 2 * fps], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {data.subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
