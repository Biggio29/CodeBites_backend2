require('dotenv').config();
const Recipe = require('../models/recipes');
const jwt = require('jsonwebtoken');
const { getIo } = require('../socket');

const getUserFromToken = (req) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return null;
    }
    const secretKey = process.env.SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (err) {
    console.error('Errore nella verifica del token:', err);
    return null;
  }
};

module.exports = {
  getAllRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find()
        .sort({ createdAt: -1 })
        .populate('author', 'username -_id')
        .select('imgSrc title description createdAt');
      res.json(recipes);
    } catch (error) {
      console.error('Errore nel recupero delle ricette:', error);
      res.status(500).json({ error: 'Errore nel recupero delle ricette' });
    }
  },

  getRecipesByLoggedUser: async (req, res) => {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({ error: "Token non valido o scaduto." });
      }

      const recipes = await Recipe.find({ author: user.id })
        .sort({ createdAt: -1 })
        .populate('author', 'username');

      res.json(recipes);
    } catch (error) {
      console.error('Errore nel recupero delle ricette:', error);
      res.status(500).json({ error: 'Errore nel recupero delle ricette' });
    }
  },

  addRecipe: async (req, res) => {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({ error: "Non sei autenticato, effettua il login" });
      }

      const { imgSrc, title, description, ingredients, instructions } = req.body;
      if (!imgSrc || !title || !description || !ingredients || !instructions) {
        return res.status(400).json({ error: "Dati incompleti. Immagine, titolo e descrizione sono obbligatori." });
      }

      const newRecipe = await Recipe.create({
        imgSrc,
        title,
        description,
        ingredients,
        instructions,
        author: user.id,
      });

      getIo().emit('recipesUpdated');

      res.status(201).json(newRecipe);
    } catch (error) {
      console.error('Errore nella creazione della ricetta:', error);
      res.status(500).json({ error: 'Errore nella creazione della ricetta' });
    }
  },

  getRecipeById: async (req, res) => {
    try {
      const recipeId = req.params.id;
      const recipe = await Recipe.findById(recipeId).populate('author', 'username');

      if (!recipe) {
        return res.status(404).json({ error: 'Ricetta non trovata' });
      }

      res.json(recipe);
    } catch (error) {
      console.error('Errore nel recupero della ricetta:', error);
      res.status(500).json({ error: 'Errore nel recupero della ricetta' });
    }
  },

  deleteRecipe: async (req, res) => {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({ error: "Non sei autenticato" });
      }

      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: "Ricetta non trovata" });
      }

      if (recipe.author.toString() !== user.id) {
        return res.status(403).json({ error: "Non sei autorizzato a eliminare questa ricetta" });
      }

      await Recipe.findByIdAndDelete(req.params.id);

      getIo().emit('recipesUpdated');

      return res.status(204).send();
    } catch (error) {
      console.error('Errore nella eliminazione della ricetta:', error);
      res.status(500).json({ error: 'Errore nella eliminazione della ricetta' });
    }
  }
};