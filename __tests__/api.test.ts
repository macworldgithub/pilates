import * as Keychain from 'react-native-keychain';
import { ApiError, OrbitApi } from '../src/api/client';

const response = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body });
const fetchMock = jest.fn();
beforeEach(() => {
  globalThis.fetch = fetchMock;
  fetchMock.mockReset();
  (Keychain.getGenericPassword as jest.Mock).mockReset().mockResolvedValue(false);
  (Keychain.setGenericPassword as jest.Mock).mockClear();
});

test('creates one session for concurrent initialization and stores its bearer token securely', async () => {
  const session = { id: 'consumer', token: 'consumer-secret', profile: {}, expiresAt: '2030-01-01' };
  fetchMock.mockResolvedValue(response(session));
  const client = new OrbitApi('http://test/api/v1');
  const results = await Promise.all([client.initialize(), client.initialize()]);
  expect(results[0].id).toBe('consumer'); expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(Keychain.setGenericPassword).toHaveBeenCalledWith('consumer', 'consumer-secret', expect.objectContaining({ service: 'com.projectorbit.prototype-session' }));
});
test('restores an existing session without creating another session', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({ password: 'saved-token' });
  fetchMock.mockResolvedValue(response({ id: 'saved', profile: { onboardingComplete: true } }));
  await new OrbitApi('http://test').initialize();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('http://test/sessions/me', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer saved-token' }) }));
});
test('replaces expired credentials but preserves the session during a network failure', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({ password: 'expired' });
  fetchMock.mockResolvedValueOnce(response({ error: { message: 'Expired' } }, 401)).mockResolvedValueOnce(response({ id: 'new', token: 'new-token', profile: {} }));
  await new OrbitApi('http://test').initialize();
  expect(fetchMock).toHaveBeenCalledTimes(2);
  fetchMock.mockReset().mockRejectedValue(new TypeError('offline'));
  await expect(new OrbitApi('http://test').initialize()).rejects.toThrow('Cannot reach Project Orbit');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
test('sends variant quantity and checkout idempotency key using the consumer token', async () => {
  const client = new OrbitApi('http://test');
  fetchMock.mockResolvedValueOnce(response({ id: 's', token: 'consumer', profile: {} })).mockResolvedValue(response({}));
  await client.initialize();
  await client.putItem('grip-socks-pink', 'pink-m', 2);
  expect(fetchMock).toHaveBeenLastCalledWith('http://test/shop/cart/items', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ productId: 'grip-socks-pink', variantId: 'pink-m', quantity: 2 }) }));
  const input = { fulfillment: 'delivery' as const, source: 'app' as const };
  await client.checkout(input, 'same-key-for-retries');
  expect(fetchMock).toHaveBeenLastCalledWith('http://test/shop/checkout', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer consumer', 'Idempotency-Key': 'same-key-for-retries' }), body: JSON.stringify(input) }));
});
test('encodes filters and separates runtime admin credentials from consumer requests', async () => {
  const client = new OrbitApi('http://test');
  fetchMock.mockResolvedValue(response({ data: [] }));
  client.setAdminToken(' private-admin ');
  await client.adminList('studios');
  expect(fetchMock).toHaveBeenLastCalledWith('http://test/admin/studios?limit=100', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer private-admin' }) }));
  await client.studios({ search: 'Core & Flow', latitude: 0, longitude: 0, format: undefined });
  expect(fetchMock.mock.calls.at(-1)[0]).toBe('http://test/studios?search=Core%20%26%20Flow&latitude=0&longitude=0');
  expect(fetchMock.mock.calls.at(-1)[1].headers.Authorization).toBeUndefined();
  client.clearAdminToken();
});
test('exposes API errors without treating a rejection as a successful purchase', async () => {
  fetchMock.mockResolvedValue(response({ error: { message: 'Cart is empty' } }, 400));
  await expect(new OrbitApi('http://test').quote({ fulfillment: 'delivery', source: 'app' })).rejects.toEqual(new ApiError(400, 'Cart is empty'));
});

test('staff login and logout use the current session without replacing its token', async () => {
  const client = new OrbitApi('http://test');
  fetchMock.mockResolvedValueOnce(response({ id: 'session', token: 'session-token', profile: {} }));
  await client.initialize();
  fetchMock.mockResolvedValue(response({ id: 'session', accountType: 'staff', profile: {} }));
  await client.staffLogin('staff', 'OrbitStaff123!');
  expect(fetchMock).toHaveBeenLastCalledWith('http://test/auth/login', expect.objectContaining({
    method: 'POST',
    headers: expect.objectContaining({ Authorization: expect.any(String) }),
    body: JSON.stringify({ username: 'staff', password: 'OrbitStaff123!' }),
  }));
  await client.staffLogout();
  expect(fetchMock).toHaveBeenLastCalledWith('http://test/auth/logout', expect.objectContaining({
    method: 'POST',
    headers: expect.objectContaining({ Authorization: expect.any(String) }),
  }));
});

test('admin login exchanges fixed credentials for a backend token and logout revokes it', async () => {
  const client = new OrbitApi('http://test');
  fetchMock.mockResolvedValueOnce(response({ accessToken: 'server-issued', expiresAt: '2030-01-01' })).mockResolvedValue(response({}));
  await client.adminLogin('admin', 'OrbitAdmin123!');
  expect(fetchMock).toHaveBeenLastCalledWith('http://test/admin/auth/login', expect.objectContaining({ method: 'POST', body: JSON.stringify({ username: 'admin', password: 'OrbitAdmin123!' }) }));
  await client.adminList('studios');
  expect(fetchMock.mock.calls.at(-1)[1].headers.Authorization).toBe('Bearer server-issued');
  await client.adminLogout();
  expect(fetchMock).toHaveBeenLastCalledWith('http://test/admin/auth/session', expect.objectContaining({ method: 'DELETE', headers: expect.objectContaining({ Authorization: 'Bearer server-issued' }) }));
});

test('reuses the in-memory session if native secure storage is unavailable', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(new Error('Native module unavailable'));
  (Keychain.setGenericPassword as jest.Mock).mockRejectedValue(new Error('Native module unavailable'));
  fetchMock.mockResolvedValueOnce(response({ id: 'memory', token: 'memory-token', profile: {} }))
    .mockResolvedValueOnce(response({ id: 'memory', profile: {} }));
  const client = new OrbitApi('http://test');
  await client.initialize(); await client.initialize();
  expect(fetchMock.mock.calls.map(call => call[1].method)).toEqual(['POST', 'GET']);
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer memory-token');
});
