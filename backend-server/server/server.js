import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import polyline from 'google-polyline';

import { processInput } from '../api/natural-language.js';
import { generateRoutePolyline, generateRoutePolylineWithWaypoints, searchNearby,
    convertCoordinatesToCoords, getPlacePhoto, formatSecondsToMins } from '../api/google-maps.js';
import { submitPreference } from './preferences.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startServer() {

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '..')));

    app.listen(process.env.PORT, '0.0.0.0', () => {
        console.log(`Go Snackin' Express server running on port ${process.env.PORT}`);
    });

    app.post('/api/nlp', async (req, res) => {
        // curl -i -X POST -H 'Content-Type: application/json' -d '{"input":"Lets go from Sydney to Melbourne and grab a beer"}' localhost:3000/api/nlp
        res.status(200).json({ "output": await processInput(req.body.input) });
    });

    app.post('/api/decode', (req, res) => {
        const decoded = polyline.decode(req.body.input);
        res.status(200).json({ "output": decoded });
    });

    app.post('/api/polyline', async (req, res) => {
        const naturalOutput = await processInput(req.body.input);
        const result = await generateRoutePolyline(
            naturalOutput.locations.origin,
            naturalOutput.locations.destination
        );
        res.status(200).json({ "polyline": result });
    });

    app.post('/api/nearby', async (req, res) => {
        // includes fields for location, type
        const result = await searchNearby(req.body.location, req.body.included);
        res.status(200).json({ "output": result });
    });

    // FORMAT
    // user_id: {
    //     suggestedPlaces: []
    //     routeCount: 0
    //     origin: ""
    //     destination: ""
    // }
    var cachedRouteData = {};

    app.post('/api/generateRoute', async (req, res) => {
        const { input, user_id } = req.body;
        // Natural language processing to extract origin, destination and stop activity type
        const naturalOutput = await processInput(input);
        const { origin, destination } = naturalOutput.locations;
        const { activity } = naturalOutput;
        console.log(`Origin: ${origin}, Destination: ${destination}, Activity: ${activity}`)
        // Generate initial route for reference
        const routeGen = await generateRoutePolyline(origin, destination);
        // Decode reference into coordinates array
        const routeCoords = polyline.decode(routeGen.polyline);
        const midway = Math.floor(routeCoords.length / 2);
        // Search around navigational centre of route for target activity
        const nearby = await searchNearby(convertCoordinatesToCoords(routeCoords[midway]), activity);
        // Cache found places as follow up suggestions
        cachedRouteData[user_id] = {
            origin: origin,
            destination: destination,
            suggestedPlaces: nearby,
            routeCount: 0
        };
        const photoURL = await getPlacePhoto(nearby[0].photos[0].name);
        const newPoly = await generateRoutePolylineWithWaypoints(
            origin,
            destination,
            'DRIVE',
            [nearby[0].location]
        );
        // Return initial route with stop suggestion
        res.status(200).json({
            stop: {
                location: nearby[0].location,
                name: nearby[0].displayName.text,
                address: nearby[0].formattedAddress
            },
            origin: {
                location: convertCoordinatesToCoords(routeCoords[0]),
                name: origin
            },
            destination: {
                location: convertCoordinatesToCoords(routeCoords[routeCoords.length - 1]),
                name: destination
            },
            "polyline": newPoly.polyline,
            "duration": formatSecondsToMins(newPoly.duration),
            "photo": photoURL
        });
    });

    app.post('/api/suggestNewRoute', async (req, res) => {
        const { user_id } = req.body;
        // update user preferences to show place was rejected
        submitPreference(
            user_id,
            cachedRouteData[user_id].suggestedPlaces[cachedRouteData[user_id].routeCount],
            false
        );
        // Move to next suggested place and plan route
        cachedRouteData[user_id].routeCount++;
        const { origin, destination, routeCount } = cachedRouteData[user_id];
        const stopPlace = cachedRouteData[user_id].suggestedPlaces[routeCount];
        const photoURL = await getPlacePhoto(stopPlace.photos[0].name);
        const newPoly = await generateRoutePolylineWithWaypoints(
            origin,
            destination,
            'DRIVE',
            [stopPlace.location]
        );
        const routeCoords = polyline.decode(newPoly.polyline);
        console.log(`Follow up place: ${JSON.stringify(
            cachedRouteData[user_id]
            .suggestedPlaces[cachedRouteData[user_id].routeCount]
            .displayName
            .text
        )}`);
        // Return follow up route with stop suggestion
        res.status(200).json({
            stop: {
                location: stopPlace.location,
                name: stopPlace.displayName.text,
                address: stopPlace.formattedAddress
            },
            origin: {
                location: convertCoordinatesToCoords(routeCoords[0]),
                name: origin
            },
            destination: {
                location: convertCoordinatesToCoords(routeCoords[routeCoords.length - 1]),
                name: destination
            },
            "polyline": newPoly.polyline,
            "duration": formatSecondsToMins(newPoly.duration),
            "photo": photoURL
        });
    });

    app.post('/rejectRoute', async (req, res) => {

    });

    app.post('/api/acceptRoute', async (req, res) => {
        const { user_id } = req.body;
        submitPreference(
            user_id,
            cachedRouteData[user_id].suggestedPlaces[cachedRouteData[user_id].routeCount],
            true
        );
        res.status(200).json({ "message": "Route accepted" });
    });

    app.get('/test', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

}
