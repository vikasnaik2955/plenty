/**
 * Timeline — vertical lifecycle stepper for the request status tracker.
 * `current` marks the active stage; earlier steps render done.
 * Ported from the design system `components/data-display/Timeline.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

const ORDER = ['requested', 'accepted', 'picked_up', 'delivered', 'completed'] as const;
const LABELS: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Volunteer accepted',
  picked_up: 'Picked up',
  delivered: 'Delivered',
  completed: 'Completed',
};

export interface TimelineStep {
  key: string;
  label: string;
  time?: string;
}

export interface TimelineProps {
  /**
   * Active lifecycle stage. @default "requested"
   * Accepts the full lifecycle including `cancelled` (which matches no step,
   * so every step renders pending) — callers can pass a raw donation status.
   */
  current?: 'requested' | 'accepted' | 'picked_up' | 'delivered' | 'completed' | 'cancelled';
  /** Override the default 5-step lifecycle with custom labels/timestamps. */
  steps?: TimelineStep[];
  style?: StyleProp<ViewStyle>;
}

export function Timeline({ current = 'requested', steps, style }: TimelineProps) {
  const list: TimelineStep[] = steps ?? ORDER.map((key) => ({ key, label: LABELS[key] }));
  const currentIdx = list.findIndex((s) => s.key === current);

  return (
    <View style={style}>
      {list.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const color = done || active ? colors.brand : colors.borderStrong;
        const last = i === list.length - 1;

        return (
          <View key={step.key} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={[
                  {
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: done ? colors.brand : active ? colors.surfaceCard : colors.surfaceSunken,
                    borderWidth: 2,
                    borderColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  active && {
                    shadowColor: colors.brand,
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 0 },
                  },
                ]}
              >
                {done ? (
                  <Icon name="check" size={14} color="#fff" strokeWidth={3} />
                ) : (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: active ? colors.brand : colors.borderStrong,
                    }}
                  />
                )}
              </View>
              {!last && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 26,
                    backgroundColor: done ? colors.brand : colors.borderSubtle,
                  }}
                />
              )}
            </View>
            <View style={{ paddingBottom: last ? 0 : 18, marginTop: 1 }}>
              <Text
                variant="body"
                weight={active ? 700 : 600}
                color={done || active ? colors.textPrimary : colors.textMuted}
              >
                {step.label}
              </Text>
              {step.time && (
                <Text size={fontSize.caption} color={colors.textMuted} style={{ marginTop: 2 }}>
                  {step.time}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
