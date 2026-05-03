# TigerArt

Technologies demonstrated: Python, Flask, JavaScript, AJAX, React, Webpack, Microsoft Entra ID authentication, PostgreSQL.

This is a one-server app. The React front end is built into `backend/static` and served by the Flask backend.

## Building and running on your local computer

- Create and activate a Python virtual environment. For example:

- Install the Python modules from the repository root.
  - `python -m pip install -r requirements.txt`

- Register your app (`http://localhost:5001`) with Microsoft Entra ID.
  - Browse to `https://entra.microsoft.com` and sign in with your Princeton account.
  - In the left panel, click on "Entra ID" to expand that item.
  - Under "Entra ID", click on "App registrations".
  - Click on "+ New Registration".
  - For "Name" enter `[UPDATE ACCORDING TO APP]`.
  - For "Redirect URI" choose `Web` and enter `http://localhost:5001/getAToken`.
  - Click "Register".
  - Note the Application (client) ID.
  - Click on the link immediately under "Client credentials".
  - Click on "+ New client secret".
  - For "Description" enter `Princeton COS 333: TigerArt`.
  - For "Expires" choose a helpful date
  - Click "Add".
  - Note the client secret.

- Define the environment variables used by the backend. A `.env` file in `backend/` is the easiest way to do this.
  - `APP_SECRET_KEY="[UPDATE ACCORDING TO APP]"`
  - `AUTHORITY="https://login.microsoftonline.com/2ff60116-7431-425d-b5af-077d7791bda4"`
  - `REDIRECT_URI="http://localhost:5001/getAToken"`
  - `CLIENT_ID="[UPDATE ACCORDING TO APP]"`
  - `CLIENT_SECRET="[UPDATE ACCORDING TO APP]"`
  - `SCOPE="User.Read"`
  - `ENDPOINT="https://graph.microsoft.com/v1.0/me"`
  - `DB_NAME="tigerart_db"`
  - `DB_USER="[UPDATE ACCORDING TO APP]"`
  - `DB_PASSWORD="[UPDATE ACCORDING TO APP]"`
  - `DB_HOST="localhost"`
  - `DB_PORT="5432"`

- Install the JavaScript modules.
  - `cd frontend`
  - `npm install`

- Build the React bundles for development. This writes the bundle into `backend/static`.
  - `npm run builddev`

- Build the React bundles for production when needed.
  - `npm run buildprod`

- Set up the database.
  - `createdb tigerart_db`
  - `cd backend`
  - `python setup_museum_db.py`
  - `python populate_db.py`
  - `python cloudinary_imgs_to_db.py`

- Run the server.
  - `cd backend`
  - `python server.py`

- Browse to `http://localhost:5001`.
  - You must use `localhost` as the host. Using the real IP address of your computer or `127.0.0.1` will not work.

- Authenticate using Microsoft Entra ID.

## Deploying, building, and running on Render

- Deploy the app to Render as a **Web Service**.
  - Provide this as the build command:
    - `cd frontend && npm install && npm run buildprod && cd .. && python -m pip install -r requirements.txt`

  - Provide this as the start command:
    - `gunicorn backend.server:app`

  - Define these environment variables:
    - `APP_SECRET_KEY="[UPDATE ACCORDING TO APP]"`
    - `AUTHORITY="https://login.microsoftonline.com/2ff60116-7431-425d-b5af-077d7791bda4"`
    - `REDIRECT_URI="https://[UPDATE ACCORDING TO APP].onrender.com/getAToken"`
    - `CLIENT_ID="[UPDATE ACCORDING TO APP]"`
    - `CLIENT_SECRET="[UPDATE ACCORDING TO APP]"`
    - `SCOPE="User.Read"`
    - `ENDPOINT="https://graph.microsoft.com/v1.0/me"`
    - `DB_NAME="[UPDATE ACCORDING TO APP]"`
    - `DB_USER="[UPDATE ACCORDING TO APP]"`
    - `DB_PASSWORD="[UPDATE ACCORDING TO APP]"`
    - `DB_HOST="[UPDATE ACCORDING TO APP]"`
    - `DB_PORT="[UPDATE ACCORDING TO APP]"`

- Register your Render app with Microsoft Entra ID.
  - Browse to `https://entra.microsoft.com`.
  - Follow the instructions above, except use the Render callback URL in the redirect URI:
    - `https://[UPDATE ACCORDING TO APP].onrender.com/getAToken`

- Browse to `https://[UPDATE ACCORDING TO APP].onrender.com`.

- Authenticate using Microsoft Entra ID.
