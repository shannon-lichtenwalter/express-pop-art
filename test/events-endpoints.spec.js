const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Events Endpoints', function () {
  let db;

  const {
    testUsers,
    testEvents,
  } = helpers.makeEventsFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('/api/events', () => {
    context('Given no events', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/events')
          .expect(200, []);
      });
    });

    context('Given there are events in the database', () => {
      beforeEach('insert events', () =>
        helpers.seedEventsTable(
          db,
          testUsers,
          testEvents
        )
      );

      it('responds with 200 and all of the events', () => {
        const expectedEvents = testEvents.map(event =>
          helpers.makeExpectedEvent(
            testUsers,
            event
          )
        );
        return supertest(app)
          .get('/api/events')
          .expect(200, expectedEvents);
      });
    });

    context('Given an XSS attack event', () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousEvent,
        expectedEvent,
      } = helpers.makeMaliciousEvent(testUser);

      beforeEach('insert malicious event', () => {
        return helpers.seedMaliciousEvent(
          db,
          testUser,
          maliciousEvent
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/events')
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedEvent.name);
            expect(res.body[0].description).to.eql(expectedEvent.description);
          });
      });

      it('removes XSS attack content when a query is supplied', () => {
        return supertest(app)
          .get('/api/events?city=Denver')
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedEvent.name);
            expect(res.body[0].description).to.eql(expectedEvent.description);
          });
      });


      it('removes XSS attack content at event/:eventId', () => {
        const validUser = testUser;
        return supertest(app)
          .get(`/api/events/event/${expectedEvent.id}`)
          .set('authorization', helpers.makeAuthHeader(validUser))
          .expect(200)
          .expect(res => {
            expect((res.body[0]).name).to.eql(expectedEvent.name);
            expect((res.body[0]).description).to.eql(expectedEvent.description);
          });
      });

      it('removes XSS attack content at event/user-events when getting user hosted events', () => {
        const validUser = testUser;
        return supertest(app)
          .get('/api/events/user-events')
          .set('authorization', helpers.makeAuthHeader(validUser))
          .expect(200)
          .expect(res => {
            expect((res.body[0]).name).to.eql(expectedEvent.name);
          });
      });

      it('removes XSS attack content at event/user-events when creating new event', () => {
        const validUser = testUser;
        return supertest(app)
          .post('/api/events/user-events')
          .set('authorization', helpers.makeAuthHeader(validUser))
          .send(maliciousEvent)
          .expect(201)
          .expect(res => {
            expect(res.body.name).to.eql(expectedEvent.name);
            expect(res.body.description).to.eql(expectedEvent.description);
          });
      });

      it('removes XSS attack content at event/user-events when updating event and decrements slots_available by 1', () => {
        const validUser = testUser;
        return supertest(app)
          .patch('/api/events/user-events')
          .set('authorization', helpers.makeAuthHeader(validUser))
          .send({
            id: 911,
            slots_available: 'decrease'
          })
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedEvent.name);
            expect(res.body.description).to.eql(expectedEvent.description);
            expect(res.body.slots_available).to.eql(expectedEvent.slots_available - 1);
          });
      });
    });
  });

  describe('GET /api/events/event/:eventId', () => {
    const testUsers = helpers.makeUsersArray();
    context('Given no events', () => {
      beforeEach('insert Users only', () =>
        helpers.seedUsers(db, testUsers)
      );
      it('responds with 404', () => {
        const eventId = 123456;
        return supertest(app)
          .get(`/api/events/event/${eventId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: 'Event Not Found' });
      });


      it('creates new event', () => {

        const expectedEvent = helpers.makeExpectedEvent(
          testUsers,
          testEvents[0]
        );
        return supertest(app)
          .post('/api/events/user-events')
          .set('authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(testEvents[0])
          .expect(201, expectedEvent);
      });
    });
    context('Given there are events in the database', () => {
      beforeEach('insert events', () =>
        helpers.seedEventsTable(
          db,
          testUsers,
          testEvents
        )
      );

      it('responds with 200 and the specified event', () => {
        const eventId = 2;
        const expectedEvent = helpers.makeExpectedEvent(
          testUsers,
          testEvents[eventId - 1]
        );

        return supertest(app)
          .get(`/api/events/event/${eventId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [expectedEvent]);
      });
    });


  });
});