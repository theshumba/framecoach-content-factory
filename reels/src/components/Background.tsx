import {AbsoluteFill} from 'remotion';
import {BgType} from '../types';
import {BG_COLORS} from '../brand';

export const Background: React.FC<{bg: BgType}> = ({bg}) => {
  return (
    <AbsoluteFill
      style={{
        background: BG_COLORS[bg],
      }}
    />
  );
};
