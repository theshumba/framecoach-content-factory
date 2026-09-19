import type {ReelData} from '../types';
import {BRAND} from '../brand';

export const reels: ReelData[] = [

// ━━━ APP PROMOTION (1-8) ━━━

{
  id: 'reel-01-what-is-framecoach', title: 'What Is FrameCoach?',
  scenes: [
    {type:'hook', bg:'dark', duration:4.5, lines:[{text:'WHAT IS', delay:0.2},{text:'FRAMECOACH?', color:BRAND.red, delay:0.8}]},
    {type:'text', bg:'dark', duration:5, tag:'THE APP', title:'Your Filmmaking Coach in Your Pocket', body:'Bite-sized daily lessons on composition, lighting & storytelling. 5 minutes a day. Structured paths. Real exercises.'},
    {type:'bold', bg:'gradient', duration:4, tag:'FOR FILMMAKERS', text:'Learn Faster. Shoot Better. Every Day.'},
    {type:'cta', bg:'gradient', duration:6, title:'Download FrameCoach', subtitle:'Learn filmmaking the smart way. 5 minutes a day.', button:'Get Started Now \u2192'},
  ],
},

{
  id: 'reel-02-amateur-look', title: 'Your Films Look Amateur',
  scenes: [
    {type:'hook', bg:'dark', duration:4, lines:[{text:'YOUR FILMS', delay:0.2},{text:'LOOK', delay:0.6},{text:'AMATEUR', color:BRAND.red, delay:0.9}], subtitle:'here\'s why'},
    {type:'point', bg:'dark', duration:3.5, num:'01', tag:'COMPOSITION', title:'Bad Framing', body:'Subject dead centre. No depth. No rule of thirds.'},
    {type:'point', bg:'gradient', duration:3.5, num:'02', tag:'LIGHTING', title:'Flat Light', body:'No shadows. No shape. No mood. Just bright and boring.'},
    {type:'point', bg:'dark', duration:3.5, num:'03', tag:'STORY', title:'No Structure', body:'No hook. No arc. No payoff. Just footage.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Fix All Three With FrameCoach', subtitle:'100+ lessons that transform your filmmaking.', button:'Download Now \u2192'},
  ],
},

{
  id: 'reel-03-five-reasons', title: '5 Reasons to Download',
  scenes: [
    {type:'hook', bg:'dark', duration:4, lines:[{text:'5 REASONS', delay:0.2},{text:'TO GET', delay:0.6},{text:'FRAMECOACH', color:BRAND.red, delay:1.0}]},
    {type:'point', bg:'dark', duration:3, num:'01', tag:'STRUCTURE', title:'Clear Learning Paths', body:'Beginner to advanced. No guessing.'},
    {type:'point', bg:'gradient', duration:3, num:'02', tag:'TIME', title:'5 Minutes a Day', body:'Fits any schedule. No excuses.'},
    {type:'point', bg:'dark', duration:3, num:'03', tag:'PRACTICE', title:'Real Exercises', body:'Hands-on challenges, not just theory.'},
    {type:'bold', bg:'dark', duration:3, tag:'PLUS', text:'Made by Filmmakers. Built for Creators.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Download FrameCoach', subtitle:'Join thousands of filmmakers levelling up.', button:'Get It Now \u2192'},
  ],
},

{
  id: 'reel-04-vs-youtube', title: 'FrameCoach vs YouTube',
  scenes: [
    {type:'hook', bg:'dark', duration:4.5, lines:[{text:'FRAMECOACH', color:BRAND.red, delay:0.2},{text:'vs YOUTUBE', delay:0.8}]},
    {type:'text', bg:'dark', duration:5, tag:'YOUTUBE', title:'Random. Scattered. Passive.', body:'Algorithm-driven content. No progression. Watch and forget. Hours wasted searching for the right video.'},
    {type:'text', bg:'gradient', duration:5, tag:'FRAMECOACH', title:'Structured. Active. Results.', body:'Curated paths. Practice exercises. 5-minute lessons. Measurable progress every single week.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Choose Structure Over Chaos', subtitle:'Learn film the way it should be taught.', button:'Try FrameCoach \u2192'},
  ],
},

{
  id: 'reel-05-before-after', title: 'Before & After FrameCoach',
  scenes: [
    {type:'hook', bg:'dark', duration:4.5, lines:[{text:'BEFORE', delay:0.2},{text:'& AFTER', color:BRAND.red, delay:0.8}], subtitle:'FrameCoach'},
    {type:'text', bg:'dark', duration:5, tag:'BEFORE', title:'Guessing Every Shot', body:'Random framing. Flat lighting. Hoping it looks good in the edit. Sound familiar?'},
    {type:'text', bg:'gradient', duration:5, tag:'AFTER', title:'Intentional Filmmaking', body:'Every shot composed with purpose. Light shaped for mood. Stories that hold attention start to finish.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Start Your Transformation', subtitle:'The fundamentals change everything.', button:'Download FrameCoach \u2192'},
  ],
},

{
  id: 'reel-06-stop-scrolling', title: 'Stop Scrolling Start Shooting',
  scenes: [
    {type:'hook', bg:'dark', duration:4.5, lines:[{text:'STOP', color:BRAND.red, delay:0.1},{text:'SCROLLING.', delay:0.6}], subtitle:'start shooting'},
    {type:'text', bg:'dark', duration:5, tag:'THE TRAP', title:'Consuming \u2260 Creating', body:'Watching filmmaking content feels productive. But your skills only grow when you actually practice. Every day you scroll is a day you don\'t shoot.'},
    {type:'bold', bg:'gradient', duration:4, tag:'THE FIX', text:'5 Minutes of Practice Beats 5 Hours of Watching'},
    {type:'cta', bg:'gradient', duration:6, title:'Practice Daily With FrameCoach', subtitle:'Real exercises. Real progress. 5 minutes a day.', button:'Get Started \u2192'},
  ],
},

{
  id: 'reel-07-free-tools', title: 'Tools Inside FrameCoach',
  scenes: [
    {type:'hook', bg:'dark', duration:4, lines:[{text:'TOOLS YOU', delay:0.2},{text:'DIDN\'T KNOW', color:BRAND.red, delay:0.7},{text:'ABOUT', delay:1.2}]},
    {type:'point', bg:'dark', duration:3.5, num:'01', tag:'TOOL', title:'Shot List Templates', body:'Pre-built for every genre. Never walk onto set unprepared again.'},
    {type:'point', bg:'gradient', duration:3.5, num:'02', tag:'TOOL', title:'Lighting Guides', body:'Visual setups for every cinematic look. Rembrandt, butterfly, split \u2014 all mapped out.'},
    {type:'point', bg:'dark', duration:3.5, num:'03', tag:'TOOL', title:'Composition Overlays', body:'Rule of thirds, golden ratio, dynamic symmetry. Learn while you shoot.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Get the Full Toolkit', subtitle:'All tools included inside FrameCoach.', button:'Download Now \u2192'},
  ],
},

{
  id: 'reel-08-five-minute-promise', title: 'The 5-Minute Promise',
  scenes: [
    {type:'hook', bg:'dark', duration:4.5, lines:[{text:'JUST', delay:0.2},{text:'5 MINUTES', color:BRAND.red, delay:0.7}], subtitle:'that\'s all it takes'},
    {type:'text', bg:'dark', duration:5, tag:'NO TIME?', title:'Nobody Has Time for Film School', body:'Between work, life, and your own projects \u2014 who has hours for courses? You don\'t need hours. You need 5 focused minutes.'},
    {type:'bold', bg:'gradient', duration:4, tag:'AFTER 30 DAYS', text:'30 Lessons. 6+ Skills. 150 Minutes Total.'},
    {type:'cta', bg:'gradient', duration:6, title:'Start Your 5 Minutes', subtitle:'The best time to start was yesterday.', button:'Download FrameCoach \u2192'},
  ],
},

// ━━━ BRAND AWARENESS (9-13) ━━━

{
  id: 'reel-09-frame-your-story', title: 'Frame Your Story',
  scenes: [
    {type:'bold', bg:'dark', duration:4.5, tag:'FRAME YOUR STORY', text:'Every Shot Is a Choice'},
    {type:'bold', bg:'gradient', duration:4.5, tag:'FRAME YOUR STORY', text:'Every Light Paints Emotion'},
    {type:'bold', bg:'dark', duration:4.5, tag:'FRAME YOUR STORY', text:'Every Story Deserves to Be Told Well'},
    {type:'cta', bg:'gradient', duration:6.5, title:'Frame Your Story', subtitle:'Learn the craft with FrameCoach.', button:'Get Started \u2192'},
  ],
},

{
  id: 'reel-10-manifesto', title: 'The Manifesto',
  scenes: [
    {type:'hook', bg:'dark', duration:3.5, lines:[{text:'THE', delay:0.2},{text:'MANIFESTO', color:BRAND.red, delay:0.6}]},
    {type:'bold', bg:'dark', duration:3.5, tag:'WE BELIEVE', text:'Filmmaking Is for Everyone'},
    {type:'bold', bg:'gradient', duration:3.5, tag:'WE BELIEVE', text:'Practice Beats Theory'},
    {type:'bold', bg:'dark', duration:3.5, tag:'WE BELIEVE', text:'The World Needs Your Story'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Join the Movement', subtitle:'Frame your story with FrameCoach.', button:'Download Now \u2192'},
  ],
},

{
  id: 'reel-11-built-by-filmmakers', title: 'Built by Filmmakers',
  scenes: [
    {type:'hook', bg:'dark', duration:4.5, lines:[{text:'BUILT BY', delay:0.2},{text:'FILMMAKERS', color:BRAND.red, delay:0.8}], subtitle:'for filmmakers'},
    {type:'text', bg:'dark', duration:5, tag:'THE PROBLEM WE SAW', title:'Creators Were Getting Lost', body:'Scattered tutorials. Expensive courses. No clear path forward. We\'ve been there ourselves and knew there had to be a better way.'},
    {type:'text', bg:'gradient', duration:5, tag:'WHAT WE BUILT', title:'The App We Wished Existed', body:'Structured. Bite-sized. Practice-first. Built by people who\'ve actually been on set, not just behind a desk.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Join the Community', subtitle:'Built by filmmakers. For filmmakers.', button:'Download FrameCoach \u2192'},
  ],
},

{
  id: 'reel-12-content-deserves-better', title: 'Your Content Deserves Better',
  scenes: [
    {type:'hook', bg:'dark', duration:4.5, lines:[{text:'YOUR CONTENT', delay:0.2},{text:'DESERVES', delay:0.7},{text:'BETTER', color:BRAND.red, delay:1.1}]},
    {type:'text', bg:'dark', duration:5, tag:'THE GAP', title:'Great Ideas, Average Execution', body:'You can see the final product in your head. But the footage never matches. The gap between vision and execution is real \u2014 and it\'s fixable.'},
    {type:'bold', bg:'gradient', duration:4, tag:'THE FIX', text:'Learn Composition. Control Light. Structure Story.'},
    {type:'cta', bg:'gradient', duration:6, title:'Close the Gap', subtitle:'Learn the fundamentals that transform your content.', button:'Start With FrameCoach \u2192'},
  ],
},

{
  id: 'reel-13-great-filmmaker', title: 'What Makes a Great Filmmaker',
  scenes: [
    {type:'hook', bg:'dark', duration:4, lines:[{text:'WHAT MAKES', delay:0.2},{text:'A GREAT', delay:0.6},{text:'FILMMAKER?', color:BRAND.red, delay:1.0}]},
    {type:'point', bg:'dark', duration:3.5, num:'01', tag:'QUALITY', title:'Vision', body:'Seeing stories where others see nothing. Training your eye to notice.'},
    {type:'point', bg:'gradient', duration:3.5, num:'02', tag:'QUALITY', title:'Discipline', body:'Showing up every day. Shooting even when uninspired. The habit is everything.'},
    {type:'point', bg:'dark', duration:3.5, num:'03', tag:'QUALITY', title:'Curiosity', body:'Never stop asking "what if I tried this?" Every experiment teaches you something.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Train Your Craft', subtitle:'Build these qualities with daily practice.', button:'Try FrameCoach \u2192'},
  ],
},

// ━━━ EDUCATION + STRONG CTA (14-15) ━━━

{
  id: 'reel-14-composition-rules', title: '3 Composition Rules',
  scenes: [
    {type:'hook', bg:'dark', duration:4, lines:[{text:'3 RULES', delay:0.2},{text:'THAT CHANGE', delay:0.6},{text:'YOUR SHOTS', color:BRAND.red, delay:1.0}]},
    {type:'point', bg:'dark', duration:3.5, num:'01', tag:'RULE OF THIRDS', title:'Place Subjects on Intersections', body:'Grid your frame 3\u00d73. Key elements go where the lines cross. Instant improvement.'},
    {type:'point', bg:'gradient', duration:3.5, num:'02', tag:'LEADING LINES', title:'Guide the Eye', body:'Roads, shadows, architecture \u2014 use any lines to pull the viewer to your subject.'},
    {type:'point', bg:'dark', duration:3.5, num:'03', tag:'NEGATIVE SPACE', title:'Let It Breathe', body:'Empty space creates mood, scale, and emotion. Less is almost always more.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Master Composition', subtitle:'100+ lessons inside FrameCoach.', button:'Download Now \u2192'},
  ],
},

{
  id: 'reel-15-one-light', title: 'One Light Cinematic',
  scenes: [
    {type:'hook', bg:'dark', duration:4, lines:[{text:'ONE LIGHT.', delay:0.2},{text:'CINEMATIC.', color:BRAND.red, delay:0.9}]},
    {type:'point', bg:'dark', duration:3.5, num:'01', tag:'REMBRANDT', title:'The Classic', body:'45\u00b0 to the side. Triangle shadow on the cheek. Timeless and elegant.'},
    {type:'point', bg:'gradient', duration:3.5, num:'02', tag:'SPLIT', title:'The Dramatic Half', body:'90\u00b0 side light. Half lit, half shadow. Maximum drama, minimal setup.'},
    {type:'point', bg:'dark', duration:3.5, num:'03', tag:'RIM', title:'The Silhouette Edge', body:'Behind and above. Glowing edge that separates your subject from the background.'},
    {type:'cta', bg:'gradient', duration:5.5, title:'Master Lighting', subtitle:'Full lighting curriculum inside FrameCoach.', button:'Get Started \u2192'},
  ],
},

];
