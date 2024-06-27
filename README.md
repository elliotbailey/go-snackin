# go-snackin
DNUI Startup China Program project to create a powerful natural-language navigation tool with personalised recommendations.

## Server Setup Guide
To use the Go Snackin' server application, you must include a `.env` file in the `server` directory containing the following:

- `WIT_API_KEY` - an API key from wit.ai
- `GOOGLE_MAPS_API_KEY` - a Google Maps API key with Routes and Places (New) APIs enabled.

To run the server application, execute `node server.js` with the `server` directory as root.