import * as SQLite from 'expo-sqlite';

// Database instance - will be initialized asynchronously
let db = null;

/**
 * Initialize the database connection
 */
const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('chefmate.db');
  }
  return db;
};

/**
 * Initialize the database - creates all tables and inserts dummy data if needed
 */
export const initDatabase = async () => {
  try {
    const database = await getDatabase();
    
    // Create all tables
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        servings INTEGER NOT NULL,
        cook_time INTEGER NOT NULL,
        prep_time INTEGER,
        category TEXT,
        difficulty TEXT,
        image TEXT
      );
    `);
    console.log('✅ Recipes table created/verified');

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        unit TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Ingredients table created/verified');

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS instructions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        step_number INTEGER NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Instructions table created/verified');

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS nutrition (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Nutrition table created/verified');

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        tag TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tags table created/verified');

    // Check if recipes table is empty
    const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM recipes;');
    const count = result?.count || 0;
    console.log(`📊 Recipes in database: ${count}`);
    
    if (count === 0) {
      console.log('📝 Database is empty, inserting dummy data...');
      await insertDummyData();
      console.log('✅ Dummy data inserted successfully');
    } else {
      console.log('✅ Database already has recipes');
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

/**
 * Insert dummy data - 20-25 realistic recipes with full details
 */
export const insertDummyData = async () => {
  const dummyRecipes = [
    {
      name: "Spaghetti Carbonara",
      description: "Classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
      servings: 2,
      cook_time: 20,
      prep_time: 10,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_1.jpg",
      ingredients: [
        { name: "Spaghetti", amount: 200, unit: "g" },
        { name: "Eggs", amount: 2, unit: "pcs" },
        { name: "Pancetta", amount: 100, unit: "g" },
        { name: "Parmesan cheese", amount: 50, unit: "g" },
        { name: "Black pepper", amount: 1, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Boil pasta until al dente.", duration: 10 },
        { step_number: 2, description: "Cook pancetta until crispy.", duration: 5 },
        { step_number: 3, description: "Mix eggs and cheese, combine with pasta.", duration: 5 }
      ],
      nutrition: { calories: 600, protein: 25, carbs: 70, fat: 20 },
      tags: ["Italian", "Pasta"]
    },
    {
      name: "Classic Margherita Pizza",
      description: "A traditional Italian pizza with fresh tomatoes, mozzarella, and basil",
      servings: 4,
      cook_time: 15,
      prep_time: 30,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_2.jpg",
      ingredients: [
        { name: "Pizza dough", amount: 1, unit: "ball" },
        { name: "Tomato sauce", amount: 0.5, unit: "cup" },
        { name: "Fresh mozzarella", amount: 8, unit: "oz" },
        { name: "Fresh basil leaves", amount: 12, unit: "leaves" },
        { name: "Olive oil", amount: 2, unit: "tbsp" },
        { name: "Salt", amount: 1, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Preheat oven to 500°F (260°C) with a pizza stone.", duration: 30 },
        { step_number: 2, description: "Roll out the pizza dough on a floured surface to 12-inch diameter.", duration: 5 },
        { step_number: 3, description: "Spread tomato sauce evenly over the dough, leaving a 1-inch border.", duration: 2 },
        { step_number: 4, description: "Tear mozzarella into small pieces and distribute over the sauce.", duration: 3 },
        { step_number: 5, description: "Drizzle with olive oil and season with salt.", duration: 1 },
        { step_number: 6, description: "Transfer to pizza stone and bake for 10-12 minutes until crust is golden.", duration: 12 },
        { step_number: 7, description: "Remove from oven, top with fresh basil leaves, and serve immediately.", duration: 2 }
      ],
      nutrition: { calories: 320, protein: 15, carbs: 35, fat: 12 },
      tags: ["Italian", "Vegetarian", "Quick"]
    },
    {
      name: "Creamy Chicken Alfredo",
      description: "Rich and creamy pasta with tender chicken and parmesan cheese",
      servings: 4,
      cook_time: 20,
      prep_time: 15,
      category: "Dinner",
      difficulty: "Easy",
      image: "assets/recipes/recipe_3.jpg",
      ingredients: [
        { name: "Fettuccine pasta", amount: 1, unit: "lb" },
        { name: "Chicken breast", amount: 2, unit: "pieces" },
        { name: "Heavy cream", amount: 2, unit: "cups" },
        { name: "Parmesan cheese", amount: 1, unit: "cup" },
        { name: "Butter", amount: 4, unit: "tbsp" },
        { name: "Garlic", amount: 4, unit: "cloves" },
        { name: "Salt", amount: 1, unit: "tsp" },
        { name: "Black pepper", amount: 0.5, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Cook fettuccine according to package directions until al dente.", duration: 12 },
        { step_number: 2, description: "Season chicken with salt and pepper, then cook in a large skillet over medium-high heat.", duration: 8 },
        { step_number: 3, description: "Remove chicken and set aside. In the same skillet, melt butter.", duration: 2 },
        { step_number: 4, description: "Add minced garlic and cook for 1 minute until fragrant.", duration: 1 },
        { step_number: 5, description: "Pour in heavy cream and bring to a simmer.", duration: 3 },
        { step_number: 6, description: "Gradually whisk in parmesan cheese until smooth.", duration: 2 },
        { step_number: 7, description: "Add cooked pasta and chicken to the sauce, toss to combine.", duration: 2 }
      ],
      nutrition: { calories: 580, protein: 35, carbs: 45, fat: 28 },
      tags: ["Italian", "Comfort Food", "Creamy"]
    },
    {
      name: "Chocolate Chip Cookies",
      description: "Soft and chewy homemade chocolate chip cookies",
      servings: 24,
      cook_time: 12,
      prep_time: 20,
      category: "Dessert",
      difficulty: "Easy",
      image: "assets/recipes/recipe_4.jpg",
      ingredients: [
        { name: "All-purpose flour", amount: 2.25, unit: "cups" },
        { name: "Butter", amount: 1, unit: "cup" },
        { name: "Brown sugar", amount: 0.75, unit: "cup" },
        { name: "White sugar", amount: 0.5, unit: "cup" },
        { name: "Eggs", amount: 2, unit: "large" },
        { name: "Vanilla extract", amount: 2, unit: "tsp" },
        { name: "Baking soda", amount: 1, unit: "tsp" },
        { name: "Salt", amount: 1, unit: "tsp" },
        { name: "Chocolate chips", amount: 2, unit: "cups" }
      ],
      instructions: [
        { step_number: 1, description: "Preheat oven to 375°F (190°C).", duration: 10 },
        { step_number: 2, description: "Cream together butter and both sugars until light and fluffy.", duration: 3 },
        { step_number: 3, description: "Beat in eggs one at a time, then add vanilla.", duration: 2 },
        { step_number: 4, description: "In a separate bowl, whisk together flour, baking soda, and salt.", duration: 2 },
        { step_number: 5, description: "Gradually mix dry ingredients into wet ingredients.", duration: 3 },
        { step_number: 6, description: "Fold in chocolate chips.", duration: 1 },
        { step_number: 7, description: "Drop rounded tablespoons onto ungreased baking sheets.", duration: 5 },
        { step_number: 8, description: "Bake for 9-11 minutes until golden brown.", duration: 11 }
      ],
      nutrition: { calories: 150, protein: 2, carbs: 20, fat: 7 },
      tags: ["Dessert", "Baking", "Sweet"]
    },
    {
      name: "Grilled Salmon with Lemon",
      description: "Perfectly grilled salmon with fresh lemon and herbs",
      servings: 4,
      cook_time: 10,
      prep_time: 10,
      category: "Dinner",
      difficulty: "Easy",
      image: "assets/recipes/recipe_5.jpg",
      ingredients: [
        { name: "Salmon fillets", amount: 4, unit: "pieces" },
        { name: "Lemon", amount: 2, unit: "pieces" },
        { name: "Olive oil", amount: 3, unit: "tbsp" },
        { name: "Fresh dill", amount: 2, unit: "tbsp" },
        { name: "Garlic", amount: 3, unit: "cloves" },
        { name: "Salt", amount: 1, unit: "tsp" },
        { name: "Black pepper", amount: 0.5, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Preheat grill to medium-high heat.", duration: 10 },
        { step_number: 2, description: "Pat salmon fillets dry and season with salt and pepper.", duration: 2 },
        { step_number: 3, description: "Mix olive oil, minced garlic, and chopped dill in a small bowl.", duration: 2 },
        { step_number: 4, description: "Brush the herb mixture over the salmon fillets.", duration: 1 },
        { step_number: 5, description: "Place salmon on grill, skin-side down, and cook for 4-5 minutes.", duration: 5 },
        { step_number: 6, description: "Flip and cook for another 3-4 minutes until fish flakes easily.", duration: 4 },
        { step_number: 7, description: "Serve with lemon wedges and fresh dill garnish.", duration: 1 }
      ],
      nutrition: { calories: 280, protein: 35, carbs: 2, fat: 15 },
      tags: ["Healthy", "Grilled", "Seafood"]
    },
    {
      name: "Avocado Toast",
      description: "Simple and delicious avocado toast with various toppings",
      servings: 2,
      cook_time: 5,
      prep_time: 5,
      category: "Breakfast",
      difficulty: "Easy",
      image: "assets/recipes/recipe_6.jpg",
      ingredients: [
        { name: "Bread slices", amount: 4, unit: "slices" },
        { name: "Ripe avocados", amount: 2, unit: "pieces" },
        { name: "Lemon juice", amount: 1, unit: "tbsp" },
        { name: "Salt", amount: 0.5, unit: "tsp" },
        { name: "Black pepper", amount: 0.25, unit: "tsp" },
        { name: "Red pepper flakes", amount: 0.25, unit: "tsp" },
        { name: "Olive oil", amount: 1, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Toast bread slices until golden brown.", duration: 3 },
        { step_number: 2, description: "Cut avocados in half, remove pit, and scoop flesh into a bowl.", duration: 2 },
        { step_number: 3, description: "Add lemon juice, salt, and pepper to avocado and mash with a fork.", duration: 1 },
        { step_number: 4, description: "Spread avocado mixture evenly on toast.", duration: 1 },
        { step_number: 5, description: "Drizzle with olive oil and sprinkle with red pepper flakes.", duration: 1 }
      ],
      nutrition: { calories: 220, protein: 6, carbs: 18, fat: 16 },
      tags: ["Healthy", "Quick", "Vegetarian"]
    },
    {
      name: "Beef Stir Fry",
      description: "Quick and flavorful beef stir fry with vegetables",
      servings: 4,
      cook_time: 15,
      prep_time: 20,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_7.jpg",
      ingredients: [
        { name: "Beef sirloin", amount: 1, unit: "lb" },
        { name: "Broccoli", amount: 2, unit: "cups" },
        { name: "Bell peppers", amount: 2, unit: "pieces" },
        { name: "Onion", amount: 1, unit: "medium" },
        { name: "Garlic", amount: 3, unit: "cloves" },
        { name: "Ginger", amount: 1, unit: "tbsp" },
        { name: "Soy sauce", amount: 3, unit: "tbsp" },
        { name: "Sesame oil", amount: 1, unit: "tbsp" },
        { name: "Cornstarch", amount: 1, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Slice beef thinly against the grain.", duration: 5 },
        { step_number: 2, description: "Mix soy sauce, sesame oil, and cornstarch in a bowl.", duration: 2 },
        { step_number: 3, description: "Marinate beef in the sauce mixture for 10 minutes.", duration: 10 },
        { step_number: 4, description: "Heat a large wok or skillet over high heat.", duration: 2 },
        { step_number: 5, description: "Stir-fry beef for 2-3 minutes until browned.", duration: 3 },
        { step_number: 6, description: "Add vegetables and stir-fry for 4-5 minutes until crisp-tender.", duration: 5 },
        { step_number: 7, description: "Add garlic and ginger, stir-fry for 1 minute.", duration: 1 },
        { step_number: 8, description: "Return beef to pan and toss everything together.", duration: 1 }
      ],
      nutrition: { calories: 320, protein: 28, carbs: 12, fat: 18 },
      tags: ["Asian", "Quick", "High Protein"]
    },
    {
      name: "Caesar Salad",
      description: "Classic Caesar salad with homemade dressing",
      servings: 4,
      cook_time: 0,
      prep_time: 15,
      category: "Lunch",
      difficulty: "Easy",
      image: "assets/recipes/recipe_8.jpg",
      ingredients: [
        { name: "Romaine lettuce", amount: 2, unit: "heads" },
        { name: "Parmesan cheese", amount: 0.5, unit: "cup" },
        { name: "Croutons", amount: 1, unit: "cup" },
        { name: "Anchovy fillets", amount: 2, unit: "pieces" },
        { name: "Garlic", amount: 2, unit: "cloves" },
        { name: "Lemon juice", amount: 2, unit: "tbsp" },
        { name: "Dijon mustard", amount: 1, unit: "tsp" },
        { name: "Olive oil", amount: 0.25, unit: "cup" }
      ],
      instructions: [
        { step_number: 1, description: "Wash and dry romaine lettuce, tear into bite-sized pieces.", duration: 3 },
        { step_number: 2, description: "Make dressing by blending anchovies, garlic, lemon juice, and mustard.", duration: 3 },
        { step_number: 3, description: "Slowly whisk in olive oil until emulsified.", duration: 2 },
        { step_number: 4, description: "Toss lettuce with dressing until well coated.", duration: 2 },
        { step_number: 5, description: "Add croutons and grated parmesan cheese.", duration: 2 },
        { step_number: 6, description: "Serve immediately.", duration: 1 }
      ],
      nutrition: { calories: 180, protein: 8, carbs: 12, fat: 12 },
      tags: ["Healthy", "Vegetarian", "Classic"]
    },
    {
      name: "Banana Pancakes",
      description: "Fluffy pancakes with mashed banana and cinnamon",
      servings: 4,
      cook_time: 15,
      prep_time: 10,
      category: "Breakfast",
      difficulty: "Easy",
      image: "assets/recipes/recipe_9.jpg",
      ingredients: [
        { name: "All-purpose flour", amount: 1, unit: "cup" },
        { name: "Baking powder", amount: 2, unit: "tsp" },
        { name: "Salt", amount: 0.25, unit: "tsp" },
        { name: "Milk", amount: 1, unit: "cup" },
        { name: "Egg", amount: 1, unit: "large" },
        { name: "Ripe banana", amount: 1, unit: "piece" },
        { name: "Butter", amount: 2, unit: "tbsp" },
        { name: "Cinnamon", amount: 0.5, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Mix flour, baking powder, salt, and cinnamon in a large bowl.", duration: 2 },
        { step_number: 2, description: "In another bowl, whisk together milk, egg, and melted butter.", duration: 2 },
        { step_number: 3, description: "Mash banana and add to wet ingredients.", duration: 1 },
        { step_number: 4, description: "Pour wet ingredients into dry ingredients and stir until just combined.", duration: 2 },
        { step_number: 5, description: "Heat a griddle or pan over medium heat.", duration: 3 },
        { step_number: 6, description: "Pour 1/4 cup batter for each pancake.", duration: 1 },
        { step_number: 7, description: "Cook until bubbles form on surface, then flip and cook until golden.", duration: 4 }
      ],
      nutrition: { calories: 200, protein: 6, carbs: 32, fat: 6 },
      tags: ["Breakfast", "Sweet", "Quick"]
    },
    {
      name: "Chicken Tikka Masala",
      description: "Creamy Indian curry with tender chicken pieces",
      servings: 4,
      cook_time: 30,
      prep_time: 20,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_10.jpg",
      ingredients: [
        { name: "Chicken breast", amount: 1.5, unit: "lb" },
        { name: "Yogurt", amount: 0.5, unit: "cup" },
        { name: "Garam masala", amount: 2, unit: "tsp" },
        { name: "Tomato sauce", amount: 1, unit: "can" },
        { name: "Heavy cream", amount: 0.5, unit: "cup" },
        { name: "Onion", amount: 1, unit: "medium" },
        { name: "Garlic", amount: 4, unit: "cloves" },
        { name: "Ginger", amount: 1, unit: "tbsp" },
        { name: "Butter", amount: 3, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Marinate chicken in yogurt and garam masala for 30 minutes.", duration: 30 },
        { step_number: 2, description: "Cook chicken in a pan until golden, then set aside.", duration: 10 },
        { step_number: 3, description: "Sauté onions, garlic, and ginger until soft.", duration: 5 },
        { step_number: 4, description: "Add tomato sauce and simmer for 10 minutes.", duration: 10 },
        { step_number: 5, description: "Add cream and return chicken to pan.", duration: 5 },
        { step_number: 6, description: "Simmer for 10 minutes until chicken is cooked through.", duration: 10 }
      ],
      nutrition: { calories: 420, protein: 32, carbs: 15, fat: 25 },
      tags: ["Indian", "Spicy", "Comfort Food"]
    },
    {
      name: "French Onion Soup",
      description: "Rich and savory soup with caramelized onions and melted cheese",
      servings: 4,
      cook_time: 45,
      prep_time: 15,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_11.jpg",
      ingredients: [
        { name: "Yellow onions", amount: 4, unit: "large" },
        { name: "Butter", amount: 4, unit: "tbsp" },
        { name: "Beef broth", amount: 4, unit: "cups" },
        { name: "White wine", amount: 0.5, unit: "cup" },
        { name: "Gruyere cheese", amount: 1, unit: "cup" },
        { name: "French bread", amount: 4, unit: "slices" },
        { name: "Thyme", amount: 1, unit: "tsp" },
        { name: "Bay leaf", amount: 1, unit: "piece" }
      ],
      instructions: [
        { step_number: 1, description: "Slice onions thinly and caramelize in butter over low heat for 30 minutes.", duration: 30 },
        { step_number: 2, description: "Add wine and deglaze the pan.", duration: 2 },
        { step_number: 3, description: "Add broth, thyme, and bay leaf. Simmer for 20 minutes.", duration: 20 },
        { step_number: 4, description: "Toast bread slices and place on top of soup in bowls.", duration: 5 },
        { step_number: 5, description: "Top with grated cheese and broil until bubbly.", duration: 3 }
      ],
      nutrition: { calories: 280, protein: 12, carbs: 25, fat: 14 },
      tags: ["French", "Comfort Food", "Soup"]
    },
    {
      name: "Vegetable Pad Thai",
      description: "Classic Thai stir-fried noodles with vegetables",
      servings: 4,
      cook_time: 15,
      prep_time: 15,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_12.jpg",
      ingredients: [
        { name: "Rice noodles", amount: 8, unit: "oz" },
        { name: "Tofu", amount: 8, unit: "oz" },
        { name: "Bean sprouts", amount: 1, unit: "cup" },
        { name: "Carrots", amount: 2, unit: "medium" },
        { name: "Green onions", amount: 4, unit: "stalks" },
        { name: "Peanuts", amount: 0.25, unit: "cup" },
        { name: "Lime", amount: 2, unit: "pieces" },
        { name: "Fish sauce", amount: 2, unit: "tbsp" },
        { name: "Brown sugar", amount: 2, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Soak rice noodles in warm water until soft.", duration: 10 },
        { step_number: 2, description: "Press and cube tofu, then pan-fry until golden.", duration: 5 },
        { step_number: 3, description: "Julienne carrots and slice green onions.", duration: 5 },
        { step_number: 4, description: "Mix fish sauce and brown sugar for the sauce.", duration: 1 },
        { step_number: 5, description: "Stir-fry noodles with vegetables and tofu.", duration: 5 },
        { step_number: 6, description: "Add sauce and toss everything together.", duration: 2 },
        { step_number: 7, description: "Serve with bean sprouts, peanuts, and lime wedges.", duration: 2 }
      ],
      nutrition: { calories: 380, protein: 15, carbs: 55, fat: 12 },
      tags: ["Thai", "Vegetarian", "Noodles"]
    },
    {
      name: "Beef Tacos",
      description: "Classic Mexican tacos with seasoned ground beef",
      servings: 6,
      cook_time: 15,
      prep_time: 10,
      category: "Dinner",
      difficulty: "Easy",
      image: "assets/recipes/recipe_13.jpg",
      ingredients: [
        { name: "Ground beef", amount: 1, unit: "lb" },
        { name: "Taco shells", amount: 12, unit: "pieces" },
        { name: "Lettuce", amount: 2, unit: "cups" },
        { name: "Tomatoes", amount: 2, unit: "medium" },
        { name: "Cheddar cheese", amount: 1, unit: "cup" },
        { name: "Sour cream", amount: 0.5, unit: "cup" },
        { name: "Taco seasoning", amount: 1, unit: "packet" },
        { name: "Onion", amount: 0.5, unit: "medium" }
      ],
      instructions: [
        { step_number: 1, description: "Brown ground beef in a large skillet over medium-high heat.", duration: 8 },
        { step_number: 2, description: "Add taco seasoning and water, simmer until thickened.", duration: 5 },
        { step_number: 3, description: "Chop lettuce, dice tomatoes, and slice onions.", duration: 5 },
        { step_number: 4, description: "Warm taco shells according to package directions.", duration: 3 },
        { step_number: 5, description: "Fill shells with beef, then top with vegetables, cheese, and sour cream.", duration: 2 }
      ],
      nutrition: { calories: 320, protein: 18, carbs: 22, fat: 18 },
      tags: ["Mexican", "Quick", "Family Friendly"]
    },
    {
      name: "Mushroom Risotto",
      description: "Creamy Italian rice dish with sautéed mushrooms",
      servings: 4,
      cook_time: 30,
      prep_time: 10,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_14.jpg",
      ingredients: [
        { name: "Arborio rice", amount: 1.5, unit: "cups" },
        { name: "Mushrooms", amount: 1, unit: "lb" },
        { name: "White wine", amount: 0.5, unit: "cup" },
        { name: "Chicken broth", amount: 4, unit: "cups" },
        { name: "Parmesan cheese", amount: 0.5, unit: "cup" },
        { name: "Onion", amount: 1, unit: "medium" },
        { name: "Garlic", amount: 3, unit: "cloves" },
        { name: "Butter", amount: 3, unit: "tbsp" },
        { name: "Olive oil", amount: 2, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Heat broth in a separate pot and keep warm.", duration: 5 },
        { step_number: 2, description: "Sauté mushrooms until golden, then set aside.", duration: 8 },
        { step_number: 3, description: "Cook onion and garlic until soft.", duration: 5 },
        { step_number: 4, description: "Add rice and toast for 2 minutes.", duration: 2 },
        { step_number: 5, description: "Add wine and stir until absorbed.", duration: 3 },
        { step_number: 6, description: "Add broth one ladle at a time, stirring constantly.", duration: 15 },
        { step_number: 7, description: "Stir in mushrooms, butter, and parmesan before serving.", duration: 2 }
      ],
      nutrition: { calories: 380, protein: 12, carbs: 55, fat: 14 },
      tags: ["Italian", "Vegetarian", "Comfort Food"]
    },
    {
      name: "Greek Salad",
      description: "Fresh Mediterranean salad with feta cheese and olives",
      servings: 4,
      cook_time: 0,
      prep_time: 15,
      category: "Lunch",
      difficulty: "Easy",
      image: "assets/recipes/recipe_15.jpg",
      ingredients: [
        { name: "Cucumbers", amount: 2, unit: "medium" },
        { name: "Tomatoes", amount: 3, unit: "large" },
        { name: "Red onion", amount: 0.5, unit: "medium" },
        { name: "Feta cheese", amount: 6, unit: "oz" },
        { name: "Kalamata olives", amount: 0.5, unit: "cup" },
        { name: "Olive oil", amount: 3, unit: "tbsp" },
        { name: "Lemon juice", amount: 2, unit: "tbsp" },
        { name: "Oregano", amount: 1, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Dice cucumbers and tomatoes into bite-sized pieces.", duration: 5 },
        { step_number: 2, description: "Thinly slice red onion.", duration: 2 },
        { step_number: 3, description: "Crumble feta cheese.", duration: 2 },
        { step_number: 4, description: "Whisk together olive oil, lemon juice, and oregano for dressing.", duration: 2 },
        { step_number: 5, description: "Combine all vegetables, olives, and feta in a large bowl.", duration: 2 },
        { step_number: 6, description: "Drizzle with dressing and toss gently.", duration: 2 }
      ],
      nutrition: { calories: 220, protein: 8, carbs: 12, fat: 16 },
      tags: ["Healthy", "Vegetarian", "Mediterranean"]
    },
    {
      name: "BBQ Pulled Pork",
      description: "Slow-cooked tender pork with barbecue sauce",
      servings: 8,
      cook_time: 240,
      prep_time: 15,
      category: "Dinner",
      difficulty: "Easy",
      image: "assets/recipes/recipe_16.jpg",
      ingredients: [
        { name: "Pork shoulder", amount: 3, unit: "lb" },
        { name: "BBQ sauce", amount: 1, unit: "cup" },
        { name: "Brown sugar", amount: 2, unit: "tbsp" },
        { name: "Paprika", amount: 1, unit: "tsp" },
        { name: "Garlic powder", amount: 1, unit: "tsp" },
        { name: "Onion powder", amount: 1, unit: "tsp" },
        { name: "Salt", amount: 1, unit: "tsp" },
        { name: "Black pepper", amount: 0.5, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Mix spices and rub all over pork shoulder.", duration: 5 },
        { step_number: 2, description: "Place pork in slow cooker and cook on low for 6-8 hours.", duration: 240 },
        { step_number: 3, description: "Remove pork and shred with two forks.", duration: 10 },
        { step_number: 4, description: "Mix shredded pork with BBQ sauce.", duration: 2 },
        { step_number: 5, description: "Serve on buns or as desired.", duration: 2 }
      ],
      nutrition: { calories: 320, protein: 28, carbs: 15, fat: 16 },
      tags: ["BBQ", "Comfort Food", "Slow Cooker"]
    },
    {
      name: "Shrimp Scampi",
      description: "Garlicky shrimp in white wine and butter sauce",
      servings: 4,
      cook_time: 10,
      prep_time: 10,
      category: "Dinner",
      difficulty: "Easy",
      image: "assets/recipes/recipe_17.jpg",
      ingredients: [
        { name: "Shrimp", amount: 1.5, unit: "lb" },
        { name: "Linguine pasta", amount: 1, unit: "lb" },
        { name: "Butter", amount: 4, unit: "tbsp" },
        { name: "Olive oil", amount: 2, unit: "tbsp" },
        { name: "Garlic", amount: 6, unit: "cloves" },
        { name: "White wine", amount: 0.5, unit: "cup" },
        { name: "Lemon juice", amount: 2, unit: "tbsp" },
        { name: "Parsley", amount: 0.25, unit: "cup" },
        { name: "Red pepper flakes", amount: 0.5, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Cook linguine according to package directions.", duration: 10 },
        { step_number: 2, description: "Season shrimp with salt and pepper.", duration: 2 },
        { step_number: 3, description: "Heat butter and oil in a large pan over medium-high heat.", duration: 2 },
        { step_number: 4, description: "Add shrimp and cook for 2 minutes per side.", duration: 4 },
        { step_number: 5, description: "Add garlic and red pepper flakes, cook for 1 minute.", duration: 1 },
        { step_number: 6, description: "Add wine and lemon juice, simmer for 2 minutes.", duration: 2 },
        { step_number: 7, description: "Toss with pasta and parsley before serving.", duration: 1 }
      ],
      nutrition: { calories: 420, protein: 32, carbs: 45, fat: 12 },
      tags: ["Italian", "Seafood", "Quick"]
    },
    {
      name: "Chicken Caesar Wrap",
      description: "Grilled chicken wrapped in tortilla with Caesar salad",
      servings: 4,
      cook_time: 10,
      prep_time: 10,
      category: "Lunch",
      difficulty: "Easy",
      image: "assets/recipes/recipe_18.jpg",
      ingredients: [
        { name: "Chicken breast", amount: 2, unit: "pieces" },
        { name: "Large tortillas", amount: 4, unit: "pieces" },
        { name: "Romaine lettuce", amount: 2, unit: "cups" },
        { name: "Caesar dressing", amount: 0.25, unit: "cup" },
        { name: "Parmesan cheese", amount: 0.25, unit: "cup" },
        { name: "Croutons", amount: 0.5, unit: "cup" },
        { name: "Black pepper", amount: 0.5, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Season and grill chicken until cooked through, then slice.", duration: 10 },
        { step_number: 2, description: "Chop romaine lettuce into bite-sized pieces.", duration: 3 },
        { step_number: 3, description: "Toss lettuce with Caesar dressing.", duration: 1 },
        { step_number: 4, description: "Warm tortillas slightly.", duration: 1 },
        { step_number: 5, description: "Fill each tortilla with chicken, lettuce, cheese, and croutons.", duration: 3 },
        { step_number: 6, description: "Roll up tightly and serve.", duration: 1 }
      ],
      nutrition: { calories: 380, protein: 28, carbs: 32, fat: 16 },
      tags: ["Quick", "Lunch", "Healthy"]
    },
    {
      name: "Vegetable Lasagna",
      description: "Layered pasta dish with vegetables and cheese",
      servings: 8,
      cook_time: 45,
      prep_time: 30,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_19.jpg",
      ingredients: [
        { name: "Lasagna noodles", amount: 12, unit: "pieces" },
        { name: "Ricotta cheese", amount: 2, unit: "cups" },
        { name: "Mozzarella cheese", amount: 2, unit: "cups" },
        { name: "Parmesan cheese", amount: 0.5, unit: "cup" },
        { name: "Spinach", amount: 2, unit: "cups" },
        { name: "Zucchini", amount: 2, unit: "medium" },
        { name: "Mushrooms", amount: 1, unit: "cup" },
        { name: "Marinara sauce", amount: 3, unit: "cups" },
        { name: "Egg", amount: 1, unit: "large" }
      ],
      instructions: [
        { step_number: 1, description: "Cook lasagna noodles according to package directions.", duration: 12 },
        { step_number: 2, description: "Sauté vegetables until tender.", duration: 10 },
        { step_number: 3, description: "Mix ricotta, egg, and half the parmesan.", duration: 3 },
        { step_number: 4, description: "Layer noodles, sauce, vegetables, and cheese in baking dish.", duration: 10 },
        { step_number: 5, description: "Repeat layers, ending with cheese on top.", duration: 5 },
        { step_number: 6, description: "Bake at 375°F for 30 minutes until bubbly.", duration: 30 },
        { step_number: 7, description: "Let rest for 10 minutes before serving.", duration: 10 }
      ],
      nutrition: { calories: 380, protein: 20, carbs: 35, fat: 18 },
      tags: ["Italian", "Vegetarian", "Comfort Food"]
    },
    {
      name: "Fish and Chips",
      description: "Beer-battered fish with crispy fries",
      servings: 4,
      cook_time: 20,
      prep_time: 20,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_20.jpg",
      ingredients: [
        { name: "White fish fillets", amount: 1.5, unit: "lb" },
        { name: "Potatoes", amount: 4, unit: "large" },
        { name: "All-purpose flour", amount: 1, unit: "cup" },
        { name: "Beer", amount: 1, unit: "cup" },
        { name: "Baking powder", amount: 1, unit: "tsp" },
        { name: "Salt", amount: 1, unit: "tsp" },
        { name: "Vegetable oil", amount: 4, unit: "cups" },
        { name: "Tartar sauce", amount: 0.5, unit: "cup" }
      ],
      instructions: [
        { step_number: 1, description: "Cut potatoes into fries and soak in cold water.", duration: 10 },
        { step_number: 2, description: "Mix flour, beer, and baking powder for batter.", duration: 3 },
        { step_number: 3, description: "Heat oil to 375°F in a deep fryer or large pot.", duration: 5 },
        { step_number: 4, description: "Fry potatoes until golden and crispy.", duration: 8 },
        { step_number: 5, description: "Dip fish in batter and fry until golden.", duration: 6 },
        { step_number: 6, description: "Drain on paper towels and season with salt.", duration: 2 },
        { step_number: 7, description: "Serve with tartar sauce and lemon wedges.", duration: 1 }
      ],
      nutrition: { calories: 520, protein: 28, carbs: 45, fat: 24 },
      tags: ["British", "Fried", "Comfort Food"]
    },
    {
      name: "Mango Sticky Rice",
      description: "Sweet Thai dessert with coconut rice and fresh mango",
      servings: 4,
      cook_time: 25,
      prep_time: 10,
      category: "Dessert",
      difficulty: "Easy",
      image: "assets/recipes/recipe_21.jpg",
      ingredients: [
        { name: "Sticky rice", amount: 1, unit: "cup" },
        { name: "Coconut milk", amount: 1, unit: "can" },
        { name: "Sugar", amount: 0.25, unit: "cup" },
        { name: "Salt", amount: 0.25, unit: "tsp" },
        { name: "Ripe mangoes", amount: 2, unit: "pieces" },
        { name: "Sesame seeds", amount: 1, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Soak sticky rice in water for at least 4 hours or overnight.", duration: 240 },
        { step_number: 2, description: "Steam rice until tender, about 20 minutes.", duration: 20 },
        { step_number: 3, description: "Heat coconut milk with sugar and salt until sugar dissolves.", duration: 5 },
        { step_number: 4, description: "Pour coconut mixture over cooked rice and let absorb.", duration: 10 },
        { step_number: 5, description: "Slice mangoes and arrange on top of rice.", duration: 3 },
        { step_number: 6, description: "Sprinkle with sesame seeds and serve.", duration: 1 }
      ],
      nutrition: { calories: 320, protein: 4, carbs: 55, fat: 12 },
      tags: ["Thai", "Dessert", "Sweet"]
    },
    {
      name: "Beef Burgers",
      description: "Juicy homemade beef burgers with all the fixings",
      servings: 4,
      cook_time: 10,
      prep_time: 15,
      category: "Dinner",
      difficulty: "Easy",
      image: "assets/recipes/recipe_22.jpg",
      ingredients: [
        { name: "Ground beef", amount: 1.5, unit: "lb" },
        { name: "Burger buns", amount: 4, unit: "pieces" },
        { name: "Lettuce", amount: 4, unit: "leaves" },
        { name: "Tomatoes", amount: 1, unit: "large" },
        { name: "Onion", amount: 1, unit: "medium" },
        { name: "Cheddar cheese", amount: 4, unit: "slices" },
        { name: "Pickles", amount: 8, unit: "slices" },
        { name: "Ketchup", amount: 2, unit: "tbsp" },
        { name: "Mustard", amount: 2, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Form ground beef into 4 patties, season with salt and pepper.", duration: 5 },
        { step_number: 2, description: "Heat grill or pan to medium-high heat.", duration: 5 },
        { step_number: 3, description: "Cook burgers for 4-5 minutes per side for medium.", duration: 10 },
        { step_number: 4, description: "Add cheese slices in the last minute of cooking.", duration: 1 },
        { step_number: 5, description: "Toast burger buns lightly.", duration: 2 },
        { step_number: 6, description: "Assemble burgers with all toppings and condiments.", duration: 3 }
      ],
      nutrition: { calories: 480, protein: 32, carbs: 28, fat: 26 },
      tags: ["American", "Grilled", "Comfort Food"]
    },
    {
      name: "Chicken Noodle Soup",
      description: "Classic comfort soup with chicken and vegetables",
      servings: 6,
      cook_time: 30,
      prep_time: 15,
      category: "Dinner",
      difficulty: "Easy",
      image: "assets/recipes/recipe_23.jpg",
      ingredients: [
        { name: "Chicken breast", amount: 1, unit: "lb" },
        { name: "Egg noodles", amount: 8, unit: "oz" },
        { name: "Carrots", amount: 3, unit: "medium" },
        { name: "Celery", amount: 3, unit: "stalks" },
        { name: "Onion", amount: 1, unit: "medium" },
        { name: "Chicken broth", amount: 6, unit: "cups" },
        { name: "Thyme", amount: 1, unit: "tsp" },
        { name: "Bay leaf", amount: 1, unit: "piece" },
        { name: "Salt", amount: 1, unit: "tsp" },
        { name: "Black pepper", amount: 0.5, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Cook chicken in broth until tender, then shred.", duration: 20 },
        { step_number: 2, description: "Dice carrots, celery, and onion.", duration: 5 },
        { step_number: 3, description: "Add vegetables to broth and simmer for 10 minutes.", duration: 10 },
        { step_number: 4, description: "Add noodles and cook according to package directions.", duration: 8 },
        { step_number: 5, description: "Return shredded chicken to pot.", duration: 2 },
        { step_number: 6, description: "Season with thyme, salt, and pepper.", duration: 1 }
      ],
      nutrition: { calories: 220, protein: 18, carbs: 25, fat: 5 },
      tags: ["Comfort Food", "Soup", "Healthy"]
    },
    {
      name: "Chocolate Brownies",
      description: "Rich and fudgy chocolate brownies",
      servings: 16,
      cook_time: 25,
      prep_time: 15,
      category: "Dessert",
      difficulty: "Easy",
      image: "assets/recipes/recipe_24.jpg",
      ingredients: [
        { name: "Butter", amount: 0.5, unit: "cup" },
        { name: "Dark chocolate", amount: 4, unit: "oz" },
        { name: "Sugar", amount: 1, unit: "cup" },
        { name: "Eggs", amount: 2, unit: "large" },
        { name: "Vanilla extract", amount: 1, unit: "tsp" },
        { name: "All-purpose flour", amount: 0.5, unit: "cup" },
        { name: "Cocoa powder", amount: 0.25, unit: "cup" },
        { name: "Salt", amount: 0.25, unit: "tsp" }
      ],
      instructions: [
        { step_number: 1, description: "Preheat oven to 350°F (175°C) and line a baking pan.", duration: 5 },
        { step_number: 2, description: "Melt butter and chocolate together in a double boiler.", duration: 5 },
        { step_number: 3, description: "Whisk in sugar until combined.", duration: 2 },
        { step_number: 4, description: "Beat in eggs and vanilla.", duration: 2 },
        { step_number: 5, description: "Fold in flour, cocoa powder, and salt.", duration: 2 },
        { step_number: 6, description: "Pour into prepared pan and bake for 20-25 minutes.", duration: 25 },
        { step_number: 7, description: "Let cool completely before cutting into squares.", duration: 30 }
      ],
      nutrition: { calories: 180, protein: 2, carbs: 22, fat: 10 },
      tags: ["Dessert", "Baking", "Chocolate"]
    },
    {
      name: "Vegetable Curry",
      description: "Spicy Indian curry with mixed vegetables",
      servings: 4,
      cook_time: 25,
      prep_time: 15,
      category: "Dinner",
      difficulty: "Medium",
      image: "assets/recipes/recipe_25.jpg",
      ingredients: [
        { name: "Mixed vegetables", amount: 4, unit: "cups" },
        { name: "Onion", amount: 1, unit: "medium" },
        { name: "Garlic", amount: 4, unit: "cloves" },
        { name: "Ginger", amount: 1, unit: "tbsp" },
        { name: "Curry powder", amount: 2, unit: "tsp" },
        { name: "Turmeric", amount: 1, unit: "tsp" },
        { name: "Coconut milk", amount: 1, unit: "can" },
        { name: "Tomato paste", amount: 2, unit: "tbsp" },
        { name: "Vegetable oil", amount: 2, unit: "tbsp" }
      ],
      instructions: [
        { step_number: 1, description: "Heat oil and sauté onions until golden.", duration: 5 },
        { step_number: 2, description: "Add garlic, ginger, and spices, cook for 1 minute.", duration: 1 },
        { step_number: 3, description: "Add vegetables and cook for 5 minutes.", duration: 5 },
        { step_number: 4, description: "Stir in tomato paste.", duration: 1 },
        { step_number: 5, description: "Add coconut milk and simmer for 15 minutes.", duration: 15 },
        { step_number: 6, description: "Season with salt and serve with rice.", duration: 2 }
      ],
      nutrition: { calories: 220, protein: 6, carbs: 25, fat: 12 },
      tags: ["Indian", "Vegetarian", "Spicy"]
    }
  ];

  const database = await getDatabase();
  
  for (const recipe of dummyRecipes) {
    try {
      // Insert recipe
      const result = await database.runAsync(
        `INSERT INTO recipes (name, description, servings, cook_time, prep_time, category, difficulty, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          recipe.name,
          recipe.description,
          recipe.servings,
          recipe.cook_time,
          recipe.prep_time,
          recipe.category,
          recipe.difficulty,
          recipe.image
        ]
      );
      const recipeId = result.lastInsertRowId;
      console.log(`✅ Inserted recipe: ${recipe.name} (ID: ${recipeId})`);

      // Insert ingredients
      for (const ingredient of recipe.ingredients) {
        await database.runAsync(
          `INSERT INTO ingredients (recipe_id, name, amount, unit)
           VALUES (?, ?, ?, ?);`,
          [recipeId, ingredient.name, ingredient.amount, ingredient.unit]
        );
      }

      // Insert instructions
      for (const instruction of recipe.instructions) {
        await database.runAsync(
          `INSERT INTO instructions (recipe_id, step_number, description, duration)
           VALUES (?, ?, ?, ?);`,
          [recipeId, instruction.step_number, instruction.description, instruction.duration]
        );
      }

      // Insert nutrition
      if (recipe.nutrition) {
        await database.runAsync(
          `INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat)
           VALUES (?, ?, ?, ?, ?);`,
          [
            recipeId,
            recipe.nutrition.calories,
            recipe.nutrition.protein,
            recipe.nutrition.carbs,
            recipe.nutrition.fat
          ]
        );
      }

      // Insert tags
      for (const tag of recipe.tags) {
        await database.runAsync(
          `INSERT INTO tags (recipe_id, tag)
           VALUES (?, ?);`,
          [recipeId, tag]
        );
      }
    } catch (error) {
      console.error(`❌ Error inserting recipe: ${recipe.name}`, error);
    }
  }
};

/**
 * Add a new user-created recipe to the database
 */
export const addRecipe = async (
  name,
  description,
  servings,
  cook_time,
  prep_time,
  category,
  difficulty,
  imageUri,
  ingredients = [],
  instructions = [],
  nutrition = null,
  tags = []
) => {
  try {
    const database = await getDatabase();
    
    // Insert recipe
    const result = await database.runAsync(
      `INSERT INTO recipes (name, description, servings, cook_time, prep_time, category, difficulty, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [name, description, servings, cook_time, prep_time, category, difficulty, imageUri]
    );
    const recipeId = result.lastInsertRowId;
    console.log(`✅ Added new recipe: ${name} (ID: ${recipeId})`);

    // Insert ingredients
    for (const ingredient of ingredients) {
      await database.runAsync(
        `INSERT INTO ingredients (recipe_id, name, amount, unit)
         VALUES (?, ?, ?, ?);`,
        [recipeId, ingredient.name, ingredient.amount, ingredient.unit || null]
      );
    }

    // Insert instructions
    for (const instruction of instructions) {
      await database.runAsync(
        `INSERT INTO instructions (recipe_id, step_number, description, duration)
         VALUES (?, ?, ?, ?);`,
        [
          recipeId,
          instruction.step_number,
          instruction.description,
          instruction.duration || null
        ]
      );
    }

    // Insert nutrition
    if (nutrition) {
      await database.runAsync(
        `INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat)
         VALUES (?, ?, ?, ?, ?);`,
        [
          recipeId,
          nutrition.calories || null,
          nutrition.protein || null,
          nutrition.carbs || null,
          nutrition.fat || null
        ]
      );
    }

    // Insert tags
    for (const tag of tags) {
      await database.runAsync(
        `INSERT INTO tags (recipe_id, tag)
         VALUES (?, ?);`,
        [recipeId, tag]
      );
    }

    return recipeId;
  } catch (error) {
    console.error('❌ Error adding recipe:', error);
    throw error;
  }
};

/**
 * Get all recipes - returns basic recipe info
 */
export const getAllRecipes = async (callback) => {
  try {
    const database = await getDatabase();
    const recipes = await database.getAllAsync(
      `SELECT id, name, category, difficulty, image 
       FROM recipes 
       ORDER BY id ASC;`
    );
    console.log(`✅ Fetched ${recipes.length} recipes`);
    callback(recipes);
  } catch (error) {
    console.error('❌ Error fetching all recipes:', error);
    callback([]);
  }
};

/**
 * Get full recipe details including ingredients, instructions, nutrition, and tags
 */
export const getRecipeDetails = async (recipeId, callback) => {
  try {
    const database = await getDatabase();
    
    // Get recipe basic info
    const recipe = await database.getFirstAsync(
      `SELECT * FROM recipes WHERE id = ?;`,
      [recipeId]
    );

    if (!recipe) {
      console.log(`❌ Recipe with ID ${recipeId} not found`);
      callback(null);
      return;
    }

    console.log(`✅ Found recipe: ${recipe.name}`);

    // Get ingredients
    const ingredients = await database.getAllAsync(
      `SELECT id, name, amount, unit 
       FROM ingredients 
       WHERE recipe_id = ? 
       ORDER BY id ASC;`,
      [recipeId]
    );
    recipe.ingredients = ingredients;

    // Get instructions
    const instructions = await database.getAllAsync(
      `SELECT id, step_number, description, duration 
       FROM instructions 
       WHERE recipe_id = ? 
       ORDER BY step_number ASC;`,
      [recipeId]
    );
    recipe.instructions = instructions;

    // Get nutrition
    const nutrition = await database.getFirstAsync(
      `SELECT calories, protein, carbs, fat 
       FROM nutrition 
       WHERE recipe_id = ?;`,
      [recipeId]
    );
    recipe.nutrition = nutrition || null;

    // Get tags
    const tags = await database.getAllAsync(
      `SELECT tag 
       FROM tags 
       WHERE recipe_id = ? 
       ORDER BY tag ASC;`,
      [recipeId]
    );
    recipe.tags = tags.map((row) => row.tag);

    console.log(`✅ Fetched full details for recipe: ${recipe.name}`);
    callback(recipe);
  } catch (error) {
    console.error('❌ Error fetching recipe details:', error);
    callback(null);
  }
};
