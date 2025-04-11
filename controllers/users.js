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
  register: (req, res) => {
    const { username, password } = req.body;
  
    console.log('Tentativo di registrazione per l\'utente:', username);
  
    User.findOne({ username })
      .then(user => {
        if (user) {
          console.log('Username già in uso:', username);
          return res.status(400).json({ error: "Username già in uso" });
        }
  
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Errore nel hashing della password:', err);
            return res.status(500).json({ error: "Errore nel hashing della password" });
          }
  
          console.log('Hashing della password completato con successo');
          User.create({
            username,
            password: hashedPassword,
          })
          .then(user => {
            console.log('Registrazione completata con successo');
            res.status(201).json({ message: "Utente registrato con successo" });
          })
          .catch(err => {
            console.error('Errore nel salvataggio dell\'utente:', err);
            res.status(500).json({ error: "Errore nel salvataggio dell'utente", details: err });
          });
        });
      })
      .catch(err => {
        console.error('Errore nel recupero dell\'utente:', err);
        res.status(500).json({ error: "Errore nel recupero dell\'utente", details: err });
      });
  },
  
  login: (req, res) => {
    const { username, password } = req.body;

    console.log('Tentativo di login per l\'utente:', username);

    if (!username || !password) {
      return res.status(400).json({ error: "Username e password sono obbligatori" });
    }

    User.findOne({ username })
      .then(user => {
        if (!user) {
          console.log('Utente non trovato:', username);
          return res.status(404).json({ error: "Utente non trovato" });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error('Errore nel confronto delle password:', err);
            return res.status(500).json({ error: "Errore nel confronto delle password" });
          }

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
            res.status(400).json({ error: "Password errata" });
          }
        });
      })
      .catch(err => {
        console.error('Errore nel recupero dell\'utente durante il login:', err);
        res.status(500).json({ error: "Errore nel recupero dell\'utente", details: err });
      });
  },

  logout: (req, res) => {
    console.log('Logout richiesto');
    res.clearCookie('token', { path: '/', sameSite: 'None', secure: true });
    res.status(200).json({ message: 'Logout avvenuto con successo' });
  },

  checkLogin: (req, res) => {
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

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        console.error('Token scaduto o non valido:', err);
        return res.status(401).json({ error: 'Token scaduto o non valido', user: null });
      }

      console.log('Token verificato con successo, utente:', user.username);
      return res.status(200).json({ user: { id: user.id, username: user.username } });
    });
  }
};