import {AbsoluteFill} from 'remotion';

const CORNER_SIZE = 60;
const CORNER_WEIGHT = 4;
const COLOR = 'rgba(227,35,38,0.2)';
const MARGIN = 40;

const cornerStyle = (position: Record<string, number | string>): React.CSSProperties => ({
  position: 'absolute',
  width: CORNER_SIZE,
  height: CORNER_SIZE,
  ...position,
});

export const Corners: React.FC = () => {
  return (
    <AbsoluteFill style={{zIndex: 50, pointerEvents: 'none'}}>
      <div style={cornerStyle({top: MARGIN, left: MARGIN, borderTop: `${CORNER_WEIGHT}px solid ${COLOR}`, borderLeft: `${CORNER_WEIGHT}px solid ${COLOR}`})} />
      <div style={cornerStyle({top: MARGIN, right: MARGIN, borderTop: `${CORNER_WEIGHT}px solid ${COLOR}`, borderRight: `${CORNER_WEIGHT}px solid ${COLOR}`})} />
      <div style={cornerStyle({bottom: MARGIN, left: MARGIN, borderBottom: `${CORNER_WEIGHT}px solid ${COLOR}`, borderLeft: `${CORNER_WEIGHT}px solid ${COLOR}`})} />
      <div style={cornerStyle({bottom: MARGIN, right: MARGIN, borderBottom: `${CORNER_WEIGHT}px solid ${COLOR}`, borderRight: `${CORNER_WEIGHT}px solid ${COLOR}`})} />
    </AbsoluteFill>
  );
};
