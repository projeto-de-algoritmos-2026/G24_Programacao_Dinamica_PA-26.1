import { defaultPlateCapacity, getMenu } from './menu.ts';
import type { SushiItem } from '../types/item.ts';

export interface CustomerRound {
  name: string;
  prompt: string;
  plateSize: number;
  hunger: number;
}

const customerProfiles = [
  {
    name: 'Ana',
    prompt: 'Ana chegou à bancada e quer a melhor combinação para esse prato.',
  },
  {
    name: 'Bruno',
    prompt: 'Bruno quer maximizar a saciedade sem passar do limite do prato.',
  },
  {
    name: 'Carla',
    prompt: 'Carla está decidida a fazer a melhor escolha possível.',
  },
  {
    name: 'Davi',
    prompt: 'Davi quer aproveitar ao máximo o espaço do prato.',
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function generateCustomer(
  _menu: SushiItem[] = getMenu(),
  capacity: number = defaultPlateCapacity,
): { capacity: number; customer: CustomerRound } {
  const plateSize = clamp(capacity + randomInt(-1, 2), 4, 12);
  const hunger = randomInt(10, 20);
  const customer = customerProfiles[randomInt(0, customerProfiles.length - 1)];

  return {
    capacity: plateSize,
    customer: {
      name: customer.name,
      prompt: `${customer.prompt} Capacidade do prato: ${plateSize}.`,
      plateSize,
      hunger,
    },
  };
}

export function createRound(capacity: number) {
  const safeCapacity = clamp(Math.floor(Number(capacity ?? defaultPlateCapacity)), 4, 12);
  const hunger = randomInt(10, 20);
  const customer = customerProfiles[randomInt(0, customerProfiles.length - 1)];

  return {
    capacity: safeCapacity,
    customer: {
      name: customer.name,
      prompt: `${customer.prompt} Capacidade do prato: ${safeCapacity}.`,
      plateSize: safeCapacity,
      hunger,
    } satisfies CustomerRound,
  };
}
