require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const events = require('../events.json');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

function validateBearerToken(req,res,next){
  const auth = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;
  if(!auth || auth.split(' ')[1] !== apiToken){
    return res.status(401).json({error: 'Unauthorized request'});
  }
  next();
}

app.get('/api/events', (req,res,next) => {
  return res.status(200).json(events);
});

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