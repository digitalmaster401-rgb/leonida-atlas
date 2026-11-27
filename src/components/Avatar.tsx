import type { Avatar } from '../lib/storage';

export const AVATAR_LABEL: Record<Avatar, string> = { flamenco: 'Flamenco', palmera: 'Palmera', ola: 'Ola', sol: 'Sol', estrella: 'Estrella', rayo: 'Rayo' };

export function AvatarBadge({ avatar, name, size = 56 }: { avatar: Avatar; name: string; size?: number }) {
  return (
    <span className={`avatar avatar-${avatar}${size > 40 ? ' avatar-lg' : ''}`} aria-hidden="true">
      {(name.trim()[0] ?? AVATAR_LABEL[avatar][0]).toUpperCase()}
    </span>
  );
}
