import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, DetailedStep } from '../api/types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { useRecipeStore } from '../store/useRecipeStore';
import { getCookingDetailsFromGemini } from '../api/geminiApi';

type CookingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cooking'>;
type CookingScreenRouteProp = RouteProp<RootStackParamList, 'Cooking'>;

interface Props {
  navigation: CookingScreenNavigationProp;
  route: CookingScreenRouteProp;
}

export default function CookingScreen({ navigation, route }: Props) {
  const { recipeId } = route.params;
  const { getRecipeById } = useRecipeStore();
  
  const [recipe] = useState(getRecipeById(recipeId));
  const [detailedSteps, setDetailedSteps] = useState<DetailedStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (recipe) {
      // Create fallback detailed steps from recipe data
      const fallbackSteps: DetailedStep[] = recipe.steps
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((step) => ({
          step_title: `Step ${step.stepNumber}: ${step.description}`,
          detailed_steps: [
            step.description,
            'Follow the recipe instructions carefully.',
            'Make sure to have all ingredients ready.',
          ],
          estimated_time_minutes: step.duration || 5,
        }));
      
      setDetailedSteps(fallbackSteps);
      if (fallbackSteps.length > 0) {
        setTimerMinutes(fallbackSteps[0].estimated_time_minutes);
      }
      setLoading(false);

      // Try to load from Gemini (but don't block on error)
      loadFromGemini();
    }
  }, [recipeId]);

  const loadFromGemini = async () => {
    if (!recipe) return;
    
    try {
      const steps = await getCookingDetailsFromGemini({
        name: recipe.name,
        description: recipe.description,
        steps: recipe.steps.map((s) => ({
          stepNumber: s.stepNumber,
          description: s.description,
          duration: s.duration,
        })),
        cookTime: recipe.cookTime,
        prepTime: recipe.prepTime,
      });
      
      if (steps && steps.length > 0) {
        setDetailedSteps(steps);
        setTimerMinutes(steps[0].estimated_time_minutes);
      }
    } catch (err) {
      console.log('⚠️ Gemini API not available, using fallback steps');
    }
  };

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const handleNext = () => {
    if (currentStepIndex < detailedSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      setTimerMinutes(detailedSteps[newIndex].estimated_time_minutes);
      setTimerSeconds(0);
      setIsTimerRunning(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } else {
      Alert.alert('🎉 Complete!', 'You finished all steps!', [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      setTimerMinutes(detailedSteps[newIndex].estimated_time_minutes);
      setTimerSeconds(0);
      setIsTimerRunning(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } else {
      setIsTimerRunning(true);
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev > 0) return prev - 1;
          setTimerMinutes((prevMin) => {
            if (prevMin > 0) return prevMin - 1;
            setIsTimerRunning(false);
            clearInterval(interval);
            Alert.alert('⏱️ Time\'s Up!');
            return 0;
          });
          return 59;
        });
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const formatTime = (mins: number, secs: number) => `${mins}:${secs.toString().padStart(2, '0')}`;

  if (loading || !recipe || !detailedSteps.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = detailedSteps[currentStepIndex];
  const currentRecipeStep = recipe.steps[currentStepIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Section - Step Title Box (Left) + Timer Box (Right) */}
        <View style={styles.topSection}>
          {/* Step Title Box */}
          <View style={styles.stepTitleBox}>
            <Text style={styles.stepNumber}>Step{currentStepIndex + 1}</Text>
            <Text style={styles.stepTitle}>{currentStep.step_title.replace(/^Step \d+: /, '')}</Text>
          </View>

          {/* Timer Controls Box */}
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatTime(timerMinutes, timerSeconds)}</Text>
            <View style={styles.timerControls}>
              <TouchableOpacity onPress={handlePrevious} disabled={currentStepIndex === 0}>
                <Ionicons 
                  name="play-back" 
                  size={24} 
                  color={currentStepIndex === 0 ? COLORS.textSecondary : COLORS.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleTimer}>
                <Ionicons 
                  name={isTimerRunning ? 'pause' : 'play'} 
                  size={32} 
                  color={COLORS.primary} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext}>
                <Ionicons name="play-forward" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Ingredients Section */}
        <View style={styles.ingredientsBox}>
          <Text style={styles.sectionTitle}>Ingredients for this step:</Text>
          <Text style={styles.ingredientsText}>
            {recipe.ingredients.map(ing => 
              `${ing.amount || ''} ${ing.unit || ''} ${ing.name}`.trim()
            ).join(', ')}
          </Text>
        </View>

        {/* AI Description Box */}
        <View style={styles.aiDescriptionBox}>
          <Text style={styles.aiTitle}>AI Description</Text>
          <Text style={styles.aiDescription}>
            {currentStep.detailed_steps.join('\n\n')}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={[styles.navButton, currentStepIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          <Text style={[styles.navButtonText, currentStepIndex === 0 && styles.navButtonTextDisabled]}>
            Previous Step
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Text style={styles.navButtonText}>
            {currentStepIndex === detailedSteps.length - 1 ? 'Finish Cooking' : 'Next Step'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  topSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepTitleBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    lineHeight: 22,
  },
  timerBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  ingredientsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  ingredientsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  aiDescriptionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  aiDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  navigationButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.surface,
  },
  navButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
};
