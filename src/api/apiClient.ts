import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import Constants from 'expo-constants';
import { API_BASE_URL, DEBUG_CONFIG } from '../utils/constants';
import { ChatRequest, ChatResponse } from './types';

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      if (DEBUG_CONFIG.enableLogs) {
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (DEBUG_CONFIG.enableLogs) {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError) => {
      if (DEBUG_CONFIG.enableLogs) {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.message);
      }
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        console.log('⚠️ Rate limit exceeded');
      } else if (error.response?.status === 401) {
        console.log('🔑 Unauthorized - check API key');
      } else if (error.code === 'ECONNABORTED') {
        console.log('⏰ Request timeout');
      } else if (!error.response) {
        console.log('🌐 Network error - check connection');
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Health check
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
};

// Test API connection
export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const isHealthy = await checkHealth();
    if (isHealthy) {
      return { success: true, message: 'API connection successful' };
    } else {
      return { success: false, message: 'API health check failed' };
    }
  } catch (error) {
    return { success: false, message: 'Failed to connect to API' };
  }
};
