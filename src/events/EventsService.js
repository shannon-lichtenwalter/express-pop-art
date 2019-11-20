

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
      .where({host_id: user_id})
      .whereNot({ archived: true })
      .select(
        'events.name',
        'events.id',
        'events.date',
        'events.time',
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

  archiveEvents(db) {
    const todaysDate = new Date().toLocaleString();
    return db('events')
      .where('date', '<', `${todaysDate}`)
      .update({archived: true});
  }


};

module.exports = EventsService;