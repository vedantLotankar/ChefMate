import { Recipe } from '../api/types';
import { 
  getRecipes, 
  storeRecipes, 
  addRecipe, 
  updateRecipe, 
  deleteRecipe 
} from './storage';

// User recipes are stored in the same AsyncStorage as other recipes
// but we provide a dedicated interface for user-created recipes

export const getUserRecipes = async (): Promise<Recipe[]> => {
  const allRecipes = await getRecipes();
  return allRecipes.filter(recipe => recipe.isCustom === true);
};

export const addUserRecipe = async (recipe: Recipe): Promise<void> => {
  const recipeWithCustomFlag = {
    ...recipe,
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await addRecipe(recipeWithCustomFlag);
};

export const updateUserRecipe = async (recipeId: string, recipe: Recipe): Promise<void> => {
  const updatedRecipe = {
    ...recipe,
    isCustom: true,
    updatedAt: new Date().toISOString(),
  };
  
  await updateRecipe(recipeId, updatedRecipe);
};

export const deleteUserRecipe = async (recipeId: string): Promise<void> => {
  await deleteRecipe(recipeId);
};

export const getUserRecipeById = async (recipeId: string): Promise<Recipe | undefined> => {
  const userRecipes = await getUserRecipes();
  return userRecipes.find(recipe => recipe.id === recipeId);
};
