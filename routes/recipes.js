const express = require('express');
const recipesController = require('../controllers/recipes');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'root for recipes api' });
});

router.get('/all', recipesController.getAllRecipes);

router.get('/byLoggedUser/:userId', authenticateJWT, recipesController.getRecipesByLoggedUser);

router.post('/addRecipe', authenticateJWT, recipesController.addRecipe);

router.get('/:id', recipesController.getRecipeById);

router.delete('/:id', authenticateJWT, recipesController.deleteRecipe);

module.exports = router;
