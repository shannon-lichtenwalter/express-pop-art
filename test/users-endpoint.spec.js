const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const bcrypt = require('bcryptjs');

describe('Users Endpoints', function () {
  let db;

  const { testUsers } = helpers.makeThingsFixtures();
  const testUser = testUsers[0];

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

  describe('POST /api/users', () => {
    context('User validation', () => {
      beforeEach('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });
      const requiredFields = ['username', 'password'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test-username',
          password: 'test password',
        };

        it(`responds with 400 required error when '${field}' missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });

      it('responds with 400 Password must be longer than 8 characters when short password supplied', () => {
        const userShortPassword = {
          username: 'test-username',
          password: '1234567',
        };
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, {
            error: 'Password must be longer than 8 characters'
          });
      });

      it('responds with 400 Password must be shorter than 72 characters when long password supplied', () => {
        const userLongPassword = {
          username: 'test-user-name',
          password: '*'.repeat(73),
        };
        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, {
            error: 'Password must be shorter than 72 characters'
          });
      });

      it('responds with 400 Password must not start with spaces', () => {
        const userSpacesPassword = {
          username: 'test-user-name',
          password: ' 12345678'
        };
        return supertest(app)
          .post('/api/users')
          .send(userSpacesPassword)
          .expect(400, {
            error: 'Password must not start or end with spaces'
          });
      });

      it('responds with 400 Password must not end with spaces', () => {
        const userSpacesPassword = {
          username: 'test-user-name',
          password: '12345678 '
        };
        return supertest(app)
          .post('/api/users')
          .send(userSpacesPassword)
          .expect(400, {
            error: 'Password must not start or end with spaces'
          });
      });

      it('responds with 400 Password must be complex', () => {
        const userSimplePassword = {
          username: 'test-user-name',
          password: 'password',
        };
        return supertest(app)
          .post('/api/users')
          .send(userSimplePassword)
          .expect(400, {
            error: 'Password must contain 1 upper case, lower case, number and special character'
          });
      });


      it('responds 400 username already taken', () => {
        const duplicateUser = {
          username: testUser.username,
          password: 'passwordP4!'
        };
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, {
            error: 'Username already taken'
          });
      });

      context('Happy path', () => {
        it('responds 201, serialized user, storing bcryped password', () => {
          const newUser = {
            username: 'test user_name',
            password: '11AAaa!!'
          };
          return supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect(res => {
              expect(res.body.username).to.eql(newUser.username);
              expect(res.body).to.not.have.property('password');
              expect(res.headers.location).to.equal(`/api/users/${res.body.user_id}`);
            })
            .expect(res =>
              db
                .from('users')
                .select('*')
                .where({ id: res.body.user_id})
                .first()
                .then(row => {
                  expect(row.username).to.eql(newUser.username);

                  return bcrypt.compare(newUser.password, row.password);
                })
                .then(compareMatch => {
                  expect(compareMatch).to.be.true;
                })
            );
        });
      });



    });
  });
});