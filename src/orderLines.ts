import type { OrderLine } from './types';

export type LinesAction =
  | { type: 'add'; productID: number; quantity: number }
  | { type: 'setQuantity'; productID: number; quantity: number }
  | { type: 'remove'; productID: number };

export function linesReducer(lines: OrderLine[], action: LinesAction): OrderLine[] {
  switch (action.type) {
    case 'add':
      return lines.some((l) => l.productID === action.productID)
        ? lines.map((l) =>
            l.productID === action.productID ? { ...l, quantity: l.quantity + action.quantity } : l,
          )
        : [...lines, { productID: action.productID, quantity: action.quantity }];
    case 'setQuantity':
      return lines.map((l) =>
        l.productID === action.productID ? { ...l, quantity: action.quantity } : l,
      );
    case 'remove':
      return lines.filter((l) => l.productID !== action.productID);
  }
}

export function parseQuantity(value: string): number | null {
  const n = Number(value);
  return value.trim() !== '' && Number.isInteger(n) && n >= 1 ? n : null;
}
