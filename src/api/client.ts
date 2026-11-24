let KeychainModule: typeof import('react-native-keychain') | null = null;
try {
  KeychainModule = require('react-native-keychain');
} catch {
  // Native module not linked in binary; fallback to memory token
}
import { API_BASE_URL } from './config';
import type { Affiliation, AppConfig, Cart, CheckoutInput, Instructor, List, Offer, Order, Product, Profile, Quote, Referral, Session, Studio, Workout } from './types';

const service = 'com.projectorbit.prototype-session';
export class ApiError extends Error {
  constructor(public status: number, message: string, public access?: 'public' | 'session' | 'admin') { super(message); this.name = 'ApiError'; }
}
export type Query = Record<string, string | number | undefined>;
export const money = (value: number | null | undefined, currency = 'AUD') => value == null ? 'Unavailable' : `${currency} ${(value / 100).toFixed(2)}`;
export class OrbitApi {
  private token = '';
  private adminToken = '';
  private opening?: Promise<Session>;
  constructor(private baseUrl = API_BASE_URL) {}
  setAdminToken(token: string) { this.adminToken = token.trim(); }
  clearAdminToken() { this.adminToken = ''; }
  async adminLogin(username: string, password: string) {
    const result = await this.request<{ accessToken: string; expiresAt: string }>('/admin/auth/login', 'POST', { username, password });
    this.adminToken = result.accessToken;
    return result;
  }
  async adminLogout() {
    try { if (this.adminToken) { await this.request('/admin/auth/session', 'DELETE', undefined, 'admin'); } }
    finally { this.adminToken = ''; }
  }
  staffLogin(username: string, password: string) {
    return this.request<Session>('/auth/login', 'POST', { username, password }, 'session');
  }
  staffLogout() {
    return this.request<Session>('/auth/logout', 'POST', undefined, 'session');
  }
  config() { return this.request<AppConfig>('/config'); }
  async request<T>(path: string, method = 'GET', body?: unknown, access: 'public' | 'session' | 'admin' = 'public', extraHeaders: Record<string, string> = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const token = access === 'admin' ? this.adminToken : this.token;
      const response = await fetch(`${this.baseUrl}${path}`, {
        method, signal: controller.signal,
        headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(access !== 'public' ? { Authorization: `Bearer ${token}` } : {}), ...extraHeaders },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      const result = await response.json();
      if (!response.ok) {
        const message = result.error?.message ?? result.message ?? 'Request failed';
        const detail = typeof message === 'string' ? message : Array.isArray(message) && message.every(item => typeof item === 'string') ? message.join('\n') : 'Please check the entered values and try again.';
        throw new ApiError(response.status, detail, access);
      }
      return result as T;
    } catch (error) {
      if (error instanceof ApiError) { throw error; }
      throw new ApiError(0, 'Cannot reach Project Orbit. Check your connection and retry.');
    } finally { clearTimeout(timeout); }
  }
  async initialize(): Promise<Session> {
    if (this.opening) { return this.opening; }
    this.opening = this.restore();
    try { return await this.opening; } finally { this.opening = undefined; }
  }
  private async restore(): Promise<Session> {
    let saved: import('react-native-keychain').UserCredentials | false | null = null;
    try {
      if (KeychainModule?.getGenericPassword) {
        saved = await KeychainModule.getGenericPassword({ service });
      }
    } catch {}
    if (saved || this.token) {
      this.token = saved ? saved.password : this.token;
      try { return await this.request<Session>('/sessions/me', 'GET', undefined, 'session'); }
      catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) { throw error; }
        this.token = '';
        try { await KeychainModule?.resetGenericPassword({ service }); } catch {}
      }
    }
    const created = await this.request<Session>('/sessions', 'POST');
    this.token = created.token!;
    try {
      if (KeychainModule?.setGenericPassword) {
        await KeychainModule.setGenericPassword(created.id, this.token, {
          service,
          accessible: KeychainModule.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
    } catch {}
    return created;
  }
  private query(query: Query) {
    const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== '');
    return entries.length ? '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&') : '';
  }
  profile(body: Profile) { return this.request<Session>('/sessions/me', 'PATCH', body, 'session'); }
  studios(query: Query = {}) { return this.request<List<Studio>>('/studios' + this.query(query)); }
  studio(id: string) { return this.request<Studio>(`/studios/${encodeURIComponent(id)}`); }
  instructor(id: string) { return this.request<Instructor>(`/instructors/${encodeURIComponent(id)}`); }
  workouts(query: Query = {}) { return this.request<List<Workout>>('/workouts' + this.query(query)); }
  workout(id: string) { return this.request<Workout>(`/workouts/${encodeURIComponent(id)}`); }
  products(query: Query = {}) { return this.request<List<Product>>('/shop/products' + this.query(query)); }
  product(id: string) { return this.request<Product>(`/shop/products/${encodeURIComponent(id)}`); }
  collections() { return this.request<{ data: string[] }>('/shop/collections'); }
  offers(query: Query) { return this.request<List<Offer>>('/offers' + this.query(query)); }
  cart() { return this.request<Cart>('/shop/cart', 'GET', undefined, 'session'); }
  clearCart() { return this.request<Cart>('/shop/cart', 'DELETE', undefined, 'session'); }
  putItem(productId: string, variantId: string, quantity: number) { return this.request<Cart>('/shop/cart/items', 'PUT', { productId, variantId, quantity }, 'session'); }
  removeItem(productId: string, variantId: string) { return this.request<Cart>(`/shop/cart/items/${encodeURIComponent(productId)}/${encodeURIComponent(variantId)}`, 'DELETE', undefined, 'session'); }
  quote(input: CheckoutInput) { return this.request<Quote>('/shop/checkout/quote', 'POST', input, 'session'); }
  checkout(input: CheckoutInput, key: string) { return this.request<Order>('/shop/checkout', 'POST', input, 'session', { 'Idempotency-Key': key }); }
  orders() { return this.request<List<Order>>('/shop/orders', 'GET', undefined, 'session'); }
  order(id: string) { return this.request<Order>(`/shop/orders/${encodeURIComponent(id)}`, 'GET', undefined, 'session'); }
  referral(code: string) { return this.request<Referral>(`/referrals/${encodeURIComponent(code)}`); }
  referrals() { return this.request<List<Referral>>('/referrals?limit=100'); }
  applyReferral(code: string) { return this.request('/referrals/apply', 'POST', { code }, 'session'); }
  event(name: string, entityId: string) { return this.request('/events', 'POST', { name, source: 'app', entityId }, 'session').catch(() => undefined); }
  adminList<T>(kind: string) { return this.request<List<T>>(`/admin/${kind}?limit=100`, 'GET', undefined, 'admin'); }
  adminSave(kind: string, body: Record<string, unknown>, id?: string) { return this.request(`/admin/${kind}${id ? '/' + encodeURIComponent(id) : ''}`, id ? 'PATCH' : 'POST', body, 'admin'); }
  adminAffiliation(studioId: string, instructorId: string) { return this.request<Affiliation>('/admin/affiliations', 'POST', { studioId, instructorId }, 'admin'); }
  adminRemoveAffiliation(studioId: string, instructorId: string) { return this.request(`/admin/affiliations/${encodeURIComponent(studioId)}/${encodeURIComponent(instructorId)}`, 'DELETE', undefined, 'admin'); }
}
export const api = new OrbitApi();
