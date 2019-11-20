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