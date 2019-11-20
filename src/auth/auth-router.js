const express = require('express');
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require('./auth-service');

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { username, password } = req.body;
    const loginUser = { username, password };
    console.log(password);

    for (const [key, value] of Object.entries(loginUser))
      if (!value) {
        return res.status(400).json({ error: `Missing ${key} in request body` });
      }

    AuthService.getUserWithUserName(knexInstance, loginUser.username)
      .then(user => {
        console.log(user);
        if (!user) {
          return res.status(400).json({ error: 'Incorrect username or password' });
        } 
        AuthService.comparePasswords(loginUser.password, user.password)
          .then(passwordsMatch => {
            if (!passwordsMatch) {
              return res.status(400).json({ error: 'Incorrect username or password' });
            }
            const sub = user.username;
            const payload = { user_id: user.id };

            res.send({
              authToken: AuthService.createJwt(sub, payload)
            });
          });
      })
      .catch(next);
  });

module.exports = authRouter;