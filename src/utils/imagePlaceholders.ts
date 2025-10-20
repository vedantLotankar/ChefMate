// Placeholder images - In a real app, these would be actual image files
// For now, we'll use a placeholder component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from './constants';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  text?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  width = 200, 
  height = 150, 
  text = 'Image' 
}) => (
  <View style={[styles.placeholder, { width, height }]}>
    <Text style={styles.placeholderText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

// For now, we'll export placeholder image sources
// In production, these would be actual image files
export const PLACEHOLDER_IMAGES = {
  'margherita-pizza.jpg': require('../../assets/images/margherita-pizza.jpg'),
  'chicken-alfredo.jpg': require('../../assets/images/chicken-alfredo.jpg'),
  'chocolate-chip-cookies.jpg': require('../../assets/images/chocolate-chip-cookies.jpg'),
  'grilled-salmon.jpg': require('../../assets/images/grilled-salmon.jpg'),
  'avocado-toast.jpg': require('../../assets/images/avocado-toast.jpg'),
  'beef-stir-fry.jpg': require('../../assets/images/beef-stir-fry.jpg'),
  'caesar-salad.jpg': require('../../assets/images/caesar-salad.jpg'),
  'banana-pancakes.jpg': require('../../assets/images/banana-pancakes.jpg'),
};
