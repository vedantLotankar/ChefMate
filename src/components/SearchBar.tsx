import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, BLUR_CONFIG } from '../utils/constants';
import { commonStyles, createStyles, inputStyles, typography } from '../utils/styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search recipes...',
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onClear();
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, style]}>
      {BLUR_CONFIG.enabled ? (
        <BlurView
          intensity={BLUR_CONFIG.intensities.medium}
          tint={BLUR_CONFIG.tints.light}
          style={styles.blurContainer}
        >
          <View style={styles.content}>
            <View style={styles.searchContainer}>
              <Ionicons 
                name="search-outline" 
                size={20} 
                color={isFocused ? COLORS.primary : COLORS.textSecondary} 
              />
              <TextInput
                style={[
                  styles.input,
                  isFocused && styles.inputFocused,
                ]}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {value.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      ) : (
        <View style={styles.fallbackContainer}>
          <View style={styles.content}>
            <View style={styles.searchContainer}>
              <Ionicons 
                name="search-outline" 
                size={20} 
                color={isFocused ? COLORS.primary : COLORS.textSecondary} 
              />
              <TextInput
                style={[
                  styles.input,
                  isFocused && styles.inputFocused,
                ]}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {value.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = createStyles({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
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
    padding: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    padding: 0,
  },
  inputFocused: {
    color: COLORS.primary,
  },
  clearButton: {
    padding: SPACING.xs,
  },
});
