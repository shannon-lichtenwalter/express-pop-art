require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
//const validateBearerToken = require('./middleware/bearer-token-auth');
const eventsRouter = require('./events/events-router');
const usersRouter = require('./users/users-router');
const app = express();
const authRouter = require('./auth/auth-router');
const requestorsRouter = require('./requestors/requestors-router');

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
//app.use(validateBearerToken);

app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/requests', requestorsRouter);

app.use(function errorHandler(error, req, res, next ){
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message : 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error }
  }
  res.status(500).json(response);
});

module.exports = app;