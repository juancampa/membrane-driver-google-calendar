import { randomBytes } from 'crypto';
import { google } from 'googleapis';
import { promisify } from 'util';
import { parse as parseQuery } from 'querystring';
import { parse as parseUrl } from 'url';

let { CLIENT_ID, CLIENT_SECRET } = process.env;
let { url: redirectUrl } = program.endpoints.redirect;
if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Please provide CLIENT_ID and CLIENT_SECRET as environment variables');
}

if (!redirectUrl) {
  throw new Error('Failed to determine redirect URL');
}

export const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUrl);

const api = google.calendar({ version: 'v3', auth });
export const gmail = api;

export async function handleAuthorize() {
  // The oauth state field is used to retrieve this same account when the user
  // accepts the consent screen and it gets redirected to our redirect endpoint
  const authState = randomBytes(32).toString('hex');
  program.state.authState = authState;
  await program.save();

  // generate the url the user can use to authorize our client
  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    state: authState,
    scope: [ 'https://www.googleapis.com/auth/calendar' ]
  });

  const settingsUrl = `https://console.cloud.google.com/apis/credentials/oauthclient/${CLIENT_ID}`;
  return {
    body: `
      <html>
        <body>
          <div style="display: flex; justify-content: center, align-items: center; position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px;">
            <ol>
              <li>Copy this URL: <input value="${redirectUrl}" disabled></input>
              <li>Add it to <b>Authorized Redirect URIs</b> <a href="${settingsUrl}">here</a>
              <li><a href="${authUrl}">Authorize the driver to access your account</a></li>
            </ol>
          </div>
        </body>
      </html>
    `
  }
}

export async function handleAuth(req) {
  // The oauth state field is used to retrieve this same account when the user
  // accepts the consent screen and it gets redirected to our redirect endpoint
  const authState = randomBytes(32).toString('hex');
  program.state.authState = authState;
  await program.save();

  // generate the url the user can use to authorize our client
  const url = auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    state: authState,
    scope: [ 'https://www.googleapis.com/auth/calendar' ]
  });

  console.log('Please go to:', url);
}

const apiMethod = (self, functionName) => {
  return async (o) => {
    auth.setCredentials(program.state.tokens);

    const args = Object.assign({ auth }, o);

    const fn = promisify(self[functionName].bind(self));
    const result = await fn(args);
    return result.data;
  };
};

export const client = {
  calendarList: {
    list: apiMethod(api.calendarList, 'list'),
    get: apiMethod(api.calendarList, 'get'),
  },
  calendars: {
    get: apiMethod(api.calendars, 'get'),
  },
  events: {
    list: apiMethod(api.events, 'list'),
    get: apiMethod(api.events, 'get'),
    instances: apiMethod(api.events, 'instances'),
    patch: apiMethod(api.events, 'patch'),
  },
};

export async function handleRedirect({ url }) {
  const { code, state: authState } = parseQuery(parseUrl(url).query);
  if (!code || authState != program.state.authState) {
    throw new Error('Error while getting code from callback');
  }

  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);

  program.state.tokens = tokens;
  await program.save();
}
