import { apiClient } from './apiClient';
import { ChatRequest, ChatResponse, Recipe } from './types';
import { DEBUG_CONFIG } from '../utils/constants';

// Send recipe-specific chat message
export const sendRecipeChat = async (
  recipeContext: Recipe,
  message: string
): Promise<ChatResponse> => {
  if (DEBUG_CONFIG.enableLogs) {
    console.log(`🍳 Sending recipe chat: ${recipeContext.name} - ${message.substring(0, 50)}...`);
  }

  const request: ChatRequest = {
    message,
    recipeContext: {
      name: recipeContext.name,
      description: recipeContext.description,
      ingredients: recipeContext.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount,
      })),
      currentStep: undefined, // This would be set by the cooking screen
    },
  };

  try {
    const response = await apiClient.post<ChatResponse>('/api/chat/recipe', request);
    
    if (DEBUG_CONFIG.enableLogs) {
      console.log(`✅ Recipe chat response received: ${response.data.response.substring(0, 50)}...`);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Recipe chat error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('API authentication failed. Please check configuration.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }
};

// Send general chat message
export const sendGeneralChat = async (message: string): Promise<ChatResponse> => {
  if (DEBUG_CONFIG.enableLogs) {
    console.log(`👨‍🍳 Sending general chat: ${message.substring(0, 50)}...`);
  }

  const request: ChatRequest = {
    message,
  };

  try {
    const response = await apiClient.post<ChatResponse>('/api/chat/general', request);
    
    if (DEBUG_CONFIG.enableLogs) {
      console.log(`✅ General chat response received: ${response.data.response.substring(0, 50)}...`);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ General chat error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('API authentication failed. Please check configuration.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }
};

// Validate message before sending
export const validateMessage = (message: string): { valid: boolean; error?: string } => {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (message.length > 1000) {
    return { valid: false, error: 'Message is too long (max 1000 characters)' };
  }
  
  return { valid: true };
};

// Format error message for display
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return 'An unexpected error occurred';
};
