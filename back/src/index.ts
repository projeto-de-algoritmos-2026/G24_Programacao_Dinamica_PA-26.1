import { knapsack } from './algorithms/knapsack.ts';
import { sampleItems, sampleCapacity } from './data/sampleItems.js';

const resultado = knapsack(sampleItems, sampleCapacity);

console.log(`Capacidade da mochila: ${sampleCapacity}`);
console.log(`Valor máximo: ${resultado.maxValue}`);
console.log(`Peso usado: ${resultado.totalWeight}`);
console.log(`Itens escolhidos: ${resultado.selected.map((i) => i.name).join(', ')}`);
