/**
 * Page — vertical page scaffold: fixed header, scrollable body, optional footer
 * action bar and/or bottom nav. Honors the safe-area bottom inset in the footer.
 * Ported from the design system kit `ui_kits/plenty-app/kit.jsx` (Page).
 */
import { ScrollView, type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export interface PageProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  /** Pinned footer action bar (above the nav). */
  footer?: React.ReactNode;
  /** Bottom nav node (rendered flush at the bottom). */
  nav?: React.ReactNode;
  /** Page background. @default surfacePage */
  bg?: string;
  /** Pad the scroll body (16/20). @default true */
  pad?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Page({ header, children, footer, nav, bg = colors.surfacePage, pad = true, style }: PageProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[{ flex: 1, backgroundColor: bg }, style]}>
      {header}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View
          style={{
            paddingHorizontal: pad ? 20 : 0,
            // When there's no header (Hero/AppBar own the top inset), clear the
            // status bar here so headerless screens aren't drawn under it.
            paddingTop: (pad ? 16 : 0) + (header ? 0 : insets.top),
            paddingBottom: footer || nav ? 24 : 28,
          }}
        >
          {children}
        </View>
      </ScrollView>
      {footer && (
        <View
          style={{
            paddingTop: 12,
            paddingHorizontal: 20,
            paddingBottom: 12 + insets.bottom,
            backgroundColor: colors.surfaceCard,
            borderTopWidth: 1,
            borderTopColor: colors.borderSubtle,
          }}
        >
          {footer}
        </View>
      )}
      {nav}
    </View>
  );
}
