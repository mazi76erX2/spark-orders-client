import { describe, expect, it } from 'vitest';
import { messageFor } from './api';
import { money, percent } from './format';
import { linesReducer, parseQuantity } from './orderLines';

describe('messageFor', () => {
  it('shows API validation messages as written', () => {
    expect(messageFor(400, { error: 'CustomerName is required.' })).toBe('CustomerName is required.');
  });
  it('hides the 500 detail behind a friendly message', () => {
    expect(messageFor(500, { Error: 'An unexpected error occurred.' })).toMatch(/try again/i);
  });
  it('recognises gateway rejections', () => {
    expect(messageFor(401, { statusCode: 401, message: 'Access denied' })).toMatch(/refused access/);
  });
});

describe('formatting', () => {
  it('formats rand amounts and discount tiers', () => {
    expect(money(2610)).toBe('R2,610.00');
    expect(percent(0.1)).toBe('10%');
    expect(percent(0.03)).toBe('3%');
  });
});

describe('order lines', () => {
  it('merges duplicate products, edits and removes lines', () => {
    let lines = linesReducer([], { type: 'add', productID: 4, quantity: 2 });
    lines = linesReducer(lines, { type: 'add', productID: 4, quantity: 1 });
    expect(lines).toEqual([{ productID: 4, quantity: 3 }]);
    lines = linesReducer(lines, { type: 'setQuantity', productID: 4, quantity: 5 });
    expect(lines[0].quantity).toBe(5);
    expect(linesReducer(lines, { type: 'remove', productID: 4 })).toEqual([]);
  });
  it('accepts only whole quantities of 1 or more', () => {
    expect(parseQuantity('3')).toBe(3);
    expect(parseQuantity('0')).toBeNull();
    expect(parseQuantity('1.5')).toBeNull();
    expect(parseQuantity('')).toBeNull();
  });
});
