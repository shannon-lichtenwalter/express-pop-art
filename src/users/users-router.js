const express = require('express');
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const UsersService = require('./UsersService');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');


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

    const passwordError = UsersService.validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }
    UsersService.hasUserWithUserName(
      req.app.get('db'),
      username
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: 'Username already taken' });
        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            newUser.password = hashedPassword;

            return UsersService.createUser(
              knexInstance,
              newUser
            )
              .then(user => {
                return res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user));
              });
          });
      })
      .catch(next);
  });

usersRouter
  .route('/current-user')
  .all(requireAuth) //require auth will give us access to a logged in user as it sets the user on the request object
  .get((req, res) => {
    const currentuser = {
      username: req.user.username,
      id: req.user.id
    };
    return res.status(200).json(UsersService.serializeUser(currentuser));
  })
  .delete((req,res,next) => {
    const knexInstance = req.app.get('db');
    UsersService.deleteUser(knexInstance, req.user.id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;