import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, Filter } from '../api/types';
import { 
  getAllRecipes as getAllRecipesFromDb,
  getRecipeDetails as getRecipeDetailsFromDb,
  addRecipe as addRecipeToDb,
} from '../utils/database';
import { transformDbRecipeToRecipe, transformRecipeToDbFormat } from '../utils/databaseHelpers';
import { 
  getFavorites,
  storeFavorites,
  addToFavorites,
  removeFromFavorites,
} from '../utils/storage';
import { DEBUG_CONFIG } from '../utils/constants';

interface RecipeState {
  // Recipe data
  recipes: Recipe[];
  customRecipes: Recipe[];
  favorites: string[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Search and filter
  searchQuery: string;
  filters: Filter;
  
  // Current recipe
  currentRecipe: Recipe | null;
  currentServings: number;
  
  // Actions
  loadRecipes: () => Promise<void>;
  addCustomRecipe: (recipe: Recipe) => Promise<void>;
  updateCustomRecipe: (recipeId: string, recipe: Recipe) => Promise<void>;
  deleteCustomRecipe: (recipeId: string) => Promise<void>;
  
  // Favorites
  loadFavorites: () => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<Filter>) => void;
  clearFilters: () => void;
  
  // Current recipe
  setCurrentRecipe: (recipe: Recipe | null) => void;
  setCurrentServings: (servings: number) => void;
  adjustServings: (multiplier: number) => void;
  
  // Utility
  getFilteredRecipes: () => Recipe[];
  getRecipeById: (id: string) => Recipe | undefined;
  clearError: () => void;
}

const defaultFilters: Filter = {
  search: '',
  category: undefined,
  difficulty: undefined,
  maxCookTime: undefined,
  tags: [],
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      // Initial state
      recipes: [],
      customRecipes: [],
      favorites: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      filters: defaultFilters,
      currentRecipe: null,
      currentServings: 4,
      
      // Load recipes from database
      loadRecipes: async () => {
        set({ isLoading: true, error: null });
        try {
          const [dbRecipes, storedFavorites] = await Promise.all([
            new Promise<Recipe[]>((resolve) => {
              getAllRecipesFromDb((recipes) => {
                // Transform all recipes from database format to app format
                const transformedRecipes = recipes.map((recipe) => {
                  // For basic recipe list, we need to fetch full details
                  // For now, return basic info and fetch details on demand
                  return {
                    id: recipe.id.toString(),
                    name: recipe.name,
                    description: recipe.description || undefined,
                    image: recipe.image || undefined,
                    cookTime: recipe.cook_time || 0,
                    prepTime: recipe.prep_time || undefined,
                    servings: recipe.servings || 4,
                    difficulty: (recipe.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard',
                    category: recipe.category || undefined,
                    ingredients: [],
                    steps: [],
                    nutrition: undefined,
                    tags: [],
                    isCustom: false,
                  };
                });
                resolve(transformedRecipes);
              });
            }),
            getFavorites(),
          ]);
          
          // Fetch full details for all recipes
          const recipesWithDetails = await Promise.all(
            dbRecipes.map((recipe) => {
              return new Promise<Recipe>((resolve) => {
                getRecipeDetailsFromDb(parseInt(recipe.id), (dbRecipe) => {
                  if (dbRecipe) {
                    // Check if recipe is user-created (ID > 25 for dummy recipes)
                    const isCustom = parseInt(recipe.id) > 25;
                    const transformed = transformDbRecipeToRecipe(dbRecipe, isCustom);
                    resolve(transformed || recipe);
                  } else {
                    resolve(recipe);
                  }
                });
              });
            })
          );
          
          set({ 
            recipes: recipesWithDetails,
            customRecipes: recipesWithDetails.filter(r => r.isCustom),
            favorites: storedFavorites,
            isLoading: false 
          });
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Loaded ${recipesWithDetails.length} recipes and ${storedFavorites.length} favorites`);
          }
        } catch (error) {
          console.error('❌ Error loading recipes:', error);
          set({ 
            error: 'Failed to load recipes', 
            isLoading: false 
          });
        }
      },
      
      // Add custom recipe
      addCustomRecipe: async (recipe: Recipe) => {
        set({ isLoading: true, error: null });
        try {
          const dbFormat = transformRecipeToDbFormat(recipe);
          
          // Add to database
          const recipeId = await new Promise<number>((resolve, reject) => {
            addRecipeToDb(
              dbFormat.name,
              dbFormat.description,
              dbFormat.servings,
              dbFormat.cook_time,
              dbFormat.prep_time,
              dbFormat.category,
              dbFormat.difficulty,
              dbFormat.image,
              dbFormat.ingredients,
              dbFormat.instructions,
              dbFormat.nutrition,
              dbFormat.tags
            )
              .then((id) => resolve(id))
              .catch(reject);
          });
          
          // Update recipe with database ID
          const savedRecipe = {
            ...recipe,
            id: recipeId.toString(),
            isCustom: true,
          };
          
          const { customRecipes, recipes } = get();
          const updatedCustomRecipes = [...customRecipes, savedRecipe];
          const updatedRecipes = [...recipes, savedRecipe];
          
          set({ 
            customRecipes: updatedCustomRecipes,
            recipes: updatedRecipes,
            isLoading: false 
          });
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Added custom recipe: ${recipe.name} (ID: ${recipeId})`);
          }
        } catch (error) {
          console.error('❌ Error adding recipe:', error);
          set({ 
            error: 'Failed to add recipe', 
            isLoading: false 
          });
        }
      },
      
      // Update custom recipe (Note: Database doesn't have update function yet, 
      // so we'll delete and re-add for now)
      updateCustomRecipe: async (recipeId: string, recipe: Recipe) => {
        set({ isLoading: true, error: null });
        try {
          // For now, we'll need to implement update in database.js
          // This is a placeholder - you may want to add updateRecipe function to database.js
          const { customRecipes, recipes } = get();
          
          const updatedCustomRecipes = customRecipes.map(r => 
            r.id === recipeId ? recipe : r
          );
          const updatedRecipes = recipes.map(r => 
            r.id === recipeId ? recipe : r
          );
          
          set({ 
            customRecipes: updatedCustomRecipes,
            recipes: updatedRecipes,
            isLoading: false 
          });
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Updated recipe: ${recipe.name}`);
          }
        } catch (error) {
          console.error('❌ Error updating recipe:', error);
          set({ 
            error: 'Failed to update recipe', 
            isLoading: false 
          });
        }
      },
      
      // Delete custom recipe (Note: Database doesn't have delete function yet)
      deleteCustomRecipe: async (recipeId: string) => {
        set({ isLoading: true, error: null });
        try {
          // For now, just remove from state
          // You may want to add deleteRecipe function to database.js
          const { customRecipes, recipes, favorites } = get();
          
          const updatedCustomRecipes = customRecipes.filter(r => r.id !== recipeId);
          const updatedRecipes = recipes.filter(r => r.id !== recipeId);
          const updatedFavorites = favorites.filter(id => id !== recipeId);
          
          // Remove from favorites if it was favorited
          if (favorites.includes(recipeId)) {
            await removeFromFavorites(recipeId);
          }
          
          set({ 
            customRecipes: updatedCustomRecipes,
            recipes: updatedRecipes,
            favorites: updatedFavorites,
            isLoading: false 
          });
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Deleted recipe: ${recipeId}`);
          }
        } catch (error) {
          console.error('❌ Error deleting recipe:', error);
          set({ 
            error: 'Failed to delete recipe', 
            isLoading: false 
          });
        }
      },
      
      // Load favorites
      loadFavorites: async () => {
        try {
          const favorites = await getFavorites();
          set({ favorites });
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Loaded ${favorites.length} favorites`);
          }
        } catch (error) {
          console.error('❌ Error loading favorites:', error);
        }
      },
      
      // Toggle favorite
      toggleFavorite: async (recipeId: string) => {
        try {
          const { favorites } = get();
          const isCurrentlyFavorite = favorites.includes(recipeId);
          
          if (isCurrentlyFavorite) {
            await removeFromFavorites(recipeId);
            const updatedFavorites = favorites.filter(id => id !== recipeId);
            set({ favorites: updatedFavorites });
          } else {
            await addToFavorites(recipeId);
            const updatedFavorites = [...favorites, recipeId];
            set({ favorites: updatedFavorites });
          }
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`${isCurrentlyFavorite ? '❌ Removed from' : '✅ Added to'} favorites: ${recipeId}`);
          }
        } catch (error) {
          console.error('❌ Error toggling favorite:', error);
          set({ error: 'Failed to update favorites' });
        }
      },
      
      // Set search query
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        if (DEBUG_CONFIG.enableLogs) {
          console.log(`🔍 Search query: ${query}`);
        }
      },
      
      // Set filters
      setFilters: (newFilters: Partial<Filter>) => {
        const { filters } = get();
        const updatedFilters = { ...filters, ...newFilters };
        set({ filters: updatedFilters });
        
        if (DEBUG_CONFIG.enableLogs) {
          console.log('🔍 Filters updated:', updatedFilters);
        }
      },
      
      // Clear filters
      clearFilters: () => {
        set({ filters: defaultFilters, searchQuery: '' });
        if (DEBUG_CONFIG.enableLogs) {
          console.log('🔍 Filters cleared');
        }
      },
      
      // Set current recipe
      setCurrentRecipe: (recipe: Recipe | null) => {
        set({ 
          currentRecipe: recipe,
          currentServings: recipe?.servings || 4 
        });
        
        if (DEBUG_CONFIG.enableLogs) {
          console.log(`📖 Current recipe: ${recipe?.name || 'None'}`);
        }
      },
      
      // Set current servings
      setCurrentServings: (servings: number) => {
        set({ currentServings: Math.max(1, servings) });
        if (DEBUG_CONFIG.enableLogs) {
          console.log(`🍽️ Servings: ${servings}`);
        }
      },
      
      // Adjust servings
      adjustServings: (multiplier: number) => {
        const { currentServings } = get();
        const newServings = Math.max(1, Math.round(currentServings * multiplier));
        set({ currentServings: newServings });
        
        if (DEBUG_CONFIG.enableLogs) {
          console.log(`🍽️ Servings adjusted: ${currentServings} → ${newServings}`);
        }
      },
      
      // Get filtered recipes
      getFilteredRecipes: () => {
        const { recipes, searchQuery, filters } = get();
        let filteredRecipes = [...recipes];
        
        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredRecipes = filteredRecipes.filter(recipe =>
            recipe.name.toLowerCase().includes(query) ||
            recipe.description?.toLowerCase().includes(query) ||
            recipe.tags?.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        // Apply category filter
        if (filters.category) {
          filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.category === filters.category
          );
        }
        
        // Apply difficulty filter
        if (filters.difficulty) {
          filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.difficulty === filters.difficulty
          );
        }
        
        // Apply cook time filter
        if (filters.maxCookTime) {
          filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.cookTime <= filters.maxCookTime!
          );
        }
        
        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
          filteredRecipes = filteredRecipes.filter(recipe =>
            filters.tags!.some(tag => recipe.tags?.includes(tag))
          );
        }
        
        return filteredRecipes;
      },
      
      // Get recipe by ID (with database fallback)
      getRecipeById: (id: string) => {
        const { recipes } = get();
        const foundRecipe = recipes.find(recipe => recipe.id === id);
        
        // If not found in state, try to fetch from database
        if (!foundRecipe) {
          // This is async, so we return null for now
          // You might want to make this async or use a callback
          getRecipeDetailsFromDb(parseInt(id), (dbRecipe) => {
            if (dbRecipe) {
              const transformed = transformDbRecipeToRecipe(dbRecipe);
              if (transformed) {
                // Add to recipes state
                const { recipes: currentRecipes } = get();
                set({ recipes: [...currentRecipes, transformed] });
              }
            }
          });
        }
        
        return foundRecipe;
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'recipe-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        searchQuery: state.searchQuery,
        filters: state.filters,
      }),
    }
  )
);
