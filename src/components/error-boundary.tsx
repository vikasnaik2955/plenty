/**
 * ErrorBoundary — a real boundary with a friendly fallback.
 *
 * Bug-fix from the plan: the prototype's `Boundary.componentDidCatch` silently
 * swallowed every error (and the HTML entry suppressed React #130 globally).
 * Here we actually surface the failure with a recoverable "Try again" instead
 * of blanking the screen.
 */
import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, space } from '@/theme';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) console.error('[Plenty] Uncaught UI error:', error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Icon name="triangle-alert" size={34} color={colors.warning} />
          </View>
          <Text variant="h3" align="center">
            Something went wrong
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={styles.message}>
            That screen hit a snag. You can try again — your progress is safe.
          </Text>
          <Button onPress={this.reset} leftIcon="rotate-ccw" style={styles.button}>
            Try again
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
    gap: space[3],
    backgroundColor: colors.surfacePage,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  message: { maxWidth: 280 },
  button: { marginTop: space[2] },
});
