import type { ImageSourcePropType } from 'react-native';
import { API_BASE_URL } from '../api/config';

// Media paths are returned by the backend; resolve them on the same host used
// for API requests (including 10.0.2.2 on the Android emulator).
export function artwork(record: { id?: string; imageUrl?: string | null }): ImageSourcePropType {
  const url = record.imageUrl;
  return { uri: url?.startsWith('/') ? API_BASE_URL.replace(/\/api\/v1\/?$/, '') + url : url || undefined };
}
