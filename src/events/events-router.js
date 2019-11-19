const express = require('express');
const eventsRouter = express.Router();
const events = require('../../events.json');
const EventsService = require('./EventsService');

eventsRouter
  .route('/')
  .get((req, res, next) => {
    return res.status(200).json(events);
  });


module.exports = eventsRouter;