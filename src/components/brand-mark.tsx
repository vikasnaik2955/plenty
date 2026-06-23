/**
 * BrandMark — the Plenty leaf-heart mark, ported from `assets/mark.svg` to
 * react-native-svg. `tile` draws the rounded green tile background; pass
 * `tileColor="transparent"` and a white `heartColor` to place it on a hero.
 */
import Svg, { Path, Rect } from 'react-native-svg';

import { palette } from '@/theme';

export function BrandMark({
  size = 96,
  tile = true,
  tileColor = palette.green500,
  heartColor = '#FFFFFF',
  leafColor = palette.green500,
}: {
  size?: number;
  tile?: boolean;
  tileColor?: string;
  heartColor?: string;
  leafColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      {tile && <Rect width={96} height={96} rx={26} fill={tileColor} />}
      <Path
        d="M48 72C48 72 26 59.5 26 43C26 34.7 32.2 29 39.6 29C43.6 29 46.4 31 48 33.6C49.6 31 52.4 29 56.4 29C63.8 29 70 34.7 70 43C70 59.5 48 72 48 72Z"
        fill={heartColor}
      />
      <Path d="M48 41C48 33 53 26 62 24C62.5 32.5 57.5 39.5 48 41Z" fill={leafColor} />
    </Svg>
  );
}
