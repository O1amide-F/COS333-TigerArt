#!/usr/bin/env python

import os
import urllib.parse
import re
import requests
import flask
import dotenv
import msal

#-----------------------------------------------------------------------

dotenv.load_dotenv()
_SCOPE = os.environ['SCOPE']
_ENDPOINT = os.environ['ENDPOINT']
_AUTHORITY = os.environ['AUTHORITY']
_CLIENT_ID = os.environ['CLIENT_ID']
_CLIENT_SECRET = os.environ['CLIENT_SECRET']
_REDIRECT_URI = os.environ['REDIRECT_URI']

#-----------------------------------------------------------------------
# Authentication routes
#-----------------------------------------------------------------------

def init(app):

    app.add_url_rule('/login',  'login', login,
        methods=['GET'])
    app.add_url_rule('/getAToken', 'get_a_token', get_a_token,
        methods=['GET'])
    app.add_url_rule('/logoutapp', 'logoutapp', logoutapp,
        methods=['GET'])
    app.add_url_rule('/logoutentra', 'logoutentra', logoutentra,
        methods=['GET'])

#-----------------------------------------------------------------------

def login():

    # (1) The app redirects the browser to the authorization server.

    original_url = flask.request.args.get('originalurl', '/')
    #flask.session['original_url'] = original_url
    msal_client_app = msal.ConfidentialClientApplication(
        client_id=_CLIENT_ID,
        authority=_AUTHORITY,
        client_credential=_CLIENT_SECRET
    )
    auth_url = msal_client_app.get_authorization_request_url(
        scopes=[_SCOPE],
        redirect_uri=_REDIRECT_URI,
        prompt="select_account",
        state=original_url
    )
    return flask.redirect(auth_url)

#-----------------------------------------------------------------------
# (2) The authorization server redirects the browser to the login page.
# (3) The user logs in.
# (4) The authorization server redirects the browser to the callback
# endpoint, providing a single-use authorization code.
#-----------------------------------------------------------------------

def get_a_token():

    authorization_code = flask.request.args['code']

    # (5) The app sends the authorization code to the authorization
    # server. The authorization server sends an access token (and other
    # tokens) to the app.

    msal_client_app = msal.ConfidentialClientApplication(
        client_id=_CLIENT_ID,
        authority=_AUTHORITY,
        client_credential=_CLIENT_SECRET
    )
    tokens = msal_client_app.acquire_token_by_authorization_code(
        authorization_code,
        scopes=[_SCOPE],
        redirect_uri=_REDIRECT_URI
    )
    access_token = tokens.get('access_token', '')
    #claims = tokens.get('id_token_claims', {})

    # (6) The app uses the access token to fetch information about
    # the user.

    profile = requests.get(
        _ENDPOINT,
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=10
    )
    profile_dict = profile.json()    

    # (7) The app saves the username in the session, optionally saves
    # the userinfo in the database, and redirects the browser to the
    # original URL.

    user_principal_name = profile_dict.get('userPrincipalName')
    username = user_principal_name.split("@")[0].lower()
    flask.session['username'] = username
    flask.session['displayname'] = profile_dict.get('displayName', username)

    original_url = flask.request.args.get('state')
    return flask.redirect(original_url)

#-----------------------------------------------------------------------
# keep for now in case we need to use it
#-----------------------------------------------------------------------
def logoutapp():

    flask.session.clear()
    return flask.redirect('/')

#-----------------------------------------------------------------------

def logoutentra():

    logout_url = (_AUTHORITY
        + '/oauth2/v2.0/logout?post_logout_redirect_uri='
        + urllib.parse.quote(
            re.sub('logoutentra', 'logoutapp', flask.request.url)))

    return flask.redirect(logout_url)

#-----------------------------------------------------------------------
# Authentication functions
#-----------------------------------------------------------------------

def is_authenticated():

    return 'username' in flask.session

#-----------------------------------------------------------------------

def get_username():
    username = flask.session.get('username', '')
    displayname = flask.session.get('displayname', username)
    return flask.jsonify({"username": username, "displayName": displayname})

#-----------------------------------------------------------------------

# Authenticate the user. Do not return unless the user is
# successfully authenticated.

def authenticate():

    if 'username' not in flask.session:
        flask.abort(flask.redirect(
            '/login?originalurl=' + flask.request.url))
