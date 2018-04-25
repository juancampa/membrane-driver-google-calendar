import { client, authorize, handleAuthorize, handleRedirect } from './client.js';

const { root } = program.refs;

export async function init() {
  await root.calendars.set({});

  console.log('Please go to:', program.endpoints.auth.url);
  console.log('Redirect URL:', program.endpoints.redirect.url);
}

export async function endpoint({ name, req }) {
  switch (name) {
    case 'auth': {
      return await handleAuthorize(req);
    }
    case 'redirect': {
      return await handleRedirect(req);
    }
    default:
      throw new Error('Unknown endpoint');
  }
}

export const CalendarCollection = {
  all({ args }) {
    throw new Error('TODO: Jhonny');
  },

  async one({ args }) {
    const result = await client.calendars.get({ calendarId: args.id });
    return result;
  },
};

export const Calendar = {
  self({ source }) {
    return root.calendars.one({ id: source.id });
  },

  event() {
    // HACK. Should we replace these type of hacks with a special type of
    // fields? e.g "namespace"
    return {};
  }
};

export const EventCollection = {
  async many({ args, self }) {
    const { id } = self.match(root.calendars.one());
    const result = await client.events.list({ calendarId: id, maxResults: 1000 });
    return result && result.items;
  },

  async one({ args, self }) {
    const { id: calendarId } = self.match(root.calendars.one());
    const result = await client.events.get({ calendarId, eventId: args.id });
    return result;
  },
};

export const Event = {
  self({ source }) {
    throw new Error('TODO: Jhonny');
  },

  instance() {
    return {};
  },
};

export const EventInstanceCollection = {
  async many({ self }) {
    const { id: calendarId } = self.match(root.calendars.one());
    const { id: eventId } = self.match(root.calendars.one().event().one());
    const result = await client.events.instances({ calendarId, eventId });
    return result && result.items;
  },

  async one({ args, self }) {
    const { id: calendarId } = self.match(root.calendars.one());
    const result = await client.events.get({ calendarId, eventId: args.id });
    return result;
  },
};

export const EventTime = {
  async setValue({ args, self }) {
    // TODO: pattern match. Ref might be:
    // - :calendar.one.event.one
    // - :calendar.one.event.one.instance.one

    const { id: calendarId } = self.match(root.calendars.one());
    const { id: eventId } = self.match(root.calendars.one().event().one());
    
    const ref = self.ref;
    const propName = ref.path[ref.path.length - 1].name;

    const resource = { [propName] : { [args.fieldName]: args.value } };
    const result = await client.events.patch({ calendarId, eventId, resource });
    return result;
  }
};
