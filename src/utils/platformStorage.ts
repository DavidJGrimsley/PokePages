// Universal storage adapter for cross-platform support
// Works with web localStorage and React Native AsyncStorage
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Universal async adapter
export const universalStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Check for web at runtime to handle SSR
      const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';
      let result: string | null;
      if (isWeb) {
        result = window.localStorage.getItem(key);
      } else {
        result = await AsyncStorage.getItem(key);
      }
      return result;
    } catch (error) {
      console.error('[STORAGE] Error getting storage item:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';
      if (isWeb) {
        window.localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('[STORAGE] Error setting storage item:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';
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
      const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';
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
      const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';
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
