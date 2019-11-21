const express = require('express');
const requestorsRouter = express.Router();
const { requireAuth } = require('../middleware/jwt-auth');
const jsonBodyParser = express.json();
const RequestorsService = require('./RequestorsService');

requestorsRouter
  .route('/')
  .all(requireAuth)
  .get((req,res,next)=> {
    const knexInstance = req.app.get('db');
    const user_id = req.user.id;
    RequestorsService.getAllRequests(knexInstance, user_id)
      .then(requests => {
        return res.status(200).json(requests);
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { event_id } = req.body;
    const newRequestor = { event_id };
    newRequestor.user_id = req.user.id;

    RequestorsService.addNewRequest(knexInstance, newRequestor)
      .then(request => {
        return res.status(201).json(request);
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req,res,next) => {
    const knexInstance = req.app.get('db');
    const { event_id, user_id, booking_status } = req.body;
    RequestorsService.updateRequest(
      knexInstance,
      event_id,
      user_id, 
      booking_status)
      .then(updatedRequest => {
        return res.status(200).json(updatedRequest);
      })
      .catch(next);
  });

module.exports = requestorsRouter;
