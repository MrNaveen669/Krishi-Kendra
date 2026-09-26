import { Platform, StatusBar } from 'react-native';

let extraConfig = {};
try {
  const Constants = require('expo-constants');
  extraConfig = Constants?.expoConfig?.extra || {};
} catch (error) {
  extraConfig = {};
}

const GOOGLE_SCRIPT_URL = extraConfig.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx7Ikr970kjrgXMbXzOiYqrAI8I19-jKnL3FSTD1Lh8lfIjT8wW5JNfZoecnfQQCjy5/exec';
const ANDROID_STATUS_BAR = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;
const CEMENT_LOW_STOCK_THRESHOLD = 10;

export { GOOGLE_SCRIPT_URL, ANDROID_STATUS_BAR, CEMENT_LOW_STOCK_THRESHOLD };
