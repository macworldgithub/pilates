import { artwork } from '../src/data/artwork';
import { API_BASE_URL } from '../src/api/config';
test('images resolve from backend media paths without consulting a local ID map', () => {
  expect(artwork({ id: 'core-collective', imageUrl: '/media/images/studios/custom.jpg' })).toEqual({ uri: API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/media/images/studios/custom.jpg' });
  expect(artwork({ id: 'core-collective', imageUrl: 'https://images.example.com/changed.jpg' })).toEqual({ uri: 'https://images.example.com/changed.jpg' });
  expect(artwork({ id: 'core-collective' })).toEqual({ uri: undefined });
});

test('media copied from another development host uses the active API host', () => {
  const { resolveArtworkUrl } = require('../src/data/artwork');
  const base = 'http://10.0.2.2:4000/api/v1';
  expect(resolveArtworkUrl('http://localhost:4000/media/images/products/socks.png', base)).toBe('http://10.0.2.2:4000/media/images/products/socks.png');
  expect(resolveArtworkUrl(' media/images/products/socks.png ', base)).toBe('http://10.0.2.2:4000/media/images/products/socks.png');
  expect(resolveArtworkUrl('https://cdn.example.com/socks.png', base)).toBe('https://cdn.example.com/socks.png');
  expect(resolveArtworkUrl('ftp://example.com/image.png', base)).toBeUndefined();
});
