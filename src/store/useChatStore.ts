import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../api/types';
import { 
  getChatHistory, 
  storeChatHistory, 
  addChatMessage, 
  clearChatHistory 
} from '../utils/storage';
import { DEBUG_CONFIG } from '../utils/constants';

interface ChatState {
  // Chat data
  recipeChatMessages: ChatMessage[];
  generalChatMessages: ChatMessage[];
  
  // UI state
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  
  // Current chat context
  currentRecipeId: string | null;
  
  // Actions
  loadChatHistory: (chatId: string) => Promise<void>;
  addMessage: (chatId: string, message: ChatMessage) => Promise<void>;
  clearChatHistory: (chatId: string) => Promise<void>;
  
  // Recipe chat
  setCurrentRecipeId: (recipeId: string | null) => void;
  addRecipeMessage: (message: ChatMessage) => Promise<void>;
  
  // General chat
  addGeneralMessage: (message: ChatMessage) => Promise<void>;
  
  // UI state management
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utility
  getChatMessages: (chatId: string) => ChatMessage[];
  getLastMessage: (chatId: string) => ChatMessage | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      recipeChatMessages: [],
      generalChatMessages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      currentRecipeId: null,
      
      // Load chat history
      loadChatHistory: async (chatId: string) => {
        try {
          const messages = await getChatHistory(chatId);
          
          if (chatId === 'general') {
            set({ generalChatMessages: messages });
          } else {
            set({ recipeChatMessages: messages });
          }
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Loaded ${messages.length} messages for chat: ${chatId}`);
          }
        } catch (error) {
          console.error(`❌ Error loading chat history for ${chatId}:`, error);
          set({ error: 'Failed to load chat history' });
        }
      },
      
      // Add message to chat
      addMessage: async (chatId: string, message: ChatMessage) => {
        try {
          await addChatMessage(chatId, message);
          
          if (chatId === 'general') {
            const { generalChatMessages } = get();
            const updatedMessages = [...generalChatMessages, message];
            set({ generalChatMessages: updatedMessages });
          } else {
            const { recipeChatMessages } = get();
            const updatedMessages = [...recipeChatMessages, message];
            set({ recipeChatMessages: updatedMessages });
          }
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Added message to ${chatId}: ${message.content.substring(0, 50)}...`);
          }
        } catch (error) {
          console.error(`❌ Error adding message to ${chatId}:`, error);
          set({ error: 'Failed to add message' });
        }
      },
      
      // Clear chat history
      clearChatHistory: async (chatId: string) => {
        try {
          await clearChatHistory(chatId);
          
          if (chatId === 'general') {
            set({ generalChatMessages: [] });
          } else {
            set({ recipeChatMessages: [] });
          }
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Cleared chat history for: ${chatId}`);
          }
        } catch (error) {
          console.error(`❌ Error clearing chat history for ${chatId}:`, error);
          set({ error: 'Failed to clear chat history' });
        }
      },
      
      // Set current recipe ID
      setCurrentRecipeId: (recipeId: string | null) => {
        set({ currentRecipeId: recipeId });
        if (DEBUG_CONFIG.enableLogs) {
          console.log(`🍳 Current recipe ID: ${recipeId || 'None'}`);
        }
      },
      
      // Add recipe message
      addRecipeMessage: async (message: ChatMessage) => {
        const { currentRecipeId } = get();
        if (currentRecipeId) {
          await get().addMessage(currentRecipeId, message);
        }
      },
      
      // Add general message
      addGeneralMessage: async (message: ChatMessage) => {
        await get().addMessage('general', message);
      },
      
      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
        if (DEBUG_CONFIG.enableLogs) {
          console.log(`⏳ Loading: ${loading}`);
        }
      },
      
      // Set streaming state
      setStreaming: (streaming: boolean) => {
        set({ isStreaming: streaming });
        if (DEBUG_CONFIG.enableLogs) {
          console.log(`🌊 Streaming: ${streaming}`);
        }
      },
      
      // Set error
      setError: (error: string | null) => {
        set({ error });
        if (error && DEBUG_CONFIG.enableLogs) {
          console.error(`❌ Chat error: ${error}`);
        }
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      },
      
      // Get chat messages
      getChatMessages: (chatId: string) => {
        const { recipeChatMessages, generalChatMessages } = get();
        return chatId === 'general' ? generalChatMessages : recipeChatMessages;
      },
      
      // Get last message
      getLastMessage: (chatId: string) => {
        const messages = get().getChatMessages(chatId);
        return messages[messages.length - 1];
      },
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recipeChatMessages: state.recipeChatMessages,
        generalChatMessages: state.generalChatMessages,
        currentRecipeId: state.currentRecipeId,
      }),
    }
  )
);
