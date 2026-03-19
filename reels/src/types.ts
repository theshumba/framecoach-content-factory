export type BgType = 'dark' | 'gradient' | 'light';

export type HookScene = {
  type: 'hook';
  bg: BgType;
  duration: number;
  lines: {text: string; color?: string; delay?: number}[];
  subtitle?: string;
};

export type PointScene = {
  type: 'point';
  bg: BgType;
  duration: number;
  num: string;
  tag: string;
  title: string;
  body: string;
  tip?: string;
};

export type BoldScene = {
  type: 'bold';
  bg: BgType;
  duration: number;
  tag: string;
  text: string;
};

export type TextScene = {
  type: 'text';
  bg: BgType;
  duration: number;
  tag: string;
  title: string;
  body: string;
};

export type CtaScene = {
  type: 'cta';
  bg: BgType;
  duration: number;
  title: string;
  subtitle: string;
  button: string;
  footer?: string;
};

export type SceneData = HookScene | PointScene | BoldScene | TextScene | CtaScene;

export type ReelData = {
  id: string;
  title: string;
  scenes: SceneData[];
};
