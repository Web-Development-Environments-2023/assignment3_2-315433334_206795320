var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns recipes by query
 */
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.query;
    const quantity = req.query.quantity;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerances = req.query.intolerances;

    if (req.session && req.session.user_name) {
      req.session.lastSearch = query;
    }
    let results = await recipes_utils.getSearchSimiliar(query, quantity, cuisine, diet, intolerances);
    if (results.length == 0) {
      res.send("We couldn't find any results matching your search.");
    }
    res.send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns 3 random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const randomRecipes = await recipes_utils.getRandomRecipes();
    res.send(randomRecipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets the user's family recipes
 */
router.get('/myFamilyRecipes', async (req,res,next) => {
  try{
    let familyRecipes = await user_utils.getMyFamilyRecipes(req.session.user_id);
    const familyRecipesResults = {};
    familyRecipesResults.recipes = familyRecipes;
    res.status(200).send(familyRecipesResults);
  } catch(error) {
    next(error);
  }
});





module.exports = router;
