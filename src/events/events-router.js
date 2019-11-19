const express = require('express');
const eventsRouter = express.Router();
//const events = require('../../events.json');
const EventsService = require('./EventsService');
const jsonBodyParser = express.json();

eventsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');

    EventsService.getAllEvents(knexInstance)
      .then(events => {
        return res.status(200).json(events);
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req,res,next)=> {
    return res.status(200).json('hi');
  })


module.exports = eventsRouter;