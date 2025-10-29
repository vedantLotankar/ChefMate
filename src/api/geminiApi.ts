import { apiClient } from './apiClient';
import { CookingDetailsRequest, CookingDetailsResponse, DetailedStep } from './types';
import { DEBUG_CONFIG, STORAGE_KEYS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generate detailed cooking steps for a recipe using Gemini AI
 * 
 * This function:
 * 1. Checks cache first
 * 2. If not cached, calls backend API
 * 3. Caches the response for future use
 * 4. Returns detailed steps with timers
 */
export const getCookingDetailsFromGemini = async (
  recipe: CookingDetailsRequest['recipe']
): Promise<DetailedStep[]> => {
  try {
    const recipeId = recipe.name.toLowerCase().replace(/\s+/g, '-');
    const cacheKey = `${STORAGE_KEYS.CHAT_HISTORY}_cooking_${recipeId}`;

    // Check cache first
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (cacheAge < maxAge) {
          if (DEBUG_CONFIG.enableLogs) {
            console.log('📦 Using cached cooking details for:', recipe.name);
          }
          return parsed.detailedSteps;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (cacheError) {
      console.log('⚠️ Cache read error:', cacheError);
    }

    // Not in cache, fetch from API
    if (DEBUG_CONFIG.enableLogs) {
      console.log('🌐 Fetching cooking details from Gemini for:', recipe.name);
    }

    const response = await apiClient.post<CookingDetailsResponse>(
      '/api/chat/cooking-details',
      { recipe }
    );

    if (!response.data.success || !response.data.all_steps) {
      throw new Error('Invalid response from API');
    }

    // Cache the response
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        detailedSteps: response.data.all_steps,
        timestamp: Date.now(),
      }));
      if (DEBUG_CONFIG.enableLogs) {
        console.log('💾 Cached cooking details for:', recipe.name);
      }
    } catch (cacheError) {
      console.log('⚠️ Cache write error:', cacheError);
    }

    return response.data.all_steps;

  } catch (error) {
    console.error('❌ Error getting cooking details:', error);
    
    // Return fallback: convert recipe steps to detailed format
    return recipe.steps.map((step, index) => ({
      step_title: `Step ${step.stepNumber}: ${step.description}`,
      detailed_steps: [
        step.description,
        'Follow the recipe instructions carefully.',
        'Use appropriate equipment and techniques.',
      ],
      estimated_time_minutes: step.duration || Math.ceil((recipe.cookTime / recipe.steps.length) || 5),
    }));
  }
};

/**
 * Clear cached cooking details for a specific recipe
 */
export const clearCookingDetailsCache = async (recipeName: string): Promise<void> => {
  const recipeId = recipeName.toLowerCase().replace(/\s+/g, '-');
  const cacheKey = `${STORAGE_KEYS.CHAT_HISTORY}_cooking_${recipeId}`;
  
  try {
    await AsyncStorage.removeItem(cacheKey);
    if (DEBUG_CONFIG.enableLogs) {
      console.log('🗑️ Cleared cooking details cache for:', recipeName);
    }
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};

/**
 * Clear all cooking details cache
 */
export const clearAllCookingDetailsCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cookingKeys = keys.filter(key => key.includes('_cooking_'));
    
    if (cookingKeys.length > 0) {
      await AsyncStorage.multiRemove(cookingKeys);
      if (DEBUG_CONFIG.enableLogs) {
        console.log('🗑️ Cleared all cooking details cache');
      }
    }
  } catch (error) {
    console.error('❌ Error clearing all cache:', error);
  }
};
