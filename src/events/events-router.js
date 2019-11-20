const express = require('express');
const eventsRouter = express.Router();
//const events = require('../../events.json');
const EventsService = require('./EventsService');
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth.js');

eventsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');

    EventsService.getAllEvents(knexInstance)
      .then(events => {
        return res.status(200).json(events);
      })
      .catch(next);
  });

eventsRouter
  .route('/create')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const {
      name,
      date,
      time,
      location,
      city,
      state,
      slots_available,
      event_type,
      paid,
      description,
      additional_details,
      img_url,
      archived
    } = req.body;

    const newEvent = { name, date, time, location, slots_available };
    for (const [key, value] of Object.entries(newEvent))
      if (!value)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newEvent.host_id = req.user.id;
    newEvent.city = city;
    newEvent.state = state;
    newEvent.event_type = event_type;
    newEvent.paid = paid;
    newEvent.description = description;
    newEvent.additional_details = additional_details;
    newEvent.img_url = img_url;
    newEvent.archived = archived;
    res.status(200).json(newEvent);
    EventsService.createEvent(knexInstance, newEvent)
      .then(event => {
        event.username= req.user.username;
        return res.status(201).json(event);
      })
      .catch(next);
  });





module.exports = eventsRouter;