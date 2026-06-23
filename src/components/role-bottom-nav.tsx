/**
 * RoleBottomNav — wires the design system BottomNav to expo-router for a given
 * role. Tab items switch with `replace` (so the role home stays the stack base,
 * matching the prototype's `setStack([])`); the FAB pushes a sub-flow.
 */
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { BottomNav } from '@/components/ui/bottom-nav';
import { NAVS } from '@/navigation/navs';
import type { Role } from '@/data/types';

export function RoleBottomNav({ role, active }: { role: Role; active: string }) {
  const router = useRouter();
  const { items } = NAVS[role];

  const onChange = useCallback(
    (key: string) => {
      const item = items.find((i) => i.key === key);
      if (!item) return;
      if (item.push) {
        router.push(item.push);
        return;
      }
      if (item.route && key !== active) {
        router.replace(item.route);
      }
    },
    [items, router, active],
  );

  return <BottomNav items={items} active={active} onChange={onChange} />;
}
