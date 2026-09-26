import AsyncStorage from '@react-native-async-storage/async-storage';

const loadJSON = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

const saveJSON = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
};

export { loadJSON, saveJSON };
