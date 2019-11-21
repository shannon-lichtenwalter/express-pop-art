
const RequestorsService = {

  getAllRequests(db, user_id) {
    return db('requestors')
      .select('requestors.*', 'events.name', 'events.date', 'events.time')
      .where({ user_id })
      .join(
        'events',
        'requestors.event_id',
        'events.id')
      .orderBy(['events.date', 'events.time'], 'asc');
  },


  addNewRequest(db, newRequestor) {
    return db
      .into('requestors')
      .insert(newRequestor)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  updateRequest(db, event_id, user_id, booking_status) {
    return db('requestors')
      .where({
        event_id,
        user_id
      })
      .update({ booking_status })
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

};

module.exports = RequestorsService;