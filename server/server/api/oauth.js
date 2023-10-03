import fs from 'fs'
import { google } from 'googleapis'

export default defineEventHandler(async(event) => {
  const query = getQuery(event)
  const client = getGoogleClient()
  try {
    const { tokens } = await client.getToken(query.code)
    fs.writeFileSync('./cred/token.json', JSON.stringify(tokens, null, 2))
    console.log(tokens)
    return {
      scope: query.scope,
      code: query.code,
    }
  } catch (err) {
    return err
  }
})

function getGoogleClient() {
  const infile = JSON.parse(fs.readFileSync('./cred/smartmirror-web.json'))
  return new google.auth.OAuth2(
    infile.web.client_id,
    infile.web.client_secret,
    infile.web.redirect_uris[0],
  )
}

