import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { z } from 'zod';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, RECIPE_CATEGORIES, DIFFICULTY_LEVELS } from '../utils/constants';
import { createStyles } from '../utils/styles';
import { Recipe, Ingredient, CookingStep, Nutrition } from '../api/types';
import { useRecipeStore } from '../store/useRecipeStore';
import { pickImageFromLibrary, copyImageToAppDirectory, validateImage, getImageInfo } from '../utils/image';
import WizardHeader from '../components/add-recipe/WizardHeader';
import IngredientRow from '../components/add-recipe/IngredientRow';
import StepRow from '../components/add-recipe/StepRow';

// Validation schemas
const basicInfoSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().optional(),
  servings: z.number().min(1, 'Servings must be at least 1'),
  cookTime: z.number().min(1, 'Cook time must be at least 1 minute'),
  prepTime: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['easy', 'medium', 'hard'], { required_error: 'Difficulty is required' }),
});

const ingredientsSchema = z.object({
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Ingredient name is required'),
    amount: z.string().min(1, 'Amount is required'),
    unit: z.string().optional(),
  })).min(1, 'At least one ingredient is required'),
});

const stepsSchema = z.object({
  steps: z.array(z.object({
    description: z.string().min(1, 'Step description is required'),
    duration: z.number().min(0).optional(),
  })).min(1, 'At least one step is required'),
});

const nutritionSchema = z.object({
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
});

const stepTitles = [
  'Basic Information',
  'Ingredients',
  'Cooking Instructions',
  'Optional Details'
];

export default function AddRecipeScreen() {
  const navigation = useNavigation();
  const { addCustomRecipe } = useRecipeStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servings: 4,
    cookTime: 30,
    prepTime: 15,
    category: '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | '',
    image: '',
    ingredients: [] as Ingredient[],
    steps: [] as CookingStep[],
    nutrition: {} as Nutrition,
    tags: [] as string[],
  });

  // Initialize with first ingredient and step
  useEffect(() => {
    if (formData.ingredients.length === 0) {
      setFormData(prev => ({
        ...prev,
        ingredients: [{ id: Date.now().toString(), name: '', amount: '', unit: '' }]
      }));
    }
    if (formData.steps.length === 0) {
      setFormData(prev => ({
        ...prev,
        steps: [{ id: Date.now().toString(), stepNumber: 1, description: '', duration: undefined }]
      }));
    }
  }, []);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    setErrors({});
    
    try {
      switch (currentStep) {
        case 1:
          basicInfoSchema.parse({
            name: formData.name,
            description: formData.description,
            servings: formData.servings,
            cookTime: formData.cookTime,
            prepTime: formData.prepTime,
            category: formData.category,
            difficulty: formData.difficulty,
          });
          break;
        case 2:
          ingredientsSchema.parse({ ingredients: formData.ingredients });
          break;
        case 3:
          stepsSchema.parse({ steps: formData.steps });
          break;
        case 4:
          // Optional step - no validation needed
          break;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await pickImageFromLibrary();
      if (!result.cancelled) {
        const imageInfo = await getImageInfo(result.uri);
        
        if (!validateImage(result.uri, imageInfo.size)) {
          Alert.alert('Invalid Image', 'Please select a valid image file under 5MB.');
          return;
        }

        const copiedUri = await copyImageToAppDirectory(result.uri);
        setFormData(prev => ({ ...prev, image: copiedUri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      // Check if recipe name already exists
      const { recipes } = useRecipeStore.getState();
      const existingRecipe = recipes.find(r => 
        r.name.toLowerCase() === formData.name.toLowerCase() && r.isCustom
      );
      
      if (existingRecipe) {
        Alert.alert(
          'Recipe Already Exists',
          'A recipe with this name already exists. Please choose a different name.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Generate unique ID
      const recipeId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Auto-assign step numbers
      const stepsWithNumbers = formData.steps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      }));

      const recipe: Recipe = {
        id: recipeId,
        name: formData.name,
        description: formData.description,
        image: formData.image || undefined,
        cookTime: formData.cookTime,
        prepTime: formData.prepTime,
        servings: formData.servings,
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
        category: formData.category,
        ingredients: formData.ingredients,
        steps: stepsWithNumbers,
        nutrition: Object.keys(formData.nutrition).length > 0 ? formData.nutrition : undefined,
        tags: formData.tags,
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addCustomRecipe(recipe);
      
      // Reset form after successful save
      setFormData({
        name: '',
        description: '',
        servings: 4,
        cookTime: 30,
        prepTime: 15,
        category: '',
        difficulty: '',
        image: '',
        ingredients: [{ id: Date.now().toString(), name: '', amount: '', unit: '' }],
        steps: [{ id: Date.now().toString(), stepNumber: 1, description: '', duration: undefined }],
        nutrition: {},
        tags: [],
      });
      setCurrentStep(1);
      setErrors({});
      
      Alert.alert(
        'Success!', 
        'Recipe saved successfully!',
        [
          {
            text: 'View Recipe',
            onPress: () => {
              // Navigate to home tab and let user manually navigate to recipe
              (navigation as any).navigate('HomeTab');
            },
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      amount: '',
      unit: '',
    };
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const updateIngredient = (index: number, ingredient: Ingredient) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) => i === index ? ingredient : item)
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const addStep = () => {
    const newStep: CookingStep = {
      id: Date.now().toString(),
      stepNumber: formData.steps.length + 1,
      description: '',
      duration: undefined,
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (index: number, step: CookingStep) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((item, i) => i === index ? step : item)
    }));
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }));
    }
  };

  const updateNutrition = (field: keyof Nutrition, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: numValue }
    }));
  };

  const updateTags = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Recipe Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter recipe name"
          placeholderTextColor={COLORS.textSecondary}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Describe your recipe"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Servings *</Text>
          <TextInput
            style={[styles.input, errors.servings && styles.inputError]}
            value={formData.servings.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, servings: parseInt(text) || 1 }))}
            placeholder="4"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textSecondary}
          />
          {errors.servings && <Text style={styles.errorText}>{errors.servings}</Text>}
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Cook Time (min) *</Text>
          <TextInput
            style={[styles.input, errors.cookTime && styles.inputError]}
            value={formData.cookTime.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, cookTime: parseInt(text) || 1 }))}
            placeholder="30"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textSecondary}
          />
          {errors.cookTime && <Text style={styles.errorText}>{errors.cookTime}</Text>}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Prep Time (min)</Text>
        <TextInput
          style={styles.input}
          value={formData.prepTime?.toString() || ''}
          onChangeText={(text) => setFormData(prev => ({ ...prev, prepTime: text ? parseInt(text) : 15 }))}
          placeholder="15"
          keyboardType="numeric"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {RECIPE_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                formData.category === category && styles.categoryButtonSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, category }))}
            >
              <Text style={[
                styles.categoryButtonText,
                formData.category === category && styles.categoryButtonTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Difficulty *</Text>
        <View style={styles.difficultyContainer}>
          {DIFFICULTY_LEVELS.map(level => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.difficultyButton,
                formData.difficulty === level.value && styles.difficultyButtonSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, difficulty: level.value }))}
            >
              <Text style={[
                styles.difficultyButtonText,
                formData.difficulty === level.value && styles.difficultyButtonTextSelected
              ]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.difficulty && <Text style={styles.errorText}>{errors.difficulty}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Recipe Image</Text>
        <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
          <Text style={styles.addButtonText}>+ Add Ingredient</Text>
        </TouchableOpacity>
      </View>

      {formData.ingredients.map((ingredient, index) => (
        <IngredientRow
          key={ingredient.id}
          ingredient={ingredient}
          onUpdate={(updatedIngredient) => updateIngredient(index, updatedIngredient)}
          onRemove={() => removeIngredient(index)}
          canRemove={formData.ingredients.length > 1}
        />
      ))}

      {errors.ingredients && <Text style={styles.errorText}>{errors.ingredients}</Text>}
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cooking Instructions</Text>
        <TouchableOpacity style={styles.addButton} onPress={addStep}>
          <Text style={styles.addButtonText}>+ Add Step</Text>
        </TouchableOpacity>
      </View>

      {formData.steps.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          onUpdate={(updatedStep) => updateStep(index, updatedStep)}
          onRemove={() => removeStep(index)}
          canRemove={formData.steps.length > 1}
        />
      ))}

      {errors.steps && <Text style={styles.errorText}>{errors.steps}</Text>}
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nutrition Information (Optional)</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <TextInput
              style={styles.nutritionInput}
              value={formData.nutrition.calories?.toString() || ''}
              onChangeText={(text) => updateNutrition('calories', text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Protein (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              value={formData.nutrition.protein?.toString() || ''}
              onChangeText={(text) => updateNutrition('protein', text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              value={formData.nutrition.carbs?.toString() || ''}
              onChangeText={(text) => updateNutrition('carbs', text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Fat (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              value={formData.nutrition.fat?.toString() || ''}
              onChangeText={(text) => updateNutrition('fat', text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tags (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.tags.join(', ')}
          onChangeText={updateTags}
          placeholder="e.g., Italian, Vegetarian, Quick"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WizardHeader
        currentStep={currentStep}
        totalSteps={4}
        onBack={handleBack}
        canGoBack={currentStep > 1}
        stepTitles={stepTitles}
      />
      
      {renderCurrentStep()}

      <View style={styles.footer}>
        {currentStep < 4 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.saveButtonText}>Save Recipe</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  categoryButtonTextSelected: {
    color: COLORS.surface,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  difficultyButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  difficultyButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  difficultyButtonTextSelected: {
    color: COLORS.surface,
  },
  imageButton: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  nutritionGrid: {
    gap: SPACING.sm,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  nutritionInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    width: 80,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
});
