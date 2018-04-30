const { environment, schema, endpoints } = program;

environment
  .add('CLIENT_ID', 'The API clientID')
  .add('CLIENT_SECRET', 'The API client secret')

endpoints
  .https('auth', 'Visit this endpoint to authorize access to your account', {response: true})
  .https('redirect', 'Set this URL in Google API Console for oauth redirect')

schema.type('Root').field('calendars', 'CalendarCollection')

schema.type('CalendarCollection')
  .computed('one', 'Calendar')
    .param('id', 'String')
  .computed('page', 'CalendarPage', 'All the calendars')
    .param('maxResults', 'Int', 'Maximum number of threads to return.')
    .param('minAcessRole','String','The minimum access role for the user in the returned entries.')
    .param('pageToken','String','Page token to retrieve a specific page of results in the list')
    .param('showDeleted','Boolean','Whether to include deleted calendar list entries in the result.')
    .param('showHidden', 'Boolean', 'Whether to show hidden entries.')

schema.type('CalendarPage')
  .computed('items', '[Calendar]')
  .computed('next', 'CalendarPage*')

schema.type('Calendar')
  .computed('self', 'Calendar*')
  .field('id', 'String')
  .field('kind', 'String')
  .field('etag', 'String')
  .field('summary', 'String')
  .field('description', 'String')
  .field('location', 'String')
  .field('timeZone', 'String')
  .field('summaryOverride', 'String')
  .field('colorId', 'String')
  .field('backgroundColor', 'String')
  .field('foregroundColor', 'String')
  .field('hidden', 'Boolean')
  .field('selected', 'Boolean')
  .field('primary', 'Boolean')
  .field('deleted', 'Boolean')
  .field('accessRole', 'String')
  .computed('events', 'EventCollection')
  .field('defaultReminders','[Reminder]')

schema.type('Reminder')
  .field('method', 'String')
  .field('minutes', 'Int')
  .computed('self', 'Reminder*')

schema.type('EventCollection')
  .computed('one', 'Event')
    .param('id', 'String')
  .computed('page', 'EventPage')
    .param('calendar', 'Calendar')
    .param('alwaysIncludeEmail', 'Boolean')
    .param('iCalUID', 'String')
    .param('maxAttendees', 'Int')
    .param('maxResults', 'Int')
    .param('orderBy', 'String')
    .param('pageToken', 'String')
    .param('privateExtendedProperty', 'String')
    .param('q', 'String')
    .param('showDeleted', 'Boolean')
    .param('showHiddenInvitations', 'Boolean')
    .param('singleEvents', 'Boolean')
    .param('timeMax', 'String')
    .param('timeMin', 'String')
    .param('timeZone', 'String')
    .param('updateMin', 'String')

schema.type('EventPage')
  .computed('items', '[Event]')
  .computed('next', 'EventPage*')

schema.type('Event')
  .computed('self', 'Event*')
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
