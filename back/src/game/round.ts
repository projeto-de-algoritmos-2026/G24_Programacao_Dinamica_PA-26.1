import { sushiMenu, defaultPlateCapacity } from './menu.ts';
import type { SushiItem } from './menu.ts';

export interface CustomerRound {
  name: string;
  prompt: string;
  plateSize: number;
  hunger: number;
}

const customerNames = ['Ana', 'Bruno', 'Carla', 'Davi', 'Elisa', 'Fabio'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function generateCustomer(
  _menu: SushiItem[] = sushiMenu,
  capacity: number = defaultPlateCapacity,
): { capacity: number; customer: CustomerRound } {
  const plateSize = clamp(capacity + randomInt(-1, 2), 4, 12);
  const hunger = randomInt(10, 20);
  const name = customerNames[randomInt(0, customerNames.length - 1)];

  return {
    capacity: plateSize,
    customer: {
      name,
      prompt: `${name} chegou à bancada com um prato de tamanho ${plateSize}. Ele está com ${hunger} de fome. Escolha os sushi que saciam o máximo sem passar o tamanho do prato.`,
      plateSize,
      hunger,
    },
  };
}
