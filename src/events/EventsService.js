const EventsService = {

  getAllEvents(db) {
    return db
      .from('events')
      .select('events.*', 'users.username')
      .join(
        'users',
        'users.id',
        'events.host_id'
      );
  },

  createEvent(db, newEvent) {
    return db
      .insert(newEvent)
      .into('events')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },


};

module.exports = EventsService;