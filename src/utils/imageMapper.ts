// Simple image mapping: matches image filename to recipe title
// Example: "pasta.jpeg" will match any recipe with "pasta" in the title

// Import all available images - key is the filename without extension
const AVAILABLE_IMAGES: Record<string, any> = {
  'pasta': require('../assets/images/pasta.jpeg'),
  // Add more images as you add them:
  // 'chicken': require('../assets/images/chicken.jpeg'),
  // 'pizza': require('../assets/images/pizza.jpeg'),
  // etc.
};

/**
 * Get image source for a recipe based on its name
 * Checks if the image filename (without extension) appears in the recipe title
 */
export const getRecipeImage = (recipeName: string): any => {
  if (!recipeName) return null;

  const recipeNameLower = recipeName.toLowerCase();
  
  // Check each image key - if it appears in the recipe name, use that image
  for (const [imageKey, imageSource] of Object.entries(AVAILABLE_IMAGES)) {
    if (recipeNameLower.includes(imageKey.toLowerCase())) {
      return imageSource;
    }
  }
  
  return null;
};

/**
 * Check if a local image exists for a recipe
 */
export const hasLocalImage = (recipeName: string): boolean => {
  return getRecipeImage(recipeName) !== null;
};
