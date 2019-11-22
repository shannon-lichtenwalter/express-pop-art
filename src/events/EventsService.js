

const EventsService = {

  getAllEvents(db) {
    return db
      .from('events')
      .whereNot({ archived: true })
      .select('events.*', 'users.username')
      .join(
        'users',
        'users.id',
        'events.host_id'
      )
      .orderBy(['date', 'time'], 'asc');
  },

  getAllEventsByUser(db, user_id) {
    return db
      .from('events')
      .where({ host_id: user_id })
      .whereNot({ archived: true })
      .select(
        'events.name',
        'events.id',
        'events.date',
        'events.time',
        'events.slots_available',
        'requestors.user_id as requestors:user_id',
        'requestors.booking_status as requestors:booking_status',
        'users.username as requestors:username'
      )
      .leftJoin(
        'requestors',
        'requestors.event_id',
        'events.id')
      .leftJoin(
        'users',
        'users.id',
        'requestors.user_id'
      )
      .orderBy(['events.date', 'events.time'], 'asc');
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

  archiveEvents(db) {
    const todaysDate = new Date().toLocaleString();
    return db('events')
      .where('date', '<', `${todaysDate}`)
      .update({ archived: true });
  },

  updateSlotsAvailable(db, id) {
    return db('events')
      .where({ id })
      .decrement('slots_available', 1)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  deleteEvent(db, event_id){
    return db('events')
      .where({id: event_id})
      .delete();
  },

};

module.exports = EventsService;