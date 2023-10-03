import fs from 'fs'
import { google } from 'googleapis'
// const {google} = require('googleapis');

export default defineEventHandler(async(event) => {
  const client = getGoogleClient()

  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/calendar'
  ];

  const url = client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    prompt: 'consent',
    // If you only need one scope you can pass it as a string
    scope: scopes
  });

  await sendRedirect(event, url, 302)
})

function getGoogleClient() {
  const infile = JSON.parse(fs.readFileSync('./cred/smartmirror-web.json'))
  console.log(infile)
  return new google.auth.OAuth2(
    infile.web.client_id,
    infile.web.client_secret,
    infile.web.redirect_uris[0],
  )
}

