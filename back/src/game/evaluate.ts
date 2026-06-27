import type { Item, KnapsackResult } from '../types/item.js';
import { knapsack } from '../algorithms/knapsack.js';

export interface PlateEvaluation {
  fits: boolean;
  totalWeight: number;
  totalValue: number;
  satisfied: boolean;
  optimal: KnapsackResult;
  scorePercent: number;
}

export function evaluatePlate(
  catalog: Item[],
  selectedNames: string[],
  capacity: number,
  hunger: number
): PlateEvaluation {
  const byName = new Map(catalog.map((it) => [it.name, it]));
  const selected: Item[] = [];
  for (const name of selectedNames) {
    const item = byName.get(name);
    if (item) {
      selected.push(item);
    }
  }

  const totalWeight = selected.reduce((sum, it) => sum + it.weight, 0);
  const totalValue = selected.reduce((sum, it) => sum + it.value, 0);
  const fits = totalWeight <= capacity;

  const optimal = knapsack(catalog, capacity);
  const satisfied = fits && totalValue >= hunger;

  const scorePercent =
    optimal.maxValue > 0 && fits
      ? Math.round((totalValue / optimal.maxValue) * 100)
      : 0;

  return { fits, totalWeight, totalValue, satisfied, optimal, scorePercent };
}
