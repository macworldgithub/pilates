import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import App from '../App';
import { api } from '../src/api/client';
import { BottomNav, Button } from '../src/components/OrbitUI';
import { ProductCard } from '../src/components/OrbitUI';
import { StudioCard } from '../src/components/OrbitCards';

const profile = { area: 'Melbourne, VIC', latitude: -37.84, longitude: 144.98, formats: ['reformer'], interests: ['strength'], onboardingComplete: true };
const studio = { id: 'core-collective', name: 'Core Collective', address: '12 Greville Street, Prahran VIC', formats: ['reformer', 'mat'], description: 'Studio description', partnerType: 'partner', websiteUrl: 'https://example.com', bookingUrl: 'https://example.com/book', instructors: [], workouts: [], referrals: [] };
const product = { id: 'grip-socks-pink', title: 'Crew Grip Socks · Sweetie Candy Pink', description: 'Pink grip socks', collection: 'grip-socks', currency: 'AUD', variants: [{ id: 'pink-m', title: 'M / Candy Pink', price: 2295, available: true }], bundleProductIds: [] };
const cartItem = { productId: product.id, variantId: 'pink-m', quantity: 1, productTitle: product.title, variantTitle: 'M / Candy Pink', currency: 'AUD', unitPrice: 2295, lineTotal: 2295, available: true };
const cart = { items: [cartItem], subtotal: 2295, currency: 'AUD', revision: 1, checkoutReady: true };
const emptyCart = { items: [], subtotal: 0, currency: null, revision: 0, checkoutReady: false };
const quote = { items: [cartItem], currency: 'AUD', subtotal: 2295, discount: 0, shipping: 800, total: 3095, attribution: null, fulfillment: 'delivery', notice: 'Demo only' };
let tree: ReactTestRenderer.ReactTestRenderer;
const list = (data: any[]) => ({ data, pagination: { total: data.length, pages: 1, page: 1, limit: 100 } });
beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'setImmediate', 'nextTick'] });
  jest.spyOn(api, 'initialize').mockResolvedValue({ id: 'session', profile, expiresAt: '2030-01-01' } as any);
  jest.spyOn(api, 'cart').mockResolvedValue(emptyCart as any);
  jest.spyOn(api, 'orders').mockResolvedValue(list([]));
  jest.spyOn(api, 'collections').mockResolvedValue({ data: ['grip-socks', 'bundles'] });
  jest.spyOn(api, 'config').mockResolvedValue({
    heroImageUrl: '/media/images/lifestyle/onboarding-hero.jpg', shopHeroImageUrl: '/media/images/products/yoga-mat-espresso.png',
    areas: [{ area: 'Melbourne, VIC', latitude: -37.84, longitude: 144.98 }], formats: ['reformer', 'mat'],
    interestOptions: [{ label: 'Strength', value: 'strength' }],
  });
  jest.spyOn(api, 'referrals').mockResolvedValue(list([]));
  jest.spyOn(api, 'adminLogin').mockResolvedValue({ accessToken: 'issued-admin-token', expiresAt: '2030-01-01' });
  jest.spyOn(api, 'studios').mockResolvedValue(list([studio]) as any);
  jest.spyOn(api, 'workouts').mockResolvedValue(list([]));
  jest.spyOn(api, 'products').mockResolvedValue(list([product]) as any);
  jest.spyOn(api, 'offers').mockResolvedValue(list([]));
  jest.spyOn(api, 'studio').mockResolvedValue(studio as any);
  jest.spyOn(api, 'product').mockResolvedValue(product as any);
  jest.spyOn(api, 'event').mockResolvedValue(undefined);
});
afterEach(async () => {
  if (tree) { await act(async () => tree.unmount()); }
  jest.useRealTimers(); jest.restoreAllMocks();
});
async function step(fn: () => void) {
  await act(async () => { fn(); });
  await act(async () => { jest.advanceTimersByTime(300); });
}
async function render() { await step(() => { tree = ReactTestRenderer.create(<App />); }); }
function button(label: string) { return tree.root.findAllByType(Button).find(node => node.props.label === label)!; }

test('restores a session and opens the specific API-backed studio selected by the user', async () => {
  await render();
  expect(JSON.stringify(tree.toJSON())).toContain('Core Collective');
  await step(() => tree.root.findByType(StudioCard).props.onPress());
  expect(api.studio).toHaveBeenCalledWith('core-collective');
  expect(JSON.stringify(tree.toJSON())).toContain('12 Greville Street, Prahran VIC');
});
test('onboarding persists the selected interests and format before entering discovery', async () => {
  (api.initialize as jest.Mock).mockResolvedValue({ id: 'session', profile: {} });
  jest.spyOn(api, 'profile').mockResolvedValue({ id: 'session', profile } as any);
  await render();
  await step(() => button('Build my Pilates world →').props.onPress());
  expect(api.profile).toHaveBeenCalledWith(expect.objectContaining({ area: 'Melbourne, VIC', interests: ['strength'], formats: ['reformer'], onboardingComplete: true }));
  expect(tree.root.findByType(BottomNav).props.screen).toBe('discover');
});
test('product -> bag -> quote -> confirmed order uses API amounts and clears the badge', async () => {
  jest.spyOn(api, 'putItem').mockResolvedValue(cart as any);
  jest.spyOn(api, 'quote').mockResolvedValue(quote as any);
  jest.spyOn(api, 'checkout').mockResolvedValue({ ...quote, id: 'demo-api-order', status: 'demo-confirmed', createdAt: '2026-11-23' } as any);
  await render();
  await step(() => tree.root.findByType(BottomNav).props.onSelect('shop'));
  await step(() => tree.root.findByType(ProductCard).props.onPress());
  expect(api.product).toHaveBeenCalledWith(product.id);
  await step(() => button('Add to bag · AUD 22.95').props.onPress());
  expect(api.putItem).toHaveBeenCalledWith(product.id, 'pink-m', 1);
  expect(tree.root.findByType(BottomNav).props.bagCount).toBe(1);
  await step(() => button('View bag (1)').props.onPress());
  await step(() => button('Review demo checkout').props.onPress());
  expect(api.quote).toHaveBeenCalledWith({ fulfillment: 'delivery', source: 'app' });
  await step(() => button('Confirm demo order').props.onPress());
  expect(api.checkout).toHaveBeenCalledWith({ fulfillment: 'delivery', source: 'app' }, expect.stringMatching(/^app-/));
  expect(JSON.stringify(tree.toJSON())).toContain('demo-api-order');
  expect(JSON.stringify(tree.toJSON())).toContain('AUD 30.95');
  await step(() => button('Keep shopping').props.onPress());
  expect(tree.root.findByType(BottomNav).props.bagCount).toBe(0);
});
test('a failed checkout stays on review and reuses the idempotency key on retry', async () => {
  (api.cart as jest.Mock).mockResolvedValue(cart);
  jest.spyOn(api, 'quote').mockResolvedValue(quote as any);
  jest.spyOn(api, 'checkout').mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValueOnce({ ...quote, id: 'demo-retry', status: 'demo-confirmed' } as any);
  await render();
  await step(() => tree.root.findByType(BottomNav).props.onSelect('shop'));
  await step(() => tree.root.findAllByType(Button).find(n => n.props.label === 'View bag (1)')?.props.onPress() ?? tree.root.findByType(BottomNav).props.onSelect('bag'));
  await step(() => button('Review demo checkout').props.onPress());
  await step(() => button('Confirm demo order').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Connection lost');
  await step(() => button('Confirm demo order').props.onPress());
  const calls = (api.checkout as jest.Mock).mock.calls;
  expect(calls[0][1]).toBe(calls[1][1]);
  expect(JSON.stringify(tree.toJSON())).toContain('demo-retry');
});
test('an offline boot shows an actionable error and does not pretend data was loaded', async () => {
  (api.initialize as jest.Mock).mockRejectedValue(new Error('Cannot reach Project Orbit'));
  await render();
  expect(JSON.stringify(tree.toJSON())).toContain('Cannot reach Project Orbit');
  expect(button('Build my Pilates world →').props.disabled).toBe(true);
  expect(button('Retry connection')).toBeDefined();
});
test('admin logs in with username/password through the backend before loading protected data', async () => {
  jest.spyOn(api, 'adminList').mockImplementation(async kind => list(kind === 'studios' ? [studio] : []) as any);
  await render();
  await step(() => tree.root.findByType(BottomNav).props.onSelect('you'));
  await step(() => button('MoveActive admin').props.onPress());
  expect(api.adminList).not.toHaveBeenCalled();
  await step(() => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Admin username')!.props.onChangeText('admin'));
  await step(() => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Admin password')!.props.onChangeText('OrbitAdmin123!'));
  await step(() => button('Log in').props.onPress());
  expect(api.adminLogin).toHaveBeenCalledWith('admin', 'OrbitAdmin123!');
  expect(api.adminList).toHaveBeenCalledWith('affiliations');
  expect(JSON.stringify(tree.toJSON())).toContain('Core Collective');
});

test('admin edits persist through the protected API instead of a local save notice', async () => {
  jest.spyOn(api, 'adminList').mockImplementation(async kind => list(kind === 'studios' ? [{ ...studio, city: 'Melbourne', latitude: -37.84, longitude: 144.98 }] : []) as any);
  jest.spyOn(api, 'adminSave').mockResolvedValue({});
  await render();
  await step(() => tree.root.findByType(BottomNav).props.onSelect('you'));
  await step(() => button('MoveActive admin').props.onPress());
  await step(() => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Admin username')!.props.onChangeText('admin'));
  await step(() => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Admin password')!.props.onChangeText('OrbitAdmin123!'));
  await step(() => button('Log in').props.onPress());
  await step(() => button('Edit record').props.onPress());
  await step(() => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Name')!.props.onChangeText('Updated Core Collective'));
  await step(() => button('Save changes').props.onPress());
  expect(api.adminSave).toHaveBeenCalledWith('studios', expect.objectContaining({ name: 'Updated Core Collective' }), 'core-collective');
});

test('backend content replaces fixture names and an empty API list does not show local mock records', async () => {
  (api.studios as jest.Mock).mockResolvedValue(list([{ ...studio, id: 'server-studio', name: 'Backend Changed Studio' }]));
  (api.products as jest.Mock).mockResolvedValue(list([]));
  await render();
  expect(JSON.stringify(tree.toJSON())).toContain('Backend Changed Studio');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Core Collective');
  await step(() => tree.root.findByType(BottomNav).props.onSelect('shop'));
  expect(tree.root.findAllByType(ProductCard)).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).not.toContain(product.title);
});

test('rejected admin credentials leave the login form visible and do not load protected records', async () => {
  (api.adminLogin as jest.Mock).mockRejectedValue(new Error('Invalid username or password'));
  jest.spyOn(api, 'adminList');
  await render();
  await step(() => tree.root.findByType(BottomNav).props.onSelect('you'));
  await step(() => button('MoveActive admin').props.onPress());
  await step(() => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Admin username')!.props.onChangeText('wrong'));
  await step(() => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Admin password')!.props.onChangeText('wrong'));
  await step(() => button('Log in').props.onPress());
  expect(api.adminList).not.toHaveBeenCalled();
  expect(JSON.stringify(tree.toJSON())).toContain('Invalid username or password');
  expect(button('Log in')).toBeDefined();
});
