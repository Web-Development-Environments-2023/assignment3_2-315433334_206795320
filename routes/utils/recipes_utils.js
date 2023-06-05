const axios = require("axios");
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



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

async function getRandomRecipes() {
    const result = await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return result;
}

// async function getRandomRecipes() {
//   const url = `${api_domain}/random?number=3&apiKey=${process.env.spooncular_apiKey}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error:', error);
//     throw error;
//   }
// }


async function getMyFamilyRecipes(user_id) {
    try {
        const familyRecipes = await DButils.execQuery(`SELECT * from familyRecipes where user_id='${user_id}'`);
        return familyRecipes;
    }
    catch(error) {
        next(error);
  }
}

async function getSearchSimilar(user_id, search_details) {
    try {
      const searchResults = await axios.get(`${api_domain}/complexSearch?`, { params: search_details });
  
      if (searchResults.data.totalResults === 0) {
        return "Found 0 search results";
      }
  
      const resultsData = searchResults.data.results;
      const resultsIds = resultsData.map((element) => element.id);
  
      const recipePromises = resultsIds.map((id) => getRecipeDetails(user_id, id));
      const recipesResults = await Promise.all(recipePromises);
  
      const updatedRecipes = recipesResults.map((result) => {
        delete result.ingredients;
        delete result.servings;
        return result;
      });
  
      return updatedRecipes;
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  }
  












exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.getMyFamilyRecipes = getMyFamilyRecipes;
exports.getSearchSimilar = getSearchSimilar;


