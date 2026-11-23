import { Platform } from 'react-native';

// Android emulator reaches the host at 10.0.2.2. For a physical device, replace
// this development address with your computer's LAN IP and bind the API to 0.0.0.0.
// Release builds require your deployed HTTPS API URL here.
export const API_BASE_URL = __DEV__
  ? `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:4000/api/v1`
  : 'https://api.example.com/api/v1';
