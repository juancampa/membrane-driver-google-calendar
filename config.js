const { environment, schema, endpoints } = program;

environment
  .add('CLIENT_ID', 'The API clientID')
  .add('CLIENT_SECRET', 'The API client secret')

endpoints
  .https('auth', 'Visit this endpoint to authorize access to your account', { response: true })
  .https('redirect', 'Set this URL in Google API Console for oauth redirect')

schema.type('Root')
  .field('calendars', 'CalendarCollection')

schema.type('CalendarCollection')
  .computed('all', '[Calendar]')
  .computed('one', 'Calendar')
    .param('id', 'String')

schema.type('Calendar')
  .computed('self', 'Calendar*')
  .field('id', 'String')
  .field('summary', 'String')
  .computed('event', 'EventCollection')

schema.type('EventCollection')
  .computed('many', '[Event]')
    .param('calendar', 'Calendar')
  .computed('one', 'Event')
    .param('id', 'String')

schema.type('Event')
  .field('id', 'String')
  .field('summary', 'String')
  .field('end', 'EventTime')
  .field('start', 'EventTime')
  .field('recurrence', '[String]')
  .computed('instance', 'EventInstanceCollection')

schema.type('EventInstanceCollection')
  .computed('many', '[Event]')
  .computed('one', 'Event')
    .param('id', 'String')

// schema.type('EventRecurrence')
//   .

schema.type('EventTime')
  .field('date', 'String')
  .field('dateTime', 'String')
  .field('timeZone', 'String')
  // Standardize this so that we can send messages to the three scalars above
  // and this action should handle it. It would limit the possible values for
  // input fields. TODO: how to handle the fact that there are multiple types of
  // scalars. Should we have a Variant wrapper class that can be used to
  // represent any scalar?
  .action('setValue')
    .param('fieldName', 'String')
    .param('value', 'String')

