import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { useChatStore } from '../store/useChatStore';
import { ChatBubble } from '../components/ChatBubble';
import { apiClient } from '../api/apiClient';

export default function IndependentChatScreen() {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { 
    generalChatMessages, 
    isLoading, 
    error,
    addGeneralMessage,
    setLoading,
    setError,
    clearError,
    loadChatHistory,
  } = useChatStore();

  useEffect(() => {
    loadChatHistory('general');
  }, []);

  useEffect(() => {
    if (generalChatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [generalChatMessages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user' as const,
      timestamp: new Date().toISOString(),
      context: 'general' as const,
    };

    setInputText('');
    clearError();
    
    try {
      await addGeneralMessage(userMessage);
      setLoading(true);

      // Call backend API
      const response = await apiClient.post('/api/chat/general', {
        message: userMessage.content,
      });

      if (response.data.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          role: 'assistant' as const,
          timestamp: response.data.timestamp || new Date().toISOString(),
          context: 'general' as const,
        };

        await addGeneralMessage(assistantMessage);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please check your connection.');
      
      // Show offline message
      const offlineMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m offline right now. Please check your internet connection or backend server.',
        role: 'assistant' as const,
        timestamp: new Date().toISOString(),
        context: 'general' as const,
      };
      
      await addGeneralMessage(offlineMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat with AI</Text>
          <TouchableOpacity onPress={() => {}} style={styles.settingsButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {generalChatMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>Start a Conversation</Text>
              <Text style={styles.emptyDescription}>
                Ask me anything about cooking, recipes, or get help with your culinary adventures!
              </Text>
            </View>
          ) : (
            generalChatMessages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))
          )}

          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Ionicons name="hourglass-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.loadingText}>AI is typing...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything about cooking..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={(!inputText.trim() || isLoading) ? COLORS.textSecondary : COLORS.surface} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 22,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.lg : SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
};