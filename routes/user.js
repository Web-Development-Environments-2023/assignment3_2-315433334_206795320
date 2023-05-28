var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
 * This path checks if recipe is favorite
 */
router.get('/isFavorite', async (req,res,next) => {
  try{
    const answer = await user_utils.getIsFavorite(req.session.user_name, req.query.recipeId);
    res.status(200).send(answer);
  } catch(error) {
    next(error); 
  }
});

/**
 * This path creates recipe
 */
router.post('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const title = req.body.title;
    const imageURL = req.body.image;
    const popularity = req.body.popularity;
    const readyInMinutes = req.body.readyInMinutes;
    const vegan = req.body.vegan;
    const vegetarian = req.body.vegetarian;
    const glutenFree = req.body.glutenFree;
    const servings = req.body.servings;
    const instructions = req.body.instructions;
    const ingredients = req.body.ingrediants;
    await createRecipe(user_id, title, imageURL, popularity, readyInMinutes, vegan, vegetarian, glutenFree, servings, instructions, ingredients);
    res.status(200).send("Your recipe has been successfully created!");
  } catch(error) {
    next(error); 
  }
});

/**
 * This path get the created recipes
 */
router.get('/myRecipes', async (req,res,next) => {
  try{
    let myCreatedRecipes = await recipe_utils.getMyRecipes(req.session.user_id);
    const createdRecipesResults = {};
    createdRecipesResults.recipes = myCreatedRecipes;
    res.status(200).send(createdRecipesResults);
  } catch(error) {
    next(error); 
  }
});

// /**
//  * This path checks if the user has seen the recipe
//  */
// router.get('/isSeen', async (req,res,next) => {
//   try{
//     if (req.session.user_name) {
//       const answer = await recipe_utils.getIsSeen(req.session.user_name, req.query.recipeId);
//     res.status(200).send(answer);
//     }
//   } catch(error) {
//     next(error); 
//   }
// });

/**
 * This path returns the last 3 recipes that the user watched
 */
router.get('/lastWatchedRecipes', async (req,res,next) => {
  try{
    const lastWatchedRecipes = await user_utils.getLastWatchedRecipes(req.session.user_name);
    console.log(lastWatchedRecipes);
    const lastWatchedRecipesResults = await Promise.all(lastWatchedRecipes.map(async (recipe) => {
      console.log(recipe.rec_id);
      return await recipe_utils.getAllRecipesDetails(recipe.rec_id);
    }));
    res.send(lastWatchedRecipesResults);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
