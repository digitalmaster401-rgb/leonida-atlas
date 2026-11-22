import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function EmptyState({ icon = 'search', title, children }: { icon?: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty" role="note">
      <Icon name={icon} size={32} />
      <h3>{title}</h3>
      {children && <div className="empty-body">{children}</div>}
    </div>
  );
}
