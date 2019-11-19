const EventsService = {

  getAllEvents(db) {
    return db
      .from('events')
      .select('*');
  }
};

module.exports = EventsService;