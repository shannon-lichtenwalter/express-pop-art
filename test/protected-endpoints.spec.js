const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected Endpoints', function () {
  let db;

  const {
    testEvents,
    testUsers,
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

  beforeEach('insert things', () =>
    helpers.seedEventsTable(
      db,
      testUsers,
      testEvents
    ));

  const protectedEndpoints = [
    {
      name: 'GET /api/events/event/:eventId',
      path: '/api/events/event/1',
      method: supertest(app).get
    },
    {
      name: 'GET /api/events/user-events',
      path: '/api/events/user-events',
      method: supertest(app).get
    },
    {
      name: 'POST /api/events/user-events',
      path: '/api/events/user-events',
      method: supertest(app).post
    },
    {
      name: 'PATCH /api/events/user-events',
      path: '/api/events/user-events',
      method: supertest(app).patch
    },
    {
      name: 'DELETE /api/events/user-events',
      path: '/api/events/user-events',
      method: supertest(app).delete
    },
    {
      name: 'GET /api/requests',
      path: '/api/requests',
      method: supertest(app).get
    },
    {
      name: 'POST /api/requests',
      path: '/api/requests',
      method: supertest(app).post
    },
    {
      name: 'PATCH /api/requests',
      path: '/api/requests',
      method: supertest(app).patch
    },
    {
      name: 'GET /api/users/current-user',
      path: '/api/users/current-user',
      method: supertest(app).get
    },
    {
      name: 'DELETE /api/users/current-user',
      path: '/api/users/current-user',
      method: supertest(app).delete
    },
  ];
  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('responds with 401 \'Missing basic token\' when no basic token', () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' });
      });
      it('responds 401 \'Unauthorized Request\' when invalid JWT secret', () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';

        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: 'Unauthorized Request' });
      });
      it('responds 401 Unauthorized Request when invalid sub in payload', () => {
        const invalidUser = { username: 'user-not-existy', id:1 };
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized Request' });
      });

    });
  });

});