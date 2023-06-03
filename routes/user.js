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
    await user_utils.markAsFavorite(user_id, recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
});

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
 * This path mark the recipe as watched by a user
 */
router.post('/watched', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;
    if (!Number.isInteger(Number(recipe_id))) {
      throw { status: 400, message: "Invalid Recipe ID. Recipe ID must be an integer" };
    }
    await user_utils.saveRecipeAsWatched(user_id, recipe_id);
    res.status(200);
  } catch (error) {
    next(error);
  }
});


/**
 * This path checks if a recipe is favorite by its id
 */
router.get('/isFavorite', async (req,res,next) => {
  try{
    const answer = await user_utils.getIsFavorite(req.session.user_id, req.body.recipe_Id);
    res.status(200).send(answer);
  } catch(error) {
    next(error); 
  }
});

/**
 * This path checks if recipe is watched by a user
 */
router.get("/isWatched", async (req, res, next) => {
  try {
    const { user_id } = req.session;
    if (user_id) {
      const recipe_id = req.body.recipe_Id;
      const isWatched = await user_utils.getIsRecipeWatched(user_id, recipe_id);
      res.send(isWatched);
    } else {
      throw { status: 401, message: "User is not authenticated" };
    }
  } catch (error) {
    next(error);
  }
});


/**
 * This path creates a recipe
 */
router.post('/createARecipe', async (req,res,next) => {
  try{
    const recipeData = {
      user_id: req.session.user_id,
      ...req.body
    };
    // Determine the highest existing recipe_id in recipesbyuser table
    const result = await DButils.execQuery("SELECT MAX(recipe_id) AS max_id FROM recipesbyuser");
    const maxRecipeId = result[0].max_id || 0; // If no existing recipes, start from 0
    // Increment the recipe_id for the new recipe
    const newRecipeId = maxRecipeId + 1;
    // Assign the new recipe_id to the recipeData
    recipeData.recipe_id = newRecipeId;
    user_utils.validateRecipeData(recipeData);
    await user_utils.createRecipe(recipeData);
    res.status(200).send(recipeData);
  } catch(error) {
    next(error); 
  }
});

/**
 * This path returns the recipes that the user created
 */
router.get('/userRecipes', async (req,res,next) => {
  try {
    const user_id = req.session.user_id;
    const results = await user_utils.getMyRecipesPreview(user_id);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets the user's family recipes
 */
router.get("/myFamilyRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const results = await user_utils.getMyFamilyRecipes(user_id);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the last 3 recipes that the user has watched
 */
router.get("/lastWatchedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getLastThreeRecipes(user_id);
    const results = await recipe_utils.getFullDetailsOfRecipes(recipes, user_id);
    res.send(results);
  } catch (error) {
    next(error);
  }
});


module.exports = router;



//create recipe format:
// {
//   "name": "pasta",
//   "imageURL": "https://spoonacular.com/recipeImages/641799-556x370.jpg",
//   "preparationTimeInMinutes": "45",
//   "numOfLikes": "50",
//   "vegan": 1,
//   "vegetarian": 1,
//   "glutenFree": 1,
//   "instructions":  {
//       "name": "Bourbon Molasses Butter",
//       "steps": [
//           {
//               "equipment": [
//                   {
//                       "id": 404669,
//                       "image": "sauce-pan.jpg",
//                       "name": "sauce pan"
//                   }
//               ],
//               "ingredients": [
//                   {
//                       "id": 10014037,
//                       "image": "bourbon.png",
//                       "name": "bourbon"
//                   },
//                   {
//                       "id": 19335,
//                       "image": "sugar-in-bowl.png",
//                       "name": "sugar"
//                   }
//               ],
//               "number": 1,
//               "step": "Combine the bourbon and sugar in a small saucepan and cook over high heat until reduced to 3 tablespoons, remove and let cool."
//           },
//           {
//               "equipment": [
//                   {
//                       "id": 404771,
//                       "image": "food-processor.png",
//                       "name": "food processor"
//                   }
//               ],
//               "ingredients": [
//                   {
//                       "id": 19304,
//                       "image": "molasses.jpg",
//                       "name": "molasses"
//                   },
//                   {
//                       "id": 10014037,
//                       "image": "bourbon.png",
//                       "name": "bourbon"
//                   },
//                   {
//                       "id": 2047,
//                       "image": "salt.jpg",
//                       "name": "salt"
//                   }
//               ],
//               "number": 2,
//               "step": "Put the butter, molasses, salt and cooled bourbon mixture in a food processor and process until smooth."
//           },
//           {
//               "equipment": [
//                   {
//                       "id": 404730,
//                       "image": "plastic-wrap.jpg",
//                       "name": "plastic wrap"
//                   },
//                   {
//                       "id": 404783,
//                       "image": "bowl.jpg",
//                       "name": "bowl"
//                   }
//               ],
//               "ingredients": [],
//               "number": 3,
//               "step": "Scrape into a bowl, cover with plastic wrap and refrigerate for at least 1 hour to allow the flavors to meld."
//           },
//           {
//               "equipment": [],
//               "ingredients": [],
//               "length": {
//                   "number": 30,
//                   "unit": "minutes"
//               },
//               "number": 4,
//               "step": "Remove from the refrigerator about 30 minutes before using to soften."
//           }
//       ]
//   },
//   "servings": 2,
//   "ingredients": [
//   {
//       "id": 11215,
//       "name": "garlic",
//       "localizedName": "garlic",
//       "image": "garlic.png"
//   },
//   {
//       "id": 11282,
//       "name": "onion",
//       "localizedName": "onion",
//       "image": "brown-onion.png"
//   }
// ]   
//   }