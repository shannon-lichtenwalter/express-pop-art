const express = require('express');
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const UsersService = require('./UsersService');


usersRouter
  .route('/')
  .post(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { username, password } = req.body;
    const newUser = { username, password };

    for (const [key, value] of Object.entries(newUser))
      if (!value) {
        return res.status(400).json({ error: `Missing '${key}' in request body` });
      }

    UsersService.createUser(knexInstance, newUser)
      .then(user => {
        return res.status(201).json(user);
      });

  });

module.exports = usersRouter;