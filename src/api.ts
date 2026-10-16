import type { NewOrder, Order, Product, User } from './types';

const BASE = '/api';
const TIMEOUT_MS = 15_000;

interface ErrorBody { error?: string; Error?: string; message?: string; statusCode?: number }

export class ApiError extends Error {
  constructor(public status: number, message: string, public gateway = false) {
    super(message);
  }
}

export function messageFor(status: number, body: ErrorBody | null): string {
  if (body?.statusCode) {
    return `The ordering service refused access (${status}). Please contact support.`;
  }
  if (status >= 500) return 'The server hit a problem. Please try again in a moment.';
  const message = body?.error || body?.Error || body?.message;
  return message ?? `Something went wrong (${status}). Please try again.`;
}

export const errorText = (err: unknown): string =>
  err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';

async function request<T>(path: string, method = 'GET', json?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: json === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: json === undefined ? undefined : JSON.stringify(json),
      signal: controller.signal,
    });
  } catch (e) {
    throw new ApiError(
      0,
      (e as Error).name === 'AbortError'
        ? 'The server took too long to respond. Please try again.'
        : "Can't reach the server. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    const err = body as ErrorBody | null;
    throw new ApiError(res.status, messageFor(res.status, err), Boolean(err?.statusCode));
  }
  return body as T;
}

export const authenticate = (username: string, password: string) =>
  request<User>('/Users/Authenticate', 'POST', { username, password });
export const getProducts = () => request<Product[]>('/Products');
export const createOrder = (order: NewOrder) => request<Order>('/Orders', 'POST', order);
