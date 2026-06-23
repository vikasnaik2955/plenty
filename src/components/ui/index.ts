/**
 * Plenty UI component library — native ports of the web design system.
 * Barrel re-export of every component (kebab-case files, named exports).
 */

// Primitives (already built)
export { Icon } from './icon';
export type { IconName, IconProps } from './icon';
export { Text } from './text';
export type { TextProps } from './text';
export { PressableScale } from './pressable-scale';
export type { PressableScaleProps } from './pressable-scale';
export { Button } from './button';
export type { ButtonProps } from './button';

// Forms
export { IconButton, ICON_BUTTON_FG } from './icon-button';
export type { IconButtonProps } from './icon-button';
export { Input } from './input';
export type { InputProps } from './input';
export { Select } from './select';
export type { SelectProps, SelectOption } from './select';
export { Switch } from './switch';
export type { SwitchProps } from './switch';
export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';

// Data display
export { StatusBadge } from './status-badge';
export type { StatusBadgeProps, LifecycleStatus, BadgeTone } from './status-badge';
export { Chip } from './chip';
export type { ChipProps } from './chip';
export { Avatar } from './avatar';
export type { AvatarProps } from './avatar';
export { StatCard } from './stat-card';
export type { StatCardProps } from './stat-card';
export { Timeline } from './timeline';
export type { TimelineProps, TimelineStep } from './timeline';

// Cards
export { Card } from './card';
export type { CardProps } from './card';
export { CategoryCard } from './category-card';
export type { CategoryCardProps } from './category-card';
export { DonationCard } from './donation-card';
export type { DonationCardProps, DonationMeta } from './donation-card';
export { ConsumerCard } from './consumer-card';
export type { ConsumerCardProps } from './consumer-card';
export { VolunteerCard } from './volunteer-card';
export type { VolunteerCardProps } from './volunteer-card';
export { RequestCard } from './request-card';
export type { RequestCardProps } from './request-card';
export { NotificationCard } from './notification-card';
export type { NotificationCardProps } from './notification-card';

// Navigation
export { AppBar } from './app-bar';
export type { AppBarProps } from './app-bar';
export { BottomNav } from './bottom-nav';
export type { BottomNavProps, BottomNavItem } from './bottom-nav';
export { Tabs } from './tabs';
export type { TabsProps, TabItem } from './tabs';

// Feedback
export { Toast } from './toast';
export type { ToastProps } from './toast';
export { BottomSheet } from './bottom-sheet';
export type { BottomSheetProps } from './bottom-sheet';
export { EmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';
export { MapPlaceholder } from './map-placeholder';
export type { MapPlaceholderProps, MapPin } from './map-placeholder';

// Layout
export { Page } from './page';
export type { PageProps } from './page';
export { Hero } from './hero';
export type { HeroProps } from './hero';
export { SectionHeader } from './section-header';
export type { SectionHeaderProps } from './section-header';
export { DetailRow } from './detail-row';
export type { DetailRowProps } from './detail-row';
export { PhotoPicker } from './photo-picker';
export type { PhotoPickerProps } from './photo-picker';
