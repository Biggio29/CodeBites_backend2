const express = require('express');
const usersRouter = require('./users');
const recipesRouter = require('./recipes');

const router = express.Router();

router.use('/users', usersRouter);

router.use('/recipes', recipesRouter);

module.exports = router;
