import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, Filter } from '../api/types';
import { dummyRecipes } from '../utils/dummyRecipes';
import { 
  getRecipes, 
  storeRecipes, 
  addRecipe, 
  updateRecipe, 
  deleteRecipe,
  getFavorites,
  storeFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite
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
      
      // Load recipes from storage
      loadRecipes: async () => {
        set({ isLoading: true, error: null });
        try {
          const [storedRecipes, storedFavorites] = await Promise.all([
            getRecipes(),
            getFavorites(),
          ]);
          
          // Merge dummy recipes with custom recipes
          const allRecipes = [...dummyRecipes, ...storedRecipes];
          
          set({ 
            recipes: allRecipes,
            customRecipes: storedRecipes,
            favorites: storedFavorites,
            isLoading: false 
          });
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Loaded ${allRecipes.length} recipes and ${storedFavorites.length} favorites`);
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
          await addRecipe(recipe);
          const { customRecipes, recipes } = get();
          const updatedCustomRecipes = [...customRecipes, recipe];
          const updatedRecipes = [...recipes, recipe];
          
          set({ 
            customRecipes: updatedCustomRecipes,
            recipes: updatedRecipes,
            isLoading: false 
          });
          
          if (DEBUG_CONFIG.enableLogs) {
            console.log(`✅ Added custom recipe: ${recipe.name}`);
          }
        } catch (error) {
          console.error('❌ Error adding recipe:', error);
          set({ 
            error: 'Failed to add recipe', 
            isLoading: false 
          });
        }
      },
      
      // Update custom recipe
      updateCustomRecipe: async (recipeId: string, recipe: Recipe) => {
        set({ isLoading: true, error: null });
        try {
          await updateRecipe(recipeId, recipe);
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
      
      // Delete custom recipe
      deleteCustomRecipe: async (recipeId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteRecipe(recipeId);
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
      
      // Get recipe by ID
      getRecipeById: (id: string) => {
        const { recipes } = get();
        return recipes.find(recipe => recipe.id === id);
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
