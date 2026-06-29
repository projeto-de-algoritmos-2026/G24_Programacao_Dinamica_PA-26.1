import type { SushiItem } from '../types/item.ts';

export const defaultPlateCapacity = 20;

const menu: SushiItem[] = [
  { id: 'niguiri', name: 'Niguiris', weight: 3, value: 8 },
  { id: 'temaki', name: 'Temaki', weight: 5, value: 12 },
  { id: 'sashimi', name: 'Sashimi', weight: 4, value: 10 },
  { id: 'uramaki', name: 'Uramaki', weight: 6, value: 14 },
  { id: 'salmao', name: 'Salmão', weight: 2, value: 6 },
  { id: 'takoyaki', name: 'Takoyaki', weight: 4, value: 9 },
];

export function getMenu(): SushiItem[] {
  return menu;
}
