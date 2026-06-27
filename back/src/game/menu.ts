export interface SushiItem {
  id: string;
  name: string;
  weight: number;
  value: number;
  description: string;
}

export const sushiMenu: SushiItem[] = [
  {
    id: 'niguiri',
    name: 'Niguirizushi',
    weight: 2,
    value: 8,
    description: 'Pequeno e muito saboroso.',
  },
  {
    id: 'temaki',
    name: 'Temaki',
    weight: 3,
    value: 10,
    description: 'Rolinho de peixe com arroz.',
  },
  {
    id: 'uramaki',
    name: 'Uramaki',
    weight: 4,
    value: 13,
    description: 'Sushi com arroz por fora.',
  },
  {
    id: 'sashimi',
    name: 'Sashimi',
    weight: 2,
    value: 7,
    description: 'Fatia de peixe fresca.',
  },
  {
    id: 'harumaki',
    name: 'Harumaki',
    weight: 3,
    value: 9,
    description: 'Rolinho crocante com legumes.',
  },
  {
    id: 'onigiri',
    name: 'Onigiri',
    weight: 2,
    value: 6,
    description: 'Bolinho de arroz com recheio.',
  },
];

export const defaultPlateCapacity = 8;
