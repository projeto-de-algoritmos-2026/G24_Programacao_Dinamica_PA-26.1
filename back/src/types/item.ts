export interface Item {
  name: string;
  weight: number;
  value: number;
}

export interface SushiItem extends Item {
  id: string;
}

export interface KnapsackResult {
  maxValue: number;
  totalWeight: number;
  selected: Item[];
}
