import { Recipe, Ingredient, CookingStep, Nutrition } from '../api/types';

/**
 * Transform database recipe format to app Recipe format
 * @param {any} dbRecipe - Recipe from database
 * @param {boolean} isCustom - Whether this recipe is user-created (default: false)
 */
export const transformDbRecipeToRecipe = (dbRecipe, isCustom = false) => {
  if (!dbRecipe) return null;

  // Transform ingredients
  const ingredients = (dbRecipe.ingredients || []).map((ing, index) => ({
    id: ing.id?.toString() || `ing_${index}`,
    name: ing.name,
    amount: ing.amount?.toString() || '0',
    unit: ing.unit || '',
  }));

  // Transform instructions/steps
  const steps = (dbRecipe.instructions || []).map((inst, index) => ({
    id: inst.id?.toString() || `step_${index}`,
    stepNumber: inst.step_number || index + 1,
    description: inst.description,
    duration: inst.duration || undefined,
  }));

  // Transform nutrition
  const nutrition = dbRecipe.nutrition ? {
    calories: dbRecipe.nutrition.calories || undefined,
    protein: dbRecipe.nutrition.protein || undefined,
    carbs: dbRecipe.nutrition.carbs || undefined,
    fat: dbRecipe.nutrition.fat || undefined,
  } : undefined;

  // Determine if recipe is custom (user-created)
  // Dummy recipes are typically IDs 1-25, so anything above is likely user-created
  const recipeId = parseInt(dbRecipe.id);
  const isUserCreated = isCustom || recipeId > 25;

  // Create Recipe object
  const recipe = {
    id: dbRecipe.id.toString(),
    name: dbRecipe.name,
    description: dbRecipe.description || undefined,
    image: dbRecipe.image || undefined,
    cookTime: dbRecipe.cook_time,
    prepTime: dbRecipe.prep_time || undefined,
    servings: dbRecipe.servings,
    difficulty: (dbRecipe.difficulty || 'medium').toLowerCase(),
    category: dbRecipe.category || undefined,
    ingredients,
    steps,
    nutrition,
    tags: dbRecipe.tags || [],
    isCustom: isUserCreated,
  };

  return recipe;
};

/**
 * Transform Recipe format to database format for insertion
 */
export const transformRecipeToDbFormat = (recipe) => {
  return {
    name: recipe.name,
    description: recipe.description || null,
    servings: recipe.servings,
    cook_time: recipe.cookTime,
    prep_time: recipe.prepTime || null,
    category: recipe.category || null,
    difficulty: recipe.difficulty || 'medium',
    image: recipe.image || null,
    ingredients: recipe.ingredients.map(ing => ({
      name: ing.name,
      amount: parseFloat(ing.amount) || 0,
      unit: ing.unit || null,
    })),
    instructions: recipe.steps.map((step, index) => ({
      step_number: step.stepNumber || index + 1,
      description: step.description,
      duration: step.duration || null,
    })),
    nutrition: recipe.nutrition ? {
      calories: recipe.nutrition.calories || null,
      protein: recipe.nutrition.protein || null,
      carbs: recipe.nutrition.carbs || null,
      fat: recipe.nutrition.fat || null,
    } : null,
    tags: recipe.tags || [],
  };
};

