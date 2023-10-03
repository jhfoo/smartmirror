import fs from 'fs'
import { google } from 'googleapis'

let QueryCacheExpiry = 0
let QueryCacheData = null

export default defineEventHandler(async(event) => {
  // check if cache expired
  if (QueryCacheExpiry > 0 && QueryCacheExpiry > Math.floor(Date.now()/1000)) {
    console.log(`Cached response: ${QueryCacheExpiry} vs ${Math.floor(Date.now()/1000)}`)
    return QueryCacheData
  }

  const query = getQuery(event)
  const client = getGoogleClient()
  try {
    const calendar = google.calendar({
      version: 'v3',
      auth: client,
    })

    const now = new Date()
    // console.log(now.setDate(now.getDate() + 6).toISOString())

    const resp = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: new Date(now.setDate(now.getDate() + 6)).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    QueryCacheData = resp
    QueryCacheExpiry = Math.floor(Date.now()/1000) + 20

    return resp
  } catch (err) {
    console.error(err)
    return err
  }
})

function getGoogleClient() {
  const infile = JSON.parse(fs.readFileSync('./cred/smartmirror-web.json'))
  // console.log(infile)
  const client = new google.auth.OAuth2(
    infile.web.client_id,
    infile.web.client_secret,
    infile.web.redirect_uris[0],
  )

  client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.log(`Token refreshed: ${tokens}`)
      fs.writeFileSync('./cred/token.json', JSON.stringify(tokens, null, 2))
    }
  })

  const token = JSON.parse(fs.readFileSync('./cred/token.json'))
  client.setCredentials(token)
  return client
}

