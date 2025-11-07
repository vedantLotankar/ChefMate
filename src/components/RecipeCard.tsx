import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../api/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, BLUR_CONFIG } from '../utils/constants';
import { createStyles, commonStyles, typography } from '../utils/styles';
import { PlaceholderImage } from '../assets/images/placeholder';
import { getRecipeImage } from '../utils/imageMapper';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onFavoritePress: (recipeId: string) => void;
  isFavorite: boolean;
  style?: any;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  onFavoritePress,
  isFavorite,
  style,
}) => {
  const handlePress = () => {
    onPress(recipe);
  };

  const handleFavoritePress = () => {
    onFavoritePress(recipe.id);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'hard':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  // Get image source - prioritize local images, then recipe.image (URI), then placeholder
  const getImageSource = () => {
    // First, try to get local image based on recipe name
    const localImage = getRecipeImage(recipe.name);
    if (localImage) {
      return localImage;
    }
    
    // If no local image, use recipe.image if it's a URI
    if (recipe.image && (recipe.image.startsWith('http://') || recipe.image.startsWith('https://'))) {
      return { uri: recipe.image };
    }
    
    // No image available
    return null;
  };

  const imageSource = getImageSource();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image Section - Full width at top */}
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <PlaceholderImage 
              width={undefined} 
              height={undefined} 
              text="Recipe Image" 
            />
          </View>
        )}
        
        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? COLORS.error : COLORS.surface}
          />
        </TouchableOpacity>
      </View>
      
      {/* Content Section - Title and details below image */}
      <View style={styles.content}>
        {/* Recipe Title */}
        <View style={styles.titleRow}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {recipe.name}
          </Text>
          {recipe.difficulty && (
            <View style={styles.difficultyBadge}>
              <View 
                style={[
                  styles.difficultyDot, 
                  { backgroundColor: getDifficultyColor(recipe.difficulty) }
                ]} 
              />
              <Text style={styles.difficultyText}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Time and Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{formatTime(recipe.cookTime)}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description || 'No description available'}
        </Text>
        
        {/* Footer with servings and category */}
        <View style={styles.footer}>
          <View style={styles.servingsContainer}>
            <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.servingsText}>{recipe.servings} servings</Text>
          </View>
          
          {recipe.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
          )}
        </View>
        
        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {recipe.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{recipe.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = createStyles({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...commonStyles.shadowMd,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    padding: SPACING.md,
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  recipeTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    width: '100%',
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  servingsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
    width: '100%',
  },
  tag: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  moreTagsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: SPACING.xs,
  },
});
