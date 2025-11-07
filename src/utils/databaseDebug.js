import * as SQLite from "expo-sqlite";

// Database instance for debugging
let db = null;

/**
 * Get database connection (for debugging)
 */
const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("chefmate.db");
  }
  return db;
};

/**
 * Log all recipes with full details
 */
export const logAllRecipes = async () => {
  try {
    console.log("\n🔍 ========== DATABASE DEBUG START ==========\n");

    const database = await getDatabase();

    // Get all recipes
    const recipes = await database.getAllAsync(
      `SELECT * FROM recipes ORDER BY id ASC;`
    );

    console.log(`📊 Total Recipes: ${recipes.length}\n`);

    // Log each recipe with full details
    for (const recipe of recipes) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📋 Recipe ID: ${recipe.id}`);
      console.log(`   Name: ${recipe.name}`);
      console.log(`   Description: ${recipe.description || "N/A"}`);
      console.log(`   Category: ${recipe.category || "N/A"}`);
      console.log(`   Difficulty: ${recipe.difficulty || "N/A"}`);
      console.log(`   Servings: ${recipe.servings}`);
      console.log(`   Cook Time: ${recipe.cook_time} minutes`);
      console.log(`   Prep Time: ${recipe.prep_time || "N/A"} minutes`);
      console.log(`   Image: ${recipe.image || "N/A"}`);

      // Get ingredients
      const ingredients = await database.getAllAsync(
        `SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY id ASC;`,
        [recipe.id]
      );
      console.log(`\n   🥘 Ingredients (${ingredients.length}):`);
      ingredients.forEach((ing, index) => {
        console.log(
          `      ${index + 1}. ${ing.name} - ${ing.amount} ${ing.unit || ""}`
        );
      });

      // Get instructions
      const instructions = await database.getAllAsync(
        `SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number ASC;`,
        [recipe.id]
      );
      console.log(`\n   📝 Instructions (${instructions.length}):`);
      instructions.forEach((inst) => {
        console.log(
          `      Step ${inst.step_number}: ${inst.description}${inst.duration ? ` (${inst.duration} min)` : ""}`
        );
      });

      // Get nutrition
      const nutrition = await database.getFirstAsync(
        `SELECT * FROM nutrition WHERE recipe_id = ?;`,
        [recipe.id]
      );
      if (nutrition) {
        console.log(`\n   🥗 Nutrition:`);
        console.log(`      Calories: ${nutrition.calories || "N/A"}`);
        console.log(`      Protein: ${nutrition.protein || "N/A"}g`);
        console.log(`      Carbs: ${nutrition.carbs || "N/A"}g`);
        console.log(`      Fat: ${nutrition.fat || "N/A"}g`);
      }

      // Get tags
      const tags = await database.getAllAsync(
        `SELECT tag FROM tags WHERE recipe_id = ? ORDER BY tag ASC;`,
        [recipe.id]
      );
      if (tags.length > 0) {
        console.log(`\n   🏷️  Tags: ${tags.map((t) => t.tag).join(", ")}`);
      }

      console.log("");
    }

    // Summary statistics
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📈 DATABASE SUMMARY:");

    const totalIngredients = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM ingredients;"
    );
    const totalInstructions = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM instructions;"
    );
    const totalNutrition = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM nutrition;"
    );
    const totalTags = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM tags;"
    );

    console.log(`   Recipes: ${recipes.length}`);
    console.log(`   Ingredients: ${totalIngredients?.count || 0}`);
    console.log(`   Instructions: ${totalInstructions?.count || 0}`);
    console.log(`   Nutrition entries: ${totalNutrition?.count || 0}`);
    console.log(`   Tags: ${totalTags?.count || 0}`);

    // Recipes by category
    const byCategory = await database.getAllAsync(
      "SELECT category, COUNT(*) as count FROM recipes GROUP BY category;"
    );
    if (byCategory.length > 0) {
      console.log("\n📂 Recipes by Category:");
      byCategory.forEach((cat) => {
        console.log(`   ${cat.category || "Uncategorized"}: ${cat.count}`);
      });
    }

    // Recipes by difficulty
    const byDifficulty = await database.getAllAsync(
      "SELECT difficulty, COUNT(*) as count FROM recipes GROUP BY difficulty;"
    );
    if (byDifficulty.length > 0) {
      console.log("\n⚡ Recipes by Difficulty:");
      byDifficulty.forEach((diff) => {
        console.log(`   ${diff.difficulty || "Unknown"}: ${diff.count}`);
      });
    }

    console.log("\n✅ ========== DATABASE DEBUG END ==========\n");

    return recipes;
  } catch (error) {
    console.error("❌ Error logging recipes:", error);
    return [];
  }
};

/**
 * Log just recipe names and IDs (quick view)
 */
export const logRecipeList = async () => {
  try {
    const database = await getDatabase();
    const recipes = await database.getAllAsync(
      "SELECT id, name, category, difficulty FROM recipes ORDER BY id ASC;"
    );

    console.log("\n📋 Recipe List:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    recipes.forEach((recipe) => {
      console.log(
        `ID: ${recipe.id} | ${recipe.name} | ${recipe.category || "N/A"} | ${recipe.difficulty || "N/A"}`
      );
    });
    console.log(`\nTotal: ${recipes.length} recipes\n`);

    return recipes;
  } catch (error) {
    console.error("❌ Error logging recipe list:", error);
    return [];
  }
};

/**
 * Log a specific recipe by ID
 */
export const logRecipeById = async (recipeId) => {
  try {
    const database = await getDatabase();

    const recipe = await database.getFirstAsync(
      "SELECT * FROM recipes WHERE id = ?;",
      [recipeId]
    );

    if (!recipe) {
      console.log(`❌ Recipe with ID ${recipeId} not found`);
      return null;
    }

    console.log("\n🔍 Recipe Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(recipe, null, 2));

    const ingredients = await database.getAllAsync(
      "SELECT * FROM ingredients WHERE recipe_id = ?;",
      [recipeId]
    );
    console.log("\n🥘 Ingredients:");
    console.log(JSON.stringify(ingredients, null, 2));

    const instructions = await database.getAllAsync(
      "SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number;",
      [recipeId]
    );
    console.log("\n📝 Instructions:");
    console.log(JSON.stringify(instructions, null, 2));

    const nutrition = await database.getFirstAsync(
      "SELECT * FROM nutrition WHERE recipe_id = ?;",
      [recipeId]
    );
    if (nutrition) {
      console.log("\n🥗 Nutrition:");
      console.log(JSON.stringify(nutrition, null, 2));
    }

    const tags = await database.getAllAsync(
      "SELECT tag FROM tags WHERE recipe_id = ?;",
      [recipeId]
    );
    if (tags.length > 0) {
      console.log("\n🏷️  Tags:");
      console.log(JSON.stringify(tags, null, 2));
    }

    return recipe;
  } catch (error) {
    console.error("❌ Error logging recipe:", error);
    return null;
  }
};

/**
 * Log database tables structure
 */
export const logDatabaseStructure = async () => {
  try {
    const database = await getDatabase();

    console.log("\n🗄️  Database Structure:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const tables = [
      "recipes",
      "ingredients",
      "instructions",
      "nutrition",
      "tags",
    ];

    for (const table of tables) {
      const info = await database.getFirstAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
        [table]
      );

      if (info) {
        const count = await database.getFirstAsync(
          `SELECT COUNT(*) as count FROM ${table};`
        );
        console.log(`\n📊 Table: ${table} (${count?.count || 0} rows)`);

        // Get column info
        const columns = await database.getAllAsync(
          `PRAGMA table_info(${table});`
        );
        console.log("   Columns:");
        columns.forEach((col) => {
          console.log(`      - ${col.name} (${col.type})`);
        });
      }
    }

    console.log("\n");
  } catch (error) {
    console.error("❌ Error logging database structure:", error);
  }
};
