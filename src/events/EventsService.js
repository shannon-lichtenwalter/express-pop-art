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
  }
};

module.exports = EventsService;