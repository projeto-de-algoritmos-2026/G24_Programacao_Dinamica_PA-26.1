import type { Item } from '../types/item.js';
import { knapsack } from '../algorithms/knapsack.js';

export interface Customer {
  hunger: number;
}

export function generateCustomer(items: Item[], capacity: number): Customer {
  const best = knapsack(items, capacity).maxValue;
  if (best <= 0) {
    return { hunger: 0 };
  }

  const min = Math.ceil(best * 0.5);
  const hunger = min + Math.floor(Math.random() * (best - min + 1));
  return { hunger };
}
