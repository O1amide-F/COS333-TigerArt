# TigerArt

Technologies demonstrated: Python, Flask, JavaScript, AJAX, React, Webpack, Microsoft Entra ID authentication, PostgreSQL.

This is a one-server app. The React front end is built into `backend/static` and served by the Flask backend.

## Building and running on your local computer

- Create and activate a Python virtual environment. For example:

- Install the Python modules from the repository root.
  - `python -m pip install -r requirements.txt`

- Register your app (`http://localhost:5001`) with Microsoft Entra ID.
  - Browse to `https://entra.microsoft.com` and sign in with your Princeton account.
  - In the left panel, use the light gray panel for navigation. (Do not use the black icon button at the very top of that sidebar/panel.) In the light gray sidebar, click “Entra ID.”
  - Under "Entra ID", click on "App registrations".
  - Click on "+ New Registration".
  - For "Name" enter `TigerArt`.
  - For "Redirect URI" choose `Web` and enter `http://localhost:5001/getAToken`.
  - Click "Register".
  - Note the Application (client) ID.
  - Click on the link immediately next to "Client credentials".
  - Click on "+ New client secret".
  - For "Description" enter `Princeton COS 333: TigerArt`.
  - For "Expires" choose a helpful date (Recommended is choosing: 180 days/6 months)
  - Click "Add".
  - Note the client secret.

- Define the environment variables used by the backend. A `.env` file in `backend/` is the easiest way to do this.
  - these will be provided seperately

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
    - will be provided

- Register your Render app with Microsoft Entra ID.
  - Browse to `https://entra.microsoft.com`.
  - Follow the instructions above, except use the Render callback URL in the redirect URI:
    - `https://tigerart.onrender.com/getAToken`

- Browse to `https://tigerart.onrender.com`.

- Authenticate using Microsoft Entra ID.
