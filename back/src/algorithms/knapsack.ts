import type { SushiItem } from '../types/item.ts';

export interface KnapsackResult {
  maxValue: number;
  selectedItems: SushiItem[];
}

export function knapsack(items: SushiItem[], capacity: number): KnapsackResult {
  const safeCapacity = Math.max(0, Math.floor(Number(capacity ?? 0)));
  const n = items.length;

  const dp = Array.from({ length: n + 1 }, () => Array(safeCapacity + 1).fill(0));
  const take = Array.from({ length: n + 1 }, () => Array(safeCapacity + 1).fill(false));

  for (let i = 1; i <= n; i += 1) {
    const item = items[i - 1];

    for (let currentCapacity = 0; currentCapacity <= safeCapacity; currentCapacity += 1) {
      const withoutItem = dp[i - 1][currentCapacity];
      const withItem =
        item.weight <= currentCapacity
          ? dp[i - 1][currentCapacity - item.weight] + item.value
          : -Infinity;

      if (withItem > withoutItem) {
        dp[i][currentCapacity] = withItem;
        take[i][currentCapacity] = true;
      } else {
        dp[i][currentCapacity] = withoutItem;
      }
    }
  }

  const selectedItems: SushiItem[] = [];
  let remainingCapacity = safeCapacity;

  for (let i = n; i > 0; i -= 1) {
    if (take[i][remainingCapacity]) {
      selectedItems.push(items[i - 1]);
      remainingCapacity -= items[i - 1].weight;
    }
  }

  return {
    maxValue: dp[n][safeCapacity],
    selectedItems: selectedItems.reverse(),
  };
}
