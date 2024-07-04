# go-snackin
DNUI Startup China Program project to create a powerful natural-language navigation tool with personalised recommendations.

## Backend Setup Guide
To use the Go Snackin' server application, you must include a `.env` file in the `backend-server` directory containing the following:

- `WIT_API_KEY` - an API key from wit.ai
- `GOOGLE_MAPS_API_KEY` - a Google Maps API key with Routes and Places (New) APIs enabled.
- `PORT` - the local port that the backend server will run on

## Running Go Snackin'
If running for the first time, navigate into each directory (`backend-server`, `database_server` and `app`) and execute `npm install` in each.

To run the application, you will need to start three programs.

- **Backend Server** - within the `backend-server` directory, execute `node main.js`
- **Database Server** - within the `database-server` directory, execute `node database.js`
- **Web App** - within the `app` directory, execute `npm run dev`

Once all three programs are running, access the link provided in the terminal when running the web app.