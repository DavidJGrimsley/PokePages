import { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';

const COMPLETION_STORAGE_KEY = '@completion_status';

export const useCompletion = () => {
  const [completedItems, setCompletedItems] = useState([]);

  useEffect(() => {
    const loadCompletionStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem(COMPLETION_STORAGE_KEY);
        if (storedStatus) {
          setCompletedItems(JSON.parse(storedStatus));
        }
      } catch (error) {
        console.error('Failed to load completion status:', error);
      }
    };

    loadCompletionStatus();
  }, []);

  const markAsComplete = async (itemId) => {
    const updatedCompletedItems = [...completedItems, itemId];
    setCompletedItems(updatedCompletedItems);
    await AsyncStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(updatedCompletedItems));
  };

  const isComplete = (itemId) => completedItems.includes(itemId);

  return {
    completedItems,
    markAsComplete,
    isComplete,
  };
};