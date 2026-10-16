export const money = (n: number): string =>
  'R' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const percent = (fraction: number): string => `${Math.round(Number(fraction) * 100)}%`;
