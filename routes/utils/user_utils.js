const DButils = require("./DButils");

/**
 * This function marks a recipe as favorite for a user
 */
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`INSERT INTO favoriterecipes VALUES ('${user_id}',${recipe_id})`);
}

/**
 * This function returns the favorite recipes of a user
 */
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM favoriterecipes WHERE user_id='${user_id}'`);
    return recipes_id;
}

/**
 * This function checks if a recipe is marked as favorite by a user
 */
async function getIsFavorite(user_id, recipe_id) {
    const favorites = await DButils.execQuery(`SELECT * FROM favoriterecipes WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`);
    return favorites.length >= 1;
}

/**
 * This function checks if a recipe is watched by a user
 */
async function getIsRecipeWatched(user_id, recipe_id) {
    const watchedRecipes = await getWatchedRecipes(user_id);
    return watchedRecipes.includes(recipe_id);
}

/**
 * This function returns the watched recipes of a user
 */
async function getWatchedRecipes(user_id) {
    const watchedRecipes = await DButils.execQuery(`SELECT recipe_id FROM watchedbyuser WHERE user_id='${user_id}'`);
    return watchedRecipes.map((recipe) => recipe.recipe_id);
}

/**
 * This function save a recipe as watched for a specific user
 */
async function saveRecipeAsWatched(user_id, recipe_id) {
    const query = `INSERT INTO watchedbyuser VALUES ('${user_id}', '${recipe_id}', NOW())`;
    const values = [user_id, recipe_id];
    await DButils.execQuery(query, values);
}

/**
 * This function create a recipe and sets its full details
 */
async function createRecipe(recipeData) {
    const {user_id, recipe_id, name, imageURL, preparationTimeInMinutes, numOfLikes, vegan, vegetarian, glutenFree, instructions, servings, ingredients} = recipeData;
    // const instructionsString = JSON.stringify(instructions);
    // const ingredientsString = JSON.stringify(ingredients);
    const query = `INSERT INTO recipesbyuser (user_id, recipe_id, name, imageURL, preparationTimeInMinutes, numOfLikes, vegan, vegetarian, glutenFree, instructions, servings, ingredients) VALUES (${user_id}, '${recipe_id}', '${recipeData.name}', '${recipeData.imageURL}', ${recipeData.preparationTimeInMinutes}, ${recipeData.numOfLikes}, ${recipeData.vegan}, ${recipeData.vegetarian}, '${recipeData.glutenFree}', '${recipeData.instructions}', '${recipeData.servings}', '${recipeData.ingredients}')`;
    const values = [user_id, recipe_id, name, imageURL, preparationTimeInMinutes, numOfLikes, vegan, vegetarian, glutenFree, instructions, servings, ingredients];
    await DButils.execQuery(query, values);
}

/**
 * This function validates the recipe's data
 */
function validateRecipeData(recipeData) {
    const {name, imageURL, preparationTimeInMinutes, numOfLikes, vegan, vegetarian, glutenFree, instructions, servings, ingredients} = recipeData;
    if (!name || !imageURL || vegetarian === undefined || vegan === undefined || glutenFree === undefined || !preparationTimeInMinutes || !servings || !instructions || !ingredients || !numOfLikes) {
      throw { status: 400, message: "Incomplete or invalid recipe data provided." };
    }
}

/**
 * This function fetches the recipe IDs associated with a specific user id
 */
async function fetchRecipesByUserId(user_id) {
    return recipes_id = await DButils.execQuery(`SELECT recipe_id FROM recipesbyuser WHERE user_id='${user_id}'`);
}

/**
 * This function returns the preview information of recipes associated with a specific user id
 */
async function getMyRecipesPreview(user_id) {
    const userRecipes = await DButils.execQuery(`SELECT user_id, name, imageURL, preparationTimeInMinutes, numOfLikes, vegan, vegetarian, glutenFree FROM recipesbyuser WHERE user_id='${user_id}'`);
    return userRecipes.map(recipe => ({
      user_id: recipe.user_id,
      name: recipe.name,
      imageURL: recipe.imageURL,
      preparationTimeInMinutes: recipe.preparationTimeInMinutes,
      numOfLikes: recipe.numOfLikes,
      vegan: recipe.vegan,
      vegetarian: recipe.vegetarian,
      glutenFree: recipe.glutenFree
    }));
}

/**
 * This function returns the last three recipes watched by a specific user
 */
async function getMyFamilyRecipes(user_id) {
    const familyRecipes = await DButils.execQuery(`SELECT * FROM familyrecipes WHERE user_id='${user_id}'`);
    return familyRecipes;
}

/**
 * This function returns the family recipes associated with a specific user id
 */
async function getLastThreeRecipes(user_id) {
    const recipes = await DButils.execQuery(`SELECT recipe_id FROM watchedbyuser WHERE user_id = '${user_id}' ORDER BY date DESC LIMIT 3`);
    return recipes;
}


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getLastThreeRecipes = getLastThreeRecipes;
exports.saveRecipeAsWatched = saveRecipeAsWatched;
exports.getMyFamilyRecipes = getMyFamilyRecipes; 
exports.createRecipe = createRecipe;
exports.fetchRecipesByUserId = fetchRecipesByUserId;
exports.getMyRecipesPreview = getMyRecipesPreview;
exports.getIsFavorite = getIsFavorite;
exports.getIsRecipeWatched = getIsRecipeWatched;
exports.validateRecipeData = validateRecipeData;
