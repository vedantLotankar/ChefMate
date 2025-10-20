import { z } from 'zod';

// Ingredient schema
export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.string().min(1, 'Amount is required'),
  unit: z.string().optional(),
});

// Nutrition schema
export const NutritionSchema = z.object({
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
});

// Cooking step schema
export const CookingStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number().min(1),
  description: z.string().min(1, 'Step description is required'),
  duration: z.number().min(0).optional(), // in minutes
  temperature: z.string().optional(),
});

// Recipe schema
export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  cookTime: z.number().min(0), // in minutes
  prepTime: z.number().min(0).optional(), // in minutes
  servings: z.number().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  category: z.string().optional(),
  ingredients: z.array(IngredientSchema),
  steps: z.array(CookingStepSchema),
  nutrition: NutritionSchema.optional(),
  tags: z.array(z.string()).optional(),
  isCustom: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Chat message schema
export const ChatMessageSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
  role: z.enum(['user', 'assistant']),
  timestamp: z.string(),
  context: z.enum(['recipe', 'general']).optional(),
});

// API request/response schemas
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  recipeContext: z.object({
    name: z.string(),
    description: z.string().optional(),
    ingredients: z.array(z.object({
      name: z.string(),
      amount: z.string(),
    })).optional(),
    currentStep: z.string().optional(),
  }).optional(),
});

export const ChatResponseSchema = z.object({
  success: z.boolean(),
  response: z.string(),
  timestamp: z.string(),
  context: z.enum(['recipe', 'general']).optional(),
  error: z.string().optional(),
});

// Filter schema
export const FilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  maxCookTime: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

// Export TypeScript types
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Nutrition = z.infer<typeof NutritionSchema>;
export type CookingStep = z.infer<typeof CookingStepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Filter = z.infer<typeof FilterSchema>;

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { recipeId: string };
  Cooking: { recipeId: string };
  Chat: { recipeId: string };
  IndependentChat: undefined;
  AddRecipe: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  ChatTab: undefined;
  AddRecipeTab: undefined;
};
