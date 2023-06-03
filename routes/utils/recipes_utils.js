const axios = require("axios");
const user_utils = require("./user_utils");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

/**
 * This function ge the preview recipe's details
 */
async function getRecipeDetails(recipe_id) {
    const recipe_info = await getRecipeInformation(recipe_id);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    }
}

/**
 * This function returns 3 random recipes
 */
async function getRandomRecipes() {
    const result = await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return result.data.recipes;
}

/**
 * This function returns recipes by a query
 */
async function searchRecipesByQuery(query, parameters) {
    const number = parameters.number;
    const cuisine = parameters.cuisine;
    const diet = parameters.diet;
    let intolerance = parameters.intolerance;
    let recipes = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            apiKey: process.env.spooncular_apiKey,
            number: number,
            query: query,
            cuisine: cuisine,
            diet: diet,
            intolerance: intolerance
        }
    });
    recipes = await getPartialRecipeDetails(recipes.data.results);
    return recipes;
}

/**
 * This function send every recipe that answered the query to get the details of them
 */
async function getPartialRecipeDetails(recipes) {
    const response = await Promise.all(recipes.map(async (recipe) => {
      let recipeId = recipe.id ?? recipe.recipe_id;
      if (!recipeId) {
        recipeId = recipe;
      }
      return await getRecipeDetails(recipeId);
    }));
    return response;
}
  
/**
 * This function returns the full details of a recipes by its id
 */
async function getFullDetailsOfRecipe(recipe_id, user_id) {
    const recipeFullInformation = await getRecipeInformation(recipe_id);
    const { id, title, image, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients, servings } = recipeFullInformation.data;
    const instructions = await getRecipeInstructions(recipe_id);
    const analyze_Instructions = instructions.data;
    const favorite = await user_utils.getIsFavorite(user_id, recipe_id);
    const watch = await user_utils.getIsRecipeWatched(user_id, recipe_id);
    const fullDetails = {
      id: id,
      image: image,
      title: title,
      readyInMinutes: readyInMinutes,
      aggregateLikes: aggregateLikes,
      vegan: vegan,
      vegetarian: vegetarian,
      gluten_free: glutenFree,
      ingredients: extendedIngredients,
      analyze_Instructions: analyze_Instructions,
      servings: servings,
      favorite: favorite,
      watch: watch,
    };
    return fullDetails;
}
  
/**
 * This function send every recipe from the last 3 viewed recipes to get the full details of them
 */
async function getFullDetailsOfRecipes(recipes, user_id) {
    let results = [];
    for (let i = 0; i < recipes.length; i++){
        results[i] = await getFullDetailsOfRecipe(recipes[i].recipe_id, user_id);
    }
    return results;
}
  
/**
 * This function get the recipe instructions from spoonacular response
 */
async function getRecipeInstructions(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
        params: {
        apiKey: process.env.spooncular_apiKey,
        },
    });
}


exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.searchRecipesByQuery = searchRecipesByQuery;
exports.getPartialRecipeDetails = getPartialRecipeDetails;
exports.getFullDetailsOfRecipe = getFullDetailsOfRecipe;
exports.getFullDetailsOfRecipes = getFullDetailsOfRecipes;
exports.getRecipeInstructions = getRecipeInstructions;