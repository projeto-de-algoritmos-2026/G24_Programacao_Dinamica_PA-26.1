export interface Item {
  name: string;
  weight: number;
  value: number;
}

export interface KnapsackResult {
  maxValue: number;
  totalWeight: number;
  selected: Item[];
}
