import datetime
import os.path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials

from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow, Flow
import src.lib.auth as Auth

app = FastAPI()

app.ServiceSecret = Auth.getServiceSecret('conf/oauth-web.json')
app.UserToken = Auth.getUserToken('conf/token.json')
Auth.init(app)

app.add_middleware(
  CORSMiddleware,
  allow_origins=['*']
)
