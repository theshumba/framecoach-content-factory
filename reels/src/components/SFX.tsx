import React from 'react';
import {Sequence, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';

export const Whoosh: React.FC<{at: number}> = ({at}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} layout="none">
      <Audio src={staticFile('whoosh.mp3')} volume={0.6} />
    </Sequence>
  );
};

export const Swipe: React.FC<{at: number}> = ({at}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} layout="none">
      <Audio src={staticFile('swipe.mp3')} volume={0.5} />
    </Sequence>
  );
};

export const Pop: React.FC<{at: number}> = ({at}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} layout="none">
      <Audio src={staticFile('pop.mp3')} volume={0.4} />
    </Sequence>
  );
};
