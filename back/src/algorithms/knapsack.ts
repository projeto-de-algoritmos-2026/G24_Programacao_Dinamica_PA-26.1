import type { Item, KnapsackResult } from '../types/item.ts';

export function knapsack(items: Item[], capacity: number): KnapsackResult {
  if (capacity < 0 || !Number.isInteger(capacity)) {
    throw new Error('A capacidade deve ser um inteiro maior ou igual a zero.');
  }

  const n = items.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let c = 0; c <= capacity; c++) {
      dp[i][c] = dp[i - 1][c]; // não pega o item i
      if (weight <= c) {
        const withItem = dp[i - 1][c - weight] + value; // pega o item i
        if (withItem > dp[i][c]) {
          dp[i][c] = withItem;
        }
      }
    }
  }

  const selected: Item[] = [];
  let c = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      const item = items[i - 1];
      selected.push(item);
      c -= item.weight;
    }
  }
  selected.reverse();

  const totalWeight = selected.reduce((sum, it) => sum + it.weight, 0);

  return { maxValue: dp[n][capacity], totalWeight, selected };
}
