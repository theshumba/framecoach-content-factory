import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../brand';
import {HEADING_FONT, BODY_FONT} from '../fonts';

export const Logo: React.FC<{inverted?: boolean}> = ({inverted}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({frame, fps, config: {damping: 200}});

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        opacity: entrance,
        transform: `scale(${0.8 + entrance * 0.2})`,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: inverted ? BRAND.white : BRAND.red,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 38,
            color: inverted ? BRAND.red : BRAND.white,
            letterSpacing: 1,
          }}
        >
          FC
        </span>
      </div>
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 1,
          color: BRAND.white,
        }}
      >
        FrameCoach
      </span>
    </div>
  );
};
