var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

// router.get("/", (req, res) => res.send("im here"));

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
 * This path returns recipes by query
 */
router.get("/search/:query", async (req, res, next) => {
  try {
    let results = await recipes_utils.searchRecipesByQuery(req.params.query, req.query);
    if (!results || results.length === 0) {
      res.send("We couldn't find any results matching your search.");
    }
    res.send(results);
  } catch (error) {
    next(error);
  }
});

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


module.exports = router;
