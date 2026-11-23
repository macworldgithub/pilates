import { artwork } from '../src/data/artwork';
import { API_BASE_URL } from '../src/api/config';
test('images resolve from backend media paths without consulting a local ID map', () => {
  expect(artwork({ id: 'core-collective', imageUrl: '/media/images/studios/custom.jpg' })).toEqual({ uri: API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/media/images/studios/custom.jpg' });
  expect(artwork({ id: 'core-collective', imageUrl: 'https://images.example.com/changed.jpg' })).toEqual({ uri: 'https://images.example.com/changed.jpg' });
  expect(artwork({ id: 'core-collective' })).toEqual({ uri: undefined });
});
