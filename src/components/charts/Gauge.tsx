import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme';

interface Props {
  pct: number;
  color: string;
  size?: number;
  label?: string;
}

export function Gauge({ pct, color, size = 84, label }: Props) {
  const clamped = Math.max(0, Math.min(100, pct));
  const sw = size > 70 ? 7 : 5.5;
  const r = size / 2 - sw - 1;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.border} strokeWidth={sw} />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: size > 70 ? 21 : 15, fontWeight: '700', color: colors.text }}>
          {Math.round(clamped)}
        </Text>
        {label ? (
          <Text style={{ fontSize: 9.5, fontWeight: '600', color: colors.textFaint }}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}
