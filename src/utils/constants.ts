import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API Configuration
// For Android emulator: use 10.0.2.2 to access host machine
// For iOS simulator: use localhost
// For physical devices: use actual IP address of your development machine
const getApiBaseUrl = () => {
  console.log('🔧 Platform.OS:', Platform.OS);
  console.log('🔧 __DEV__:', __DEV__);
  
  if (__DEV__) {
    if (Platform.OS === 'android') {
      const url = 'http://192.168.29.231:3000';
      console.log('🔧 Using Android URL:', url);
      return url;
    } else {
      const url = 'http://localhost:3000';
      console.log('🔧 Using iOS URL:', url);
      return url;
    }
  }
  const url = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:3000';
  console.log('🔧 Using production URL:', url);
  return url;
};

export const API_BASE_URL = getApiBaseUrl();
console.log('🔧 Final API_BASE_URL:', API_BASE_URL);

// Theme Colors
export const COLORS = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  accent: '#FFD23F',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E1E8ED',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
} as const;

// Blur Configuration
export const BLUR_CONFIG = {
  enabled: true, // Feature flag to disable blur for performance
  intensities: {
    light: 20,
    medium: 50,
    heavy: 80,
  },
  tints: {
    light: 'light',
    medium: 'default',
    heavy: 'dark',
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Typography
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Font Weights
export const FONT_WEIGHTS = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  RECIPES: 'chefmate_recipes',
  FAVORITES: 'chefmate_favorites',
  CHAT_HISTORY: 'chefmate_chat_history',
  SETTINGS: 'chefmate_settings',
} as const;

// Recipe Categories
export const RECIPE_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Appetizer',
  'Soup',
  'Salad',
  'Pasta',
  'Pizza',
  'Grilled',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Low-Carb',
  'Keto',
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: COLORS.success },
  { value: 'medium', label: 'Medium', color: COLORS.warning },
  { value: 'hard', label: 'Hard', color: COLORS.error },
] as const;

// Cooking Time Ranges
export const COOK_TIME_RANGES = [
  { label: 'Under 15 min', value: 15 },
  { label: '15-30 min', value: 30 },
  { label: '30-60 min', value: 60 },
  { label: 'Over 1 hour', value: 120 },
] as const;

// App Configuration
export const APP_CONFIG = {
  name: 'ChefMate',
  version: '1.0.0',
  maxImageSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
  maxRecipeSteps: 50,
  maxIngredients: 50,
  maxChatHistory: 100,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'Something went wrong. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'Permission denied. Please enable camera access.',
  IMAGE_ERROR: 'Failed to process image. Please try again.',
  SAVE_ERROR: 'Failed to save. Please try again.',
  LOAD_ERROR: 'Failed to load data. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  RECIPE_SAVED: 'Recipe saved successfully!',
  RECIPE_DELETED: 'Recipe deleted successfully!',
  FAVORITE_ADDED: 'Added to favorites!',
  FAVORITE_REMOVED: 'Removed from favorites!',
  IMAGE_UPLOADED: 'Image uploaded successfully!',
} as const;

// Debug Configuration
export const DEBUG_CONFIG = {
  enableLogs: __DEV__,
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
  enablePerformanceMonitoring: __DEV__,
} as const;
