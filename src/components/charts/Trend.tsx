import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import type { ChartPoint } from '@/health/types';
import { colors } from '@/theme';

interface Props {
  points: ChartPoint[];
  color: string;
}

export function Trend({ points, color }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const w = screenWidth - 48;
  const h = 160;
  const padT = 10;
  const padB = 24;
  const padL = 8;
  const padR = 8;

  const valid = points.filter((p) => !p.missing);
  if (valid.length < 2) {
    return <View style={{ height: h }} />;
  }

  const ys = valid.map((p) => p.value);
  const mn = Math.min(...ys);
  const mx = Math.max(...ys);
  const range = mx - mn || 1;
  const norm = valid.map((p) => (p.value - mn) / range);

  const X = (i: number) => padL + (i / (valid.length - 1)) * (w - padL - padR);
  const Y = (v: number) => h - padB - v * (h - padT - padB);

  const path = norm
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`)
    .join(' ');

  return (
    <View>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Line
          x1={padL}
          y1={h - padB}
          x2={w - padR}
          y2={h - padB}
          stroke={colors.border}
          strokeWidth={1.2}
        />
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {valid.map((p, i) =>
          i % 4 === 0 || i === valid.length - 1 ? (
            <SvgText
              key={p.dateKey}
              x={X(i)}
              y={h - 7}
              fontSize="10"
              textAnchor="middle"
              fill={colors.textFaint}
            >
              {p.label.split(' ')[1] ?? p.label}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
}
