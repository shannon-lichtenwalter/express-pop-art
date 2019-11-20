const express = require('express');
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const UsersService = require('./UsersService');
const { requireAuth } = require('../middleware/jwt-auth');


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

usersRouter
  .route('/getLoggedInUser')
  .all(requireAuth) //require auth will give us access to a logged in user as it sets the user on the request object
  .get((req, res) => {
    console.log(req.user);
    const currentuser = {
      username: req.user.username,
      user_id: req.user.id
    };
    console.log(currentuser);
    return res.status(200).json(currentuser);
  });

module.exports = usersRouter;