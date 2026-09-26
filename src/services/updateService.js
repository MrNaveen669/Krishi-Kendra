import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import appConfig from '../../app.json';
import { GOOGLE_SCRIPT_URL } from '../config/constants';

// Current App Version (app.json se)
export const CURRENT_VERSION = appConfig.expo.version || '1.0.0';

/**
 * Server se check karta hai ki koi naya version aaya hai ya nahi
 */
export async function fetchLatestUpdateInfo() {
  if (!GOOGLE_SCRIPT_URL) return null;
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkUpdate`);
    const json = await res.json();
    if (json.status === 'success') {
      const isNewAvailable = json.latestVersion > CURRENT_VERSION;
      return {
        ...json,
        hasUpdate: isNewAvailable
      };
    }
  } catch (e) {
    // offline/error handling
  }
  return null;
}

/**
 * APK download karke Android package installer ko trigger karta hai
 */
export async function downloadAndInstallApk(apkUrl, onProgress) {
  if (Platform.OS !== 'android') return;

  const targetUri = `${FileSystem.documentDirectory}krishi-kendra-update.apk`;

  const downloadResumable = FileSystem.createDownloadResumable(
    apkUrl,
    targetUri,
    {},
    (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      if (typeof onProgress === 'function') {
        onProgress(Math.floor(progress * 100));
      }
    }
  );

  const downloadResult = await downloadResumable.downloadAsync();
  if (downloadResult && downloadResult.uri) {
    // Android Content URI generate karein
    const cUri = await FileSystem.getContentUriAsync(downloadResult.uri);

    // Auto-launch Android Installer Screen
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: cUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: 'application/vnd.android.package-archive'
    });
  }
}