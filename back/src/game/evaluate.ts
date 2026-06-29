import { knapsack } from '../algorithms/knapsack.ts';
import type { SushiItem } from '../types/item.ts';

export interface EvaluationResult {
  ok: boolean;
  message: string;
  selectedItems: SushiItem[];
  selectedWeight: number;
  selectedValue: number;
  optimalValue: number;
  capacity: number;
}

export function evaluatePlate(
  menu: SushiItem[],
  selectedNames: string[],
  capacity: number,
): EvaluationResult {
  const normalizedNames = Array.from(
    new Set(selectedNames.map((name) => name.trim()).filter(Boolean)),
  );

  const selectedItems = menu.filter((item) => {
    return normalizedNames.includes(item.id) || normalizedNames.includes(item.name);
  });

  const selectedWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
  const selectedValue = selectedItems.reduce((sum, item) => sum + item.value, 0);

  const safeCapacity = Math.max(1, Math.floor(Number(capacity ?? 20)));
  const optimal = knapsack(menu, safeCapacity);
  const optimalValue = optimal.maxValue;

  const overCapacity = selectedWeight > safeCapacity;
  const perfect = !overCapacity && selectedValue === optimalValue;

  let message = '';

  if (perfect) {
    message = 'Perfeito! Você encontrou a melhor combinação para esse prato.';
  } else if (overCapacity) {
    message = 'Você passou do tamanho do prato.';
  } else if (selectedValue > 0) {
    message = 'Você fez uma escolha válida, mas ainda dá para melhorar a combinação.';
  } else {
    message = 'Você não escolheu itens úteis para esse prato.';
  }

  return {
    ok: perfect,
    message,
    selectedItems,
    selectedWeight,
    selectedValue,
    optimalValue,
    capacity: safeCapacity,
  };
}
