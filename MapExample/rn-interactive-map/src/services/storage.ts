import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  COMPLETED_ITEMS: 'completed_items',
  USER_PREFERENCES: 'user_preferences',
};

export const storageService = {
  async saveCompletedItem(itemId) {
    try {
      const completedItems = await this.getCompletedItems();
      if (!completedItems.includes(itemId)) {
        completedItems.push(itemId);
        await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_ITEMS, JSON.stringify(completedItems));
      }
    } catch (error) {
      console.error('Error saving completed item:', error);
    }
  },

  async getCompletedItems() {
    try {
      const completedItems = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_ITEMS);
      return completedItems ? JSON.parse(completedItems) : [];
    } catch (error) {
      console.error('Error retrieving completed items:', error);
      return [];
    }
  },

  async saveUserPreferences(preferences) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  },

  async getUserPreferences() {
    try {
      const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return {};
    }
  },
};