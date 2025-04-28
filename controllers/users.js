require('dotenv').config();
const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  if (!process.env.SECRET_KEY) {
    console.error('La variabile SECRET_KEY non è configurata');
    return null;
  }

  console.log('Generazione token per l\'utente:', user.username);
  const secretKey = process.env.SECRET_KEY;

  return jwt.sign(
    { id: user._id, username: user.username },
    secretKey,
    { expiresIn: '1d' }
  );
};

module.exports = {
  register: async (req, res) => {
    const { username, password } = req.body;
    
    console.log('Tentativo di registrazione per l\'utente:', username);
  
    try {
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        console.log('Username già in uso:', username);
        return res.status(400).json({ error: "Username già in uso" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Hashing della password completato con successo');
  
      const newUser = await User.create({
        username,
        password: hashedPassword,
      });
  
      console.log('Registrazione completata con successo');
      return res.status(201).json({ message: "Utente registrato con successo" });
  
    } catch (err) {
      console.error('Errore durante la registrazione:', err);
      return res.status(500).json({ error: "Errore durante la registrazione dell'utente", details: err });
    }
  },   
  
  login: async (req, res) => {
    const { username, password } = req.body;
  
    console.log('Tentativo di login per l\'utente:', username);
    if (!username || !password) {
      return res.status(400).json({ error: "Username e password sono obbligatori" });
    }
  
    try {
      const user = await User.findOne({ username });
  
      if (!user) {
        console.log('Utente non trovato:', username);
        return res.status(404).json({ error: "Utente non trovato" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (isMatch) {
        const token = generateToken(user);
        if (!token) return res.status(500).json({ error: 'Errore nella generazione del token' });
  
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: 86400000, 
        });
  
        return res.status(200).json({
          message: "Login riuscito!",
          user: { id: user._id, username: user.username }
        });
      } else {
        console.log('Password errata per l\'utente:', username);
        return res.status(400).json({ error: "Password errata" });
      }
  
    } catch (err) {
      console.error('Errore durante il login:', err);
      return res.status(500).json({ error: "Errore durante il login", details: err });
    }
  },

  logout: (req, res) => {
    console.log('Logout richiesto');
  
    try {
      res.clearCookie('token', { path: '/', sameSite: 'None', secure: false });
  
      return res.status(200).json({ message: 'Logout avvenuto con successo' });
  
    } catch (err) {
      console.error('Errore durante il logout:', err);
      return res.status(500).json({ error: "Errore durante il logout", details: err });
    }
  },  
  
  checkLogin: async (req, res) => {
    const token = req.cookies.token;
  
    console.log('Controllo del login con token:', token);
  
    if (!token) {
      console.log('Token mancante');
      return res.status(401).json({ error: 'Token mancante o non valido', user: null });
    }
  
    const secretKey = process.env.SECRET_KEY;
  
    if (!secretKey) {
      return res.status(500).json({ error: 'Errore interno: variabile SECRET_KEY non configurata' });
    }
  
    try {
      const user = await new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decodedUser) => {
          if (err) {
            reject(err);
          } else {
            resolve(decodedUser);
          }
        });
      });
  
      console.log('Token verificato con successo, utente:', user.username);
      return res.status(200).json({ user: { id: user.id, username: user.username } });
  
    } catch (err) {
      console.error('Token scaduto o non valido:', err);
      return res.status(401).json({ error: 'Token scaduto o non valido', user: null });
    }
  }
}