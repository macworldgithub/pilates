import { Platform } from 'react-native';

const deployedApiUrl = 'https://pilates-backend-sigma.vercel.app/api/v1';
// Forward the development machine's port with adb reverse tcp:4000 tcp:4000.
const androidLocalApiUrl = 'http://127.0.0.1:4000/api/v1';

export const API_BASE_URL =
  __DEV__ && Platform.OS === 'android' ? androidLocalApiUrl : deployedApiUrl;
