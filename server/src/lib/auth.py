import http
import json
from fastapi import Request, Response
import requests
import urllib.parse

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as gRequest
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar']

def getServiceSecret(filepath):
  infile = open(filepath,'r')
  ret = json.loads(infile.read())
  print ('ServiceSecret: {}'.format(ret))
  infile.close()
  return ret

def getUserToken(filepath):
  return Credentials.from_authorized_user_file('conf/token.json', SCOPES)

def init(app):
  @app.get('/api/calendar/{CalendarId}/event/list')
  def getEvents(req: Request, CalendarId: str):
    service = build('calendar', 'v3', credentials = req.app.UserToken)
    LocalTimeZone = '-05:00'
    events = service.events().list(calendarId=CalendarId, timeMin='2022-09-12T00:00:00{}'.format(LocalTimeZone), timeMax='2022-09-18T23:59:59{}'.format(LocalTimeZone), pageToken=None).execute()
    return Response(content=json.dumps(events, indent=2), media_type='text/plain')
    return events

  @app.get('/api/calendar/list')
  def listCalendars(req: Request):
    service = build('calendar', 'v3', credentials = req.app.UserToken)
    list = service.calendarList().list().execute()
    return Response(content=json.dumps(list, indent=2), media_type='text/plain')

  @app.get('/auth/validate')
  def validateToken(req: Request):
    creds = req.app.UserToken
    if creds:
      if creds.valid:
        return 'OK'
      elif creds.expired and creds.refresh_token:
        print ('Refreshing user token...')
        creds.refresh(gRequest())
        print ('Saving token...')
        print ('New token: {}'.format(creds.to_json()))
        outfile = open('conf/token.json','w')
        outfile.write(creds.to_json())
        outfile.close()
        return "New token issued"
    
    return 'Bad token'

  @app.get('/auth/redirect')
  def getTokens(state: str, code: str, scope: str, req: Request):
    ServiceSecret = req.app.ServiceSecret
    agent = http.client.HTTPSConnection('oauth2.googleapis.com', 443)
    payload = {
      # 'code': '4/0AdQt8qjbVEPhAzq3MSXi-3r9d_vttBx8fE-71en3nQ3IMDg8Sfkv3TGnnj6u2EblaxfWkg',
      'code': code,
      'client_id': ServiceSecret['web']['client_id'],
      'client_secret': ServiceSecret['web']['client_secret'],
      'redirect_uri': 'https://smartmirror.kungfoo.info/auth/redirect',
      'grant_type': 'authorization_code'
    }
    print ('Payload: {}'.format(urllib.parse.urlencode(payload)))
    resp = requests.post('https://oauth2.googleapis.com/token', data=urllib.parse.urlencode(payload), headers = {
      'content-type': 'application/x-www-form-urlencoded'
    })
    print (resp.status_code)
    print (resp.text)
    if resp.status_code == 200:
      outfile = open('conf/token.json','w')
      outfile.write(resp.text)
      outfile.close()
