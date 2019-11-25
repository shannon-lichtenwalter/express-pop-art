const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      password: 'password'
    },
    {
      id: 2,
      username: 'test-user-2',
      password: 'password'
    },
    {
      id: 3,
      username: 'test-user-3',
      password: 'password'
    },
    {
      id: 4,
      username: 'test-user-4',
      password: 'password'
    },
    {
      id: 5,
      username: 'test-user-5',
      password: 'password'
    }
  ];
}

function makeEventsArray(users) {
  return [
    {
      id: 1,
      name: 'First test event!',
      date:'1/1/2020',
      time:'10:00:00',
      location:'test-venue',
      city:'test-city',
      state:'CO',
      slots_available: '2',
      host_id: users[0].id,
      event_type:'Music Performance',
      paid:'false',
      description: 'test event description',
      additional_details:'test event additional details',
      img_url: null,
      archived: false
    },
    {
      id: 2,
      name: 'First test event!',
      date:'1/1/2020',
      time:'10:00:00',
      location:'test-venue',
      city:'test-city',
      state:'CO',
      slots_available: '2',
      host_id: users[1].id,
      event_type:'Music Performance',
      paid:'false',
      description: 'test event description',
      additional_details:'test event additional details',
      img_url: null,
      archived: false
    },
    {
      id: 3,
      name: 'First test event!',
      date:'1/1/2020',
      time:'10:00:00',
      location:'test-venue',
      city:'test-city',
      state:'CO',
      slots_available: '2',
      host_id: users[2].id,
      event_type:'Music Performance',
      paid:'false',
      description: 'test event description',
      additional_details:'test event additional details',
      img_url: null,
      archived: false
    },
    {
      id: 4,
      name: 'First test event!',
      date:'1/1/2020',
      time:'10:00:00',
      location:'test-venue',
      city:'test-city',
      state:'CO',
      slots_available: '2',
      host_id: users[3].id,
      event_type:'Music Performance',
      paid:'false',
      description: 'test event description',
      additional_details:'test event additional details',
      img_url: null,
      archived: false
    },
  ];
}

function makeRequestorsArray(users, events) {
  return [
    {
      id:1,
      event_id: events[0].id,
      user_id: users[1].id,
      booking_status: 'Pending'
    },
    {
      id:2,
      event_id: events[1].id,
      user_id: users[2].id,
      booking_status: 'Pending'
    },
    {
      id:3,
      event_id: events[2].id,
      user_id: users[3].id,
      booking_status: 'Pending'
    },
    {
      id:4,
      event_id: events[3].id,
      user_id: users[4].id,
      booking_status: 'Pending'
    }
  ];
}

function makeThingsFixtures() {
  const testUsers = makeUsersArray()
  const testEvents = makeEventsArray(testUsers)
  const testRequestors = makeRequestorsArray(testUsers, testEvents)
  return { testUsers, testEvents, testRequestors }
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      requestors,
      events,
      users
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() =>
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      ))
}

function seedEventsTable(db, users, events) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('events').insert(events)
    await trx.raw(
      `SELECT setval('events_id_seq', ?)`,
      [events[events.length - 1].id],
    )
  })
}

function seedRequestorsTable(db, users, events, requestors) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await seedEventsTables(trx,events)
    await trx.into('requestors').insert(requestors)
    await trx.raw(
      `SELECT setval('events_id_seq', ?)`,
      [requestors[requestors.length - 1].id],
    )
  })
}



function makeAuthHeader(user, secret= process.env.JWT_SECRET) {
  const token = jwt.sign({user_id: user.id}, secret,{
    subject: user.user_name,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeEventsArray,
  //makeExpectedThing,
  //makeExpectedThingReviews,
  //makeMaliciousThing,
  makeRequestorsArray,
  makeAuthHeader,

  makeThingsFixtures,
  cleanTables,
  seedEventsTable,
  seedRequestorsTable,
  seedUsers,
  //seedMaliciousThing,
}
