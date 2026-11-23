import type { ImageSourcePropType } from 'react-native';
import { API_BASE_URL } from '../api/config';

export function resolveArtworkUrl(value?: string | null, baseUrl = API_BASE_URL): string | undefined {
  const url = value?.trim();
  if (!url) { return undefined; }
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');
  if (url.startsWith('/media/')) { return origin + url; }
  if (url.startsWith('media/')) { return `${origin}/${url}`; }
  // Seed data exported from another machine must use this device's API host.
  const localMedia = url.match(/^https?:\/\/(?:localhost|127\.0\.0\.1|10\.0\.2\.2)(?::\d+)?(\/media\/[^?#]+(?:[?#].*)?)$/i);
  if (localMedia) { return origin + localMedia[1]; }
  return /^https?:\/\//i.test(url) ? url : undefined;
}
export function artwork(record: { id?: string; imageUrl?: string | null }): ImageSourcePropType {
  return { uri: resolveArtworkUrl(record.imageUrl) };
}
