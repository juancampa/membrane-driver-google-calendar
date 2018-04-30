import {
  client,
  authorize,
  handleAuthorize,
  handleRedirect,
} from './client.js';

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
  async one({ args }) {
    return client.calendarList.get({ calendarId: args.id });
  },
  async page({ args }) {
    return await client.calendarList.list({ ...args });
  },
};

export let CalendarPage = {
  next({ self, source }) {
    if (source.nextPageToken === undefined) {
      return null;
    }
    const args = self.match(root.calendars.page());
    return root.calendars.page({ ...args, pageToken: source.nextPageToken });
  },
  items({ source }) {
    return source.items;
  },
};

export const Calendar = {
  self({ source }) {
    return root.calendars.one({ id: source.id });
  },
  events() {
    // HACK. Should we replace these type of hacks with a special type of
    // fields? e.g "namespace"
    return {};
  },
};

export let Reminder = {
  self({ source }) {
    // TODO
    return null;
  },
};

export const EventCollection = {
  async one({ args, self }) {
    const { id: calendarId } = self.match(root.calendars.one());
    return await client.events.get({ calendarId, eventId: args.id });
  },
  async page({ args, self }) {
    const { id } = self.match(root.calendars.one());
    return client.events.list({ calendarId: id, ...args });
  },
};

export let EventPage = {
  next({ self, source }) {
    if (source.nextPageToken === undefined) {
      return null;
    }
    const { id: calendarId } = self.match(root.calendars.one());
    const args = self.match(root.calendars.one().events().page());
    return root.calendars.one({ id: calendarId }).events().page({ ...args, pageToken: source.nextPageToken });
  },
  items({ source }) {
    return source.items;
  },
};

export const Event = {
  self({ source, self, parent }) {
    return self || parent.ref.pop().one({ id: source.id });
  },
  instance() {
    return {};
  },
};

export const EventInstanceCollection = {
  async many({ self }) {
    const { id: calendarId } = self.match(root.calendars.one());
    const { id: eventId } = self.match(
      root.calendars.one().event().one()
    );
    const result = await client.events.instances({ calendarId, eventId });
    return result && result.items;
  },
  async one({ args, self }) {
    const { id: calendarId } = self.match(root.calendars.one());
    return client.events.get({ calendarId, eventId: args.id });
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

    const resource = { [propName]: { [args.fieldName]: args.value } };
    const result = await client.events.patch({ calendarId, eventId, resource });
    return result;
  },
};
