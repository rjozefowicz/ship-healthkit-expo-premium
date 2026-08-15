import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';
import type { LiveActivityEnvironment } from 'expo-widgets/build/Widgets.types';

export type SessionActivityProps = {
  label: string;
  startedAt: string;
  paused?: boolean;
  elapsedSeconds?: number;
};

const SessionActivity = (props: SessionActivityProps, _env: LiveActivityEnvironment) => {
  'widget';

  function formatElapsed(totalSeconds: number): string {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  const paused = props.paused === true;
  const accentColor = '#3D8BFF';
  const pausedColor = '#8da2b8';
  const elapsedLabel = formatElapsed(props.elapsedSeconds ?? 0);
  const lower = new Date(props.startedAt);
  const upper = new Date(lower.getTime() + 24 * 3600 * 1000);
  const title = paused ? `${props.label} · Paused` : props.label;

  return {
    banner: (
      <HStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ size: 22 })]}>{paused ? '❚❚' : '●'}</Text>
        <VStack modifiers={[padding({ leading: 8 })]}>
          <Text
            modifiers={[
              font({ weight: 'bold' }),
              foregroundStyle(paused ? pausedColor : accentColor),
            ]}
          >
            {title}
          </Text>
          {paused ? (
            <Text modifiers={[font({ size: 13 })]}>{elapsedLabel}</Text>
          ) : (
            <Text
              timerInterval={{ lower, upper }}
              countsDown={false}
              modifiers={[font({ size: 13 })]}
            />
          )}
        </VStack>
      </HStack>
    ),
    compactLeading: <Text modifiers={[font({ size: 14 })]}>●</Text>,
    compactTrailing: paused ? (
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(pausedColor)]}>
        {elapsedLabel}
      </Text>
    ) : (
      <Text
        timerInterval={{ lower, upper }}
        countsDown={false}
        modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(accentColor)]}
      />
    ),
    minimal: <Text modifiers={[font({ size: 14 })]}>●</Text>,
    expandedLeading: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text
          modifiers={[
            font({ weight: 'bold', size: 13 }),
            foregroundStyle(paused ? pausedColor : accentColor),
          ]}
        >
          {props.label}
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 10 })]}>
        {paused ? (
          <Text modifiers={[font({ weight: 'bold', size: 20 }), foregroundStyle('#eef2f8')]}>
            {elapsedLabel}
          </Text>
        ) : (
          <Text
            timerInterval={{ lower, upper }}
            countsDown={false}
            modifiers={[font({ weight: 'bold', size: 20 }), foregroundStyle('#eef2f8')]}
          />
        )}
      </VStack>
    ),
    expandedBottom: (
      <Text modifiers={[font({ size: 12 }), foregroundStyle('#56717f'), padding({ all: 6 })]}>
        Health Stack · tap to open
      </Text>
    ),
  };
};

export default createLiveActivity('SessionActivity', SessionActivity);
