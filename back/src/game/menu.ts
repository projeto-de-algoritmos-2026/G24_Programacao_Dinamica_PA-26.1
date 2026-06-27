import type { Item } from '../types/item.js';

export const sushiMenu: Item[] = [
  { name: 'Hossomaki', weight: 2, value: 3},
  { name: 'Uramaki', weight: 3, value: 5},
  { name: 'Niguiri', weight: 4, value: 6},
  { name: 'Temaki', weight: 6, value: 9},
  { name: 'Sashimi', weight: 5, value: 8},
  { name: 'Hot Roll', weight: 7, value: 11},
  { name: 'Gunkan', weight: 4, value: 7},
  { name: 'Combo Especial', weight: 10, value: 16},
];

export const defaultPlateCapacity = 12;
