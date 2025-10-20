import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, ChatMessage } from '../api/types';
import { STORAGE_KEYS, DEBUG_CONFIG } from './constants';

// Generic storage functions
const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    if (DEBUG_CONFIG.enableLogs) {
      console.log(`✅ Stored data for key: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Error storing data for key ${key}:`, error);
    throw error;
  }
};

const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null) {
      const data = JSON.parse(jsonValue) as T;
      if (DEBUG_CONFIG.enableLogs) {
        console.log(`✅ Retrieved data for key: ${key}`);
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error retrieving data for key ${key}:`, error);
    return null;
  }
};

const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    if (DEBUG_CONFIG.enableLogs) {
      console.log(`✅ Removed data for key: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Error removing data for key ${key}:`, error);
    throw error;
  }
};

// Recipe storage functions
export const storeRecipes = async (recipes: Recipe[]): Promise<void> => {
  await storeData(STORAGE_KEYS.RECIPES, recipes);
};

export const getRecipes = async (): Promise<Recipe[]> => {
  const recipes = await getData<Recipe[]>(STORAGE_KEYS.RECIPES);
  return recipes || [];
};

export const addRecipe = async (recipe: Recipe): Promise<void> => {
  const existingRecipes = await getRecipes();
  const updatedRecipes = [...existingRecipes, recipe];
  await storeRecipes(updatedRecipes);
};

export const updateRecipe = async (recipeId: string, updatedRecipe: Recipe): Promise<void> => {
  const existingRecipes = await getRecipes();
  const updatedRecipes = existingRecipes.map(recipe => 
    recipe.id === recipeId ? updatedRecipe : recipe
  );
  await storeRecipes(updatedRecipes);
};

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  const existingRecipes = await getRecipes();
  const updatedRecipes = existingRecipes.filter(recipe => recipe.id !== recipeId);
  await storeRecipes(updatedRecipes);
};

// Favorites storage functions
export const storeFavorites = async (favoriteIds: string[]): Promise<void> => {
  await storeData(STORAGE_KEYS.FAVORITES, favoriteIds);
};

export const getFavorites = async (): Promise<string[]> => {
  const favorites = await getData<string[]>(STORAGE_KEYS.FAVORITES);
  return favorites || [];
};

export const addToFavorites = async (recipeId: string): Promise<void> => {
  const favorites = await getFavorites();
  if (!favorites.includes(recipeId)) {
    const updatedFavorites = [...favorites, recipeId];
    await storeFavorites(updatedFavorites);
  }
};

export const removeFromFavorites = async (recipeId: string): Promise<void> => {
  const favorites = await getFavorites();
  const updatedFavorites = favorites.filter(id => id !== recipeId);
  await storeFavorites(updatedFavorites);
};

export const isFavorite = async (recipeId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.includes(recipeId);
};

// Chat history storage functions
export const storeChatHistory = async (chatId: string, messages: ChatMessage[]): Promise<void> => {
  const key = `${STORAGE_KEYS.CHAT_HISTORY}_${chatId}`;
  await storeData(key, messages);
};

export const getChatHistory = async (chatId: string): Promise<ChatMessage[]> => {
  const key = `${STORAGE_KEYS.CHAT_HISTORY}_${chatId}`;
  const messages = await getData<ChatMessage[]>(key);
  return messages || [];
};

export const addChatMessage = async (chatId: string, message: ChatMessage): Promise<void> => {
  const existingMessages = await getChatHistory(chatId);
  const updatedMessages = [...existingMessages, message];
  await storeChatHistory(chatId, updatedMessages);
};

export const clearChatHistory = async (chatId: string): Promise<void> => {
  const key = `${STORAGE_KEYS.CHAT_HISTORY}_${chatId}`;
  await removeData(key);
};

// Settings storage functions
export const storeSettings = async (settings: any): Promise<void> => {
  await storeData(STORAGE_KEYS.SETTINGS, settings);
};

export const getSettings = async (): Promise<any> => {
  const settings = await getData(STORAGE_KEYS.SETTINGS);
  return settings || {};
};

// Clear all data (useful for logout or reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.RECIPES,
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.SETTINGS,
    ]);
    
    // Clear all chat histories
    const keys = await AsyncStorage.getAllKeys();
    const chatKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CHAT_HISTORY));
    if (chatKeys.length > 0) {
      await AsyncStorage.multiRemove(chatKeys);
    }
    
    if (DEBUG_CONFIG.enableLogs) {
      console.log('✅ Cleared all app data');
    }
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    throw error;
  }
};

// Get storage usage info
export const getStorageInfo = async (): Promise<{ keys: string[]; size: number }> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = await AsyncStorage.multiGet(keys);
    
    let totalSize = 0;
    data.forEach(([key, value]) => {
      if (value) {
        totalSize += value.length;
      }
    });
    
    return { keys, size: totalSize };
  } catch (error) {
    console.error('❌ Error getting storage info:', error);
    return { keys: [], size: 0 };
  }
};
