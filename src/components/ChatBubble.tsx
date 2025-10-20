import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../api/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, BLUR_CONFIG } from '../utils/constants';
import { createStyles, commonStyles } from '../utils/styles';

interface ChatBubbleProps {
  message: ChatMessage;
  style?: any;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, style }) => {
  const isUser = message.role === 'user';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBubbleStyle = () => {
    if (isUser) {
      return styles.userBubble;
    }
    return styles.assistantBubble;
  };

  const getTextStyle = () => {
    if (isUser) {
      return styles.userText;
    }
    return styles.assistantText;
  };

  const getIcon = () => {
    if (isUser) {
      return 'person-circle';
    }
    return 'chatbubble-ellipses';
  };

  const getIconColor = () => {
    if (isUser) {
      return COLORS.primary;
    }
    return COLORS.secondary;
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer, style]}>
      {BLUR_CONFIG.enabled ? (
        <BlurView
          intensity={BLUR_CONFIG.intensities.light}
          tint={isUser ? BLUR_CONFIG.tints.light : BLUR_CONFIG.tints.light}
          style={[styles.blurContainer, getBubbleStyle()]}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIcon()}
                  size={20}
                  color={getIconColor()}
                />
              </View>
              <Text style={styles.timestamp}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
            
            <Text style={[styles.messageText, getTextStyle()]}>
              {message.content}
            </Text>
            
            {message.context && (
              <View style={styles.contextContainer}>
                <Text style={styles.contextText}>
                  {message.context === 'recipe' ? 'Recipe Context' : 'General Chat'}
                </Text>
              </View>
            )}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.fallbackContainer, getBubbleStyle()]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIcon()}
                  size={20}
                  color={getIconColor()}
                />
              </View>
              <Text style={styles.timestamp}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
            
            <Text style={[styles.messageText, getTextStyle()]}>
              {message.content}
            </Text>
            
            {message.context && (
              <View style={styles.contextContainer}>
                <Text style={styles.contextText}>
                  {message.context === 'recipe' ? 'Recipe Context' : 'General Chat'}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = createStyles({
  container: {
    marginVertical: SPACING.xs,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  blurContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  fallbackContainer: {
    borderRadius: BORDER_RADIUS.lg,
    ...commonStyles.shadowSm,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  userBubble: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  assistantBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userText: {
    color: COLORS.text,
  },
  assistantText: {
    color: COLORS.text,
  },
  contextContainer: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contextText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
