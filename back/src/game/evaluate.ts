import { knapsack } from '../algorithms/knapsack.ts';
import type { SushiItem } from './menu.ts';

export interface EvaluationResult {
  ok: boolean;
  message: string;
  selectedItems: SushiItem[];
  selectedWeight: number;
  selectedValue: number;
  optimalValue: number;
  capacity: number;
  hunger: number;
}

export function evaluatePlate(
  menu: SushiItem[],
  selectedNames: string[],
  capacity: number,
  hunger: number,
): EvaluationResult {
  const normalizedNames = Array.from(
    new Set(selectedNames.map((name) => name.trim()).filter(Boolean)),
  );

  const selectedItems = menu.filter((item) => {
    return normalizedNames.includes(item.id) || normalizedNames.includes(item.name);
  });

  const selectedWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
  const selectedValue = selectedItems.reduce((sum, item) => sum + item.value, 0);

  const optimal = knapsack(menu, capacity) as {
    maxValue?: number;
  };

  const optimalValue = typeof optimal.maxValue === 'number' ? optimal.maxValue : 0;
  const overCapacity = selectedWeight > capacity;
  const satisfied = selectedValue >= hunger;
  const perfect = !overCapacity && selectedValue === optimalValue && satisfied;

  let message = '';
  if (perfect) {
    message = `Perfeito! Você saciou ${selectedValue} de fome e encontrou a melhor combinação para esse cliente.`;
  } else if (overCapacity) {
    message = `Você passou do tamanho do prato. O cliente ficou sem comer o suficiente.`;
  } else if (satisfied) {
    message = `Você saciou ${selectedValue} de fome, mas ainda dá para melhorar a combinação.`;
  } else {
    message = `Ainda ficou abaixo da fome do cliente. Tente escolher itens mais valiosos.`;
  }

  return {
    ok: perfect,
    message,
    selectedItems,
    selectedWeight,
    selectedValue,
    optimalValue,
    capacity,
    hunger,
  };
}
