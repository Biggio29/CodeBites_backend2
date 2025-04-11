const express = require("express");
const usersController = require("../controllers/users");
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'root for users api' });
});

router.post('/register', usersController.register);

router.post('/login', usersController.login);

router.post('/logout', authenticateJWT, usersController.logout);

router.get('/checkLogin', authenticateJWT, usersController.checkLogin); 

module.exports = router;
