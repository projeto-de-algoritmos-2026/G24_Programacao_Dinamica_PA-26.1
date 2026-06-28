export interface SushiItem {
  id: string;
  name: string;
  weight: number;
  value: number;
  description: string;
}

/** Catálogo base: identidade dos sushis. Peso e valor são sorteados por partida. */
const baseSushi: Omit<SushiItem, 'weight' | 'value'>[] = [
  { id: 'niguiri', name: 'Niguirizushi', description: 'Pequeno e muito saboroso.' },
  { id: 'temaki', name: 'Temaki', description: 'Rolinho de peixe com arroz.' },
  { id: 'uramaki', name: 'Uramaki', description: 'Sushi com arroz por fora.' },
  { id: 'sashimi', name: 'Sashimi', description: 'Fatia de peixe fresca.' },
  { id: 'harumaki', name: 'Harumaki', description: 'Rolinho crocante com legumes.' },
  { id: 'onigiri', name: 'Onigiri', description: 'Bolinho de arroz com recheio.' },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera um cardápio com status aleatórios, mas dentro de faixas controladas:
 * - weight entre 2 e 5
 * - value ≈ weight × (2.0 a 3.0) → todo item é viável (nenhum vira "lixo"),
 *   mas uns rendem mais saciedade por espaço que outros, criando trade-offs.
 */
export function generateMenu(): SushiItem[] {
  return baseSushi.map((sushi) => {
    const weight = randomInt(2, 5);
    const multiplier = 2 + Math.random(); // 2.0 a 3.0
    const value = Math.round(weight * multiplier);
    return { ...sushi, weight, value };
  });
}

/** Cardápio atual da partida. Regerado em regenerateMenu(). */
export const sushiMenu: SushiItem[] = generateMenu();

/**
 * Sorteia um novo cardápio para uma nova partida, mantendo a MESMA referência
 * de array (mutação in-place) para que evaluate/knapsack continuem consistentes.
 */
export function regenerateMenu(): SushiItem[] {
  const fresh = generateMenu();
  sushiMenu.length = 0;
  sushiMenu.push(...fresh);
  return sushiMenu;
}

export const defaultPlateCapacity = 8;
