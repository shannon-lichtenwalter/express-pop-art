const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Things Endpoints', function () {
  let db;

  const {
    testUsers,
    testEvents,
  } = helpers.makeThingsFixtures();

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

  describe('GET /api/events', () => {
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

      it('responds with 200 and all of the things', () => {
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

    context('Given an XSS attack thing', () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousEvent,
        expectedEvent,
      } = helpers.makeMaliciousEvent(testUser);

      beforeEach('insert malicious thing', () => {
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

      


    });
  });


});