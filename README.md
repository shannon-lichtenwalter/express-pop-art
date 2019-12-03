## Pop Art Server and Database
<img src='./screenshots/logo.png' height='200' width='300'/>
<br>
See It Live: https://pop-art.now.sh/
<br>
Created by Shannon Lichtenwalter

#### This server and database are intended to be used strictly with the Pop Art React front-end client only

### What is Pop Art?
Pop are is an interactive application that was created to make booking talented artists for events easier and simplified. Event hosts are able to create event pages which serve a dual purpose of: 
1. Advertising the local event to the community
2. Making artists aware of opportunities for events that they could book. 

This application can be used by local bands, coffee shops, bars, artists, event hosts and creators of all types to help making booking easier for local artists. 

Without an account, a user can navigate to the website and browse upcoming events on the homepage. They can filter events by type, date, and location.

By creating an account, a user then has the ability to create events that they are hosting, or they can request to book events if they feel they would be a good fit for the event. 

By hosting an event, the user can specify how many artists they need for said event. The user will then receive requests from artists to book the event. The user can accept or deny the artist's request. 
<br>

### The API

This API was built using NodeJS and PostgreSQL. Most of the endpoints are protected with a JWT auth requirement with the exception of getting a list of upcoming events and for creating a new user.

### Endpoints

The following are the request endpoints for this server:::

Base URL= https://aqueous-retreat-24827.herokuapp.com/api

#### GET:
/events => unprotected endpoint. Will return all upcoming events from the database.

/events/:eventId => protected endpoint. Will return the single event that matches the eventId param.

/events/user-events => protected endpoint. Will return all of the events hosted by the currently logged in user. The currently logged in user is determined by the JWT auth that is sent with the request.

/users/current-user => protected endpoint. By requiring authorization for this endpoint, it will return the currently logged in user's username and id. 


/requests => protected endpoint. Will return all of the requests for the logged in user. This will be all of the events that they have requested to book as well as the booking status of pending, accepted, or denied.

#### POST: 
/auth/login => unprotected endpoint. Must send a username and password in the request body. This endpoint will check the username and password against the users table. If a correct username and password combination is supplied in the request body then a JWT auth token will be sent back from the API.

/events/user-events => protected endpoint. May send the data to create a new event in the system. The following fields may be sent: 
      name,
      date,
      time,
      location,
      city,
      state,
      slots_available(must be greater than or equal to 0),
      event_type (must be of type: 
        'Music Performance',
        'Art Show',
        'Dance Performance',
        'Book Signing',
        'Craft Fair',
        'Poetry Reading',
        'Fashion Show',
        'Other' )
      paid (true or false)
      description,
      additional_details,
      img_url,
      archived (true or false).
  Of note, the only required fields for creating a new event are name, date, time, location, and slots_available.

/users => unprotected endpoint. Must send a username and password in the request body. A new user will be created in the users table and the password will be hashed and protected. Errors will be sent back if the username has already been taken or if the password does not meet the criteria:
  -password must be between 8 and 72 characters
  -password must not start or end with spaces
  -Password must contain 1 upper case, lower case, number and special character.


/requests => protected endpoint. Must supply an event id in the request body as event_id. It will add a new request to the requestors table from the logged in user to book the event (based on the event_id sent). The request will automatically be given a booking_status of pending. 


#### PATCH:
/events => unprotected endpoint. Will archive any events that are from a past date.

/events/user-events => protected endpoint. Must send an event id as 'id' and an update to the slots_available for the event. At this time, this endpoint only supports sending slots_available: 'decrease' in the request body. By sending this the database will decrement the number of slots available for the event by one. This endpoint is to be used when a host accepts an artist for their event and needs the slots available to be decreased. 

/requests => protected endpoint. Must send 'event_id', 'user_id' and 'booking_status' in the request body. Booking status must be either 'Accepted' or 'Denied'. This will update the requestors table to reflect if the request has been Accepted or Denied. 


#### DELETE: 
/events/user-events => protected endpoint. must send an event id in the request body. The event will be deleted from the database and all requests will cascade delete from the requestors table. 

/users/current-user => protected endpoint. Will delete the currently logged in users from the users database. Will cascade delete their hosted events and any of their event requests.

