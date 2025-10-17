// Universal storage adapter for cross-platform support
// Works with web localStorage and React Native AsyncStorage
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to detect web
const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';

// Universal async adapter
export const universalStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      console.log(`[STORAGE] Getting item with key: ${key}, platform: ${Platform.OS}`);
      let result: string | null;
      if (isWeb) {
        result = window.localStorage.getItem(key);
      } else {
        result = await AsyncStorage.getItem(key);
      }
      console.log(`[STORAGE] Retrieved ${result ? result.length : 0} characters for key: ${key}`);
      return result;
    } catch (error) {
      console.error('[STORAGE] Error getting storage item:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log(`[STORAGE] Setting item with key: ${key}, value length: ${value.length}, platform: ${Platform.OS}`);
      if (isWeb) {
        window.localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
      console.log(`[STORAGE] Successfully saved to key: ${key}`);
    } catch (error) {
      console.error('[STORAGE] Error setting storage item:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isWeb) {
        window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing storage item:', error);
      throw error;
    }
  },

  async getAllKeys(): Promise<readonly string[]> {
    try {
      if (isWeb) {
        return Object.keys(window.localStorage);
      } else {
        return await AsyncStorage.getAllKeys();
      }
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  async clear(): Promise<void> {
    try {
      if (isWeb) {
        window.localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
};
