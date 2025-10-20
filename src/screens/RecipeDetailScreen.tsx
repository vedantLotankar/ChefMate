import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Recipe } from '../api/types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { createStyles, typography } from '../utils/styles';
import { getRecipeById } from '../utils/dummyRecipes';
import { useRecipeStore } from '../store/useRecipeStore';

type RecipeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;
type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

interface Props {
  navigation: RecipeDetailScreenNavigationProp;
  route: RecipeDetailScreenRouteProp;
}

export default function RecipeDetailScreen({ navigation, route }: Props) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    currentServings,
    setCurrentRecipe,
    setCurrentServings,
    adjustServings,
  } = useRecipeStore();

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = () => {
    try {
      setLoading(true);
      setError(null);
      
      const foundRecipe = getRecipeById(recipeId);
      if (!foundRecipe) {
        setError('Recipe not found');
        return;
      }
      
      setRecipe(foundRecipe);
      setCurrentRecipe(foundRecipe);
    } catch (err) {
      setError('Failed to load recipe');
      console.error('Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFavoritePress = () => {
    // TODO: Implement favorite functionality
    Alert.alert('Favorite', 'Favorite functionality coming soon!');
  };

  const handleSharePress = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleStartCooking = () => {
    navigation.navigate('Cooking', { recipeId });
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

  // --- Ingredient amount scaling helpers ---
  const parseNumberPart = (part: string): number | null => {
    const trimmed = part.trim();
    if (!trimmed) return null;
    // Handle mixed numbers like "2 1/4"
    const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const whole = parseFloat(mixedMatch[1]);
      const num = parseFloat(mixedMatch[2]);
      const den = parseFloat(mixedMatch[3]);
      if (den === 0) return whole;
      return whole + num / den;
    }
    // Handle simple fractions like "1/2"
    const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
    if (fracMatch) {
      const num = parseFloat(fracMatch[1]);
      const den = parseFloat(fracMatch[2]);
      if (den === 0) return num;
      return num / den;
    }
    // Handle decimals / integers
    const asNum = Number(trimmed.replace(/[^0-9.\-]/g, ''));
    return isNaN(asNum) ? null : asNum;
  };

  const formatNumber = (value: number): string => {
    // Format with up to 2 decimals, trim trailing zeros
    const fixed = value.toFixed(2);
    return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  };

  const scaleAmountString = (amount: string | undefined, baseServings: number, targetServings: number): string | undefined => {
    if (!amount) return amount;
    const multiplier = baseServings > 0 ? targetServings / baseServings : 1;
    const raw = amount.toString().trim();
    // Handle ranges like "10-12"
    if (/\d\s*-\s*\d/.test(raw)) {
      const [a, b] = raw.split('-');
      const left = parseNumberPart(a);
      const right = parseNumberPart(b);
      if (left !== null && right !== null) {
        return `${formatNumber(left * multiplier)}-${formatNumber(right * multiplier)}`;
      }
      return raw; // fallback if unparsable
    }
    const value = parseNumberPart(raw);
    if (value === null) return raw; // leave textual amounts like "to taste"
    return formatNumber(value * multiplier);
  };

  // --- Nutrition scaling and formatting ---
  const scaleNutritionValue = (value: number, baseServings: number, targetServings: number): number => {
    const multiplier = baseServings > 0 ? targetServings / baseServings : 1;
    return value * multiplier;
  };

  const getNutritionUnit = (key: string): string => {
    switch (key.toLowerCase()) {
      case 'calories':
        return 'cal';
      case 'protein':
      case 'carbs':
      case 'fat':
      case 'fiber':
      case 'sugar':
        return 'g';
      case 'sodium':
        return 'mg';
      default:
        return '';
    }
  };

  const formatNutritionValue = (key: string, value: number): string => {
    const unit = getNutritionUnit(key);
    const scaledValue = scaleNutritionValue(value, recipe?.servings || 1, currentServings);
    return unit ? `${Math.round(scaledValue)}${unit}` : Math.round(scaledValue).toString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Recipe Not Found</Text>
          <Text style={styles.errorMessage}>
            {error || 'The recipe you\'re looking for doesn\'t exist.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {recipe.name}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleFavoritePress}>
            <Ionicons name="heart-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSharePress}>
            <Ionicons name="share-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.name}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
          
          {/* Quick Info Bar */}
          <View style={styles.quickInfoBar}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{recipe.cookTime}m</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>Servings</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setCurrentServings(Math.max(1, currentServings - 1))}
                  style={styles.stepperButton}
                >
                  <Ionicons name="remove" size={16} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.stepperCount}>{currentServings}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setCurrentServings(currentServings + 1)}
                  style={styles.stepperButton}
                >
                  <Ionicons name="add" size={16} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(recipe.difficulty) }]} />
              <Text style={styles.infoText}>{recipe.difficulty}</Text>
            </View>
            {recipe.category && (
              <View style={styles.infoItem}>
                <Text style={styles.categoryTag}>{recipe.category}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cookingButton} onPress={handleStartCooking}>
              <Ionicons name="restaurant-outline" size={16} color={COLORS.surface} />
              <Text style={styles.cookingButtonText}>Cooking Mode</Text>
            </TouchableOpacity>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.listContainer}>
              {recipe.ingredients?.map((ing) => {
                const scaledAmount = scaleAmountString(ing.amount as unknown as string, recipe.servings, currentServings);
                return (
                  <View key={ing.id} style={styles.ingredientItem}>
                    <Text style={styles.ingredientBullet}>•</Text>
                    <Text style={styles.ingredientText}>
                      {scaledAmount ? `${scaledAmount} ${ing.unit ? ing.unit + ' ' : ''}` : ''}{ing.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.listContainer}>
              {recipe.steps?.sort((a,b) => a.stepNumber - b.stepNumber).map((step) => (
                <View key={step.id} style={styles.stepItem}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                    {typeof step.duration === 'number' && (
                      <Text style={styles.stepDuration}>{step.duration} min</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Nutrition */}
          {recipe.nutrition && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition</Text>
              <View style={styles.nutritionGrid}>
                {Object.entries(recipe.nutrition).map(([key, value]) => (
                  <View key={key} style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>{key}</Text>
                    <Text style={styles.nutritionValue}>{formatNutritionValue(key, value as number)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  // Content styles
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  // Quick info bar
  quickInfoBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  categoryTag: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  listContainer: {
    gap: SPACING.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ingredientBullet: {
    width: 16,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ingredientText: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 2,
  },
  stepDuration: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  nutritionItem: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  nutritionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  nutritionValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
  },
  stepperButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  stepperCount: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  cookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: 'auto',
  },
  cookingButtonText: {
    marginRight: SPACING.xs,
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Sections
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.surface,
  },
});
