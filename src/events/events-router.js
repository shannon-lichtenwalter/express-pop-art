const express = require('express');
const eventsRouter = express.Router();
//const events = require('../../events.json');
const EventsService = require('./EventsService');
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const Treeize = require('treeize');

eventsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { city, event_type, date } = req.query;

    if (!city && !event_type && !date) {
      return EventsService.getAllEvents(knexInstance)
        .then(events => {
          return res.status(200).json(events);
        })
        .catch(next);
    }

    let query = { city, event_type, date };

    for (const [key, value] of Object.entries(query))
      if (!value)
        delete query[key];

    EventsService.getEventsByQuery(knexInstance, query)
      .then(events => {
        return res.status(200).json(events);
      })
      .catch(next);


  })
  .patch((req, res, next) => {
    const knexInstance = req.app.get('db');

    EventsService.archiveEvents(knexInstance)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

eventsRouter
  .route('/event/:eventId')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const event_id = req.params.eventId;

    EventsService.getEventById(knexInstance, event_id)
      .then(event => {
        if(event.length === 0){
          return res.status(404).json({error: 'Event Not Found'});
        }
        return res.status(200).json(event);
      })
      .catch(next);
  });

eventsRouter
  .route('/user-events')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user_id = req.user.id;

    EventsService.getAllEventsByUser(knexInstance, user_id)
      .then(result => {
        const userEvents = new Treeize();
        userEvents.grow(result);
        return res.status(200).json(userEvents.getData());
      })
      .catch(next);
  })
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

    EventsService.createEvent(knexInstance, newEvent)
      .then(event => {
        event.username = req.user.username;
        return res.status(201).json(event);
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { id, slots_available } = req.body;

    if (slots_available === 'decrease') {
      EventsService.updateSlotsAvailable(knexInstance, id)
        .then(event => {
          return res.status(200).json(event);
        })
        .catch(next);
    } else {
      return res.status(404).json({ error: 'Not Found' });
    }
  })
  .delete(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const id = req.body.id;

    EventsService.deleteEvent(knexInstance, id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });



module.exports = eventsRouter;