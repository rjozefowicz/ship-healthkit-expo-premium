import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { ChartPoint } from '@/health/types';

interface Props {
  points: ChartPoint[];
  color: string;
  width?: number;
  height?: number;
}

export function Spark({ points, color, width = 72, height = 28 }: Props) {
  const valid = points.filter((p) => !p.missing);
  if (valid.length < 2) return null;

  const ys = valid.map((p) => p.value);
  const mn = Math.min(...ys);
  const mx = Math.max(...ys);
  const range = mx - mn || 1;

  const d = valid
    .map((p, i) => {
      const px = (i / (valid.length - 1)) * width;
      const py = height - ((p.value - mn) / range) * (height - 2) - 1;
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
