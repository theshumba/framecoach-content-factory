#!/usr/bin/env node
import {execSync} from 'child_process';
import {mkdirSync} from 'fs';

const OUT = './output';
mkdirSync(OUT, {recursive: true});

const reelIds = [
  'reel-01-what-is-framecoach',
  'reel-02-amateur-look',
  'reel-03-five-reasons',
  'reel-04-vs-youtube',
  'reel-05-before-after',
  'reel-06-stop-scrolling',
  'reel-07-free-tools',
  'reel-08-five-minute-promise',
  'reel-09-frame-your-story',
  'reel-10-manifesto',
  'reel-11-built-by-filmmakers',
  'reel-12-content-deserves-better',
  'reel-13-great-filmmaker',
  'reel-14-composition-rules',
  'reel-15-one-light',
];

console.log(`Rendering ${reelIds.length} reels to ${OUT}/\n`);

for (const id of reelIds) {
  const outFile = `${OUT}/${id}.mp4`;
  console.log(`Rendering ${id}...`);
  try {
    execSync(
      `npx remotion render src/index.ts ${id} ${outFile} --codec h264`,
      {stdio: 'inherit'}
    );
    console.log(`  Done: ${outFile}\n`);
  } catch (e) {
    console.error(`  FAILED: ${id}\n`);
  }
}

console.log('All done!');
