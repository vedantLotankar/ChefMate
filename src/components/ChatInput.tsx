import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, BLUR_CONFIG } from '../utils/constants';
import { commonStyles, createStyles, inputStyles } from '../utils/styles';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = 'Type your message...',
  disabled = false,
  style,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !isLoading && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <View style={[styles.container, style]}>
        {BLUR_CONFIG.enabled ? (
          <BlurView
            intensity={BLUR_CONFIG.intensities.medium}
            tint={BLUR_CONFIG.tints.light}
            style={styles.blurContainer}
          >
            <View style={styles.content}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    disabled && styles.textInputDisabled,
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  maxLength={1000}
                  editable={!disabled}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  blurOnSubmit={false}
                />
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!canSend}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <Ionicons name="hourglass-outline" size={20} color={COLORS.surface} />
                  ) : (
                    <Ionicons 
                      name="send" 
                      size={20} 
                      color={canSend ? COLORS.surface : COLORS.textSecondary} 
                    />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.footer}>
                <Text style={styles.characterCount}>
                  {message.length}/1000
                </Text>
                {disabled && (
                  <Text style={styles.disabledText}>
                    Chat is disabled
                  </Text>
                )}
              </View>
            </View>
          </BlurView>
        ) : (
          <View style={styles.fallbackContainer}>
            <View style={styles.content}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    disabled && styles.textInputDisabled,
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  maxLength={1000}
                  editable={!disabled}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  blurOnSubmit={false}
                />
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!canSend}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <Ionicons name="hourglass-outline" size={20} color={COLORS.surface} />
                  ) : (
                    <Ionicons 
                      name="send" 
                      size={20} 
                      color={canSend ? COLORS.surface : COLORS.textSecondary} 
                    />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.footer}>
                <Text style={styles.characterCount}>
                  {message.length}/1000
                </Text>
                {disabled && (
                  <Text style={styles.disabledText}>
                    Chat is disabled
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = createStyles({
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
  },
  blurContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  fallbackContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...commonStyles.shadowSm,
  },
  content: {
    padding: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    padding: 0,
  },
  textInputDisabled: {
    color: COLORS.textSecondary,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  characterCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  disabledText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
