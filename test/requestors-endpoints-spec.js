const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Requestors Endpoints', function () {
  let db;

  const {
    testUsers,
    testEvents,
    testRequestors,
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

  describe('/api/requests', () => {
    beforeEach('insert events', () =>
      helpers.seedRequestorsTable(
        db,
        testUsers,
        testEvents,
        testRequestors
      )
    );

    it('responds with the requestors list', function () {
      return supertest(app)
        .get('/api/requests')
        .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
        .expect(200)
        .then(res => {
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.have.property('id');
          expect(res.body[0].event_id).to.eql(testEvents[0].id);
          expect(res.body[0].user_id).to.eql(testRequestors[0].user_id);
        });
    });

    it('responds with the new request when added', function () {
      return supertest(app)
        .post('/api/requests')
        .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
        .send({event_id:1})
        .expect(201)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id');
          expect(res.body.event_id).to.eql(testEvents[0].id);
          expect(res.body.user_id).to.eql(testUsers[1].id);
          expect(res.body.booking_status).to.eql('Pending');
        });
    });


    it('responds with the new request when added', function () {
      return supertest(app)
        .patch('/api/requests')
        .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
        .send({event_id: 1, user_id:testUsers[1].id, booking_status:'Accepted'})
        .expect(200)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id');
          expect(res.body.event_id).to.eql(testEvents[0].id);
          expect(res.body.user_id).to.eql(testUsers[1].id);
          expect(res.body.booking_status).to.eql('Accepted');
        });
    });


  });
});