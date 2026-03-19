import {loadFont as loadBebasNeue} from '@remotion/google-fonts/BebasNeue';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';

const {fontFamily: bebasNeue} = loadBebasNeue();
const {fontFamily: poppins} = loadPoppins('normal', {
  weights: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export const HEADING_FONT = bebasNeue;
export const BODY_FONT = poppins;
