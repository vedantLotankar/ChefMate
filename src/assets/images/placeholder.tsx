// Placeholder image component for recipes
// In production, these would be actual image files

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../../utils/constants';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  text?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  width,
  height,
  text = 'Image' 
}) => (
  <View style={[styles.placeholder, width && height ? { width, height } : styles.fullSize]}>
    <Text style={styles.placeholderText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0, // No border radius when used in card
  },
  fullSize: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

// Export placeholder image sources
export const placeholderImages = {
  'margherita-pizza.jpg': PlaceholderImage,
  'chicken-alfredo.jpg': PlaceholderImage,
  'chocolate-chip-cookies.jpg': PlaceholderImage,
  'grilled-salmon.jpg': PlaceholderImage,
  'avocado-toast.jpg': PlaceholderImage,
  'beef-stir-fry.jpg': PlaceholderImage,
  'caesar-salad.jpg': PlaceholderImage,
  'banana-pancakes.jpg': PlaceholderImage,
  'placeholder.jpg': PlaceholderImage,
};
