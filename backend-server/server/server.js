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
import { submitPreference, sortPlacesByAppeal, scorePlaceAppeal } from './preferences.js';

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
        try {
            const { input, user_id } = req.body;
            // Natural language processing to extract origin, destination and stop activity type
            const naturalOutput = await processInput(input);
            const { origin, destination } = naturalOutput.locations;
            const { activity } = naturalOutput;
            console.log(`Origin: ${origin}, Destination: ${destination}, Activity: ${activity}`)
            // Generate initial route for reference
            const routeGen = await generateRoutePolyline(origin, destination);
            if (routeGen == null) {
                res.status(404).json({ "message": "No route found" });
                return;
            }
            // Decode reference into coordinates array
            const routeCoords = polyline.decode(routeGen.polyline);
            const midway = Math.floor(routeCoords.length / 2);
            // Search around navigational centre of route for target activity
            const unsortedNearbySearch = await searchNearby(convertCoordinatesToCoords(routeCoords[midway]), activity);
            if ((unsortedNearbySearch ?? []).length === 0) {
                res.status(404).json({ "message": "No nearby places found" });
                return;
            }
            const nearby = await sortPlacesByAppeal(user_id, unsortedNearbySearch);
            // Cache found places as follow up suggestions
            cachedRouteData[user_id] = {
                origin: origin,
                destination: destination,
                suggestedPlaces: nearby,
                routeCount: 0
            };
            const stopPlace = cachedRouteData[user_id].suggestedPlaces[0];
            let photoURL = '';
            if (stopPlace.photos && stopPlace.photos[0]) {
                photoURL = await getPlacePhoto(stopPlace.photos[0].name);
            } else {
                photoURL = 'https://cdn.vox-cdn.com/thumbor/5d_RtADj8ncnVqh-afV3mU-XQv0=/0x0:1600x1067/1200x900/filters:focal(672x406:928x662)/cdn.vox-cdn.com/uploads/chorus_image/image/57698831/51951042270_78ea1e8590_h.7.jpg';
            }
            const newPoly = await generateRoutePolylineWithWaypoints(
                origin,
                destination,
                'DRIVE',
                [nearby[0].location]
            );
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
        } catch (err) {
            console.log(err);
            res.status(404).json({ "message": "No nearby places found" });
            return;
        }
    });

    app.post('/api/suggestNewRoute', async (req, res) => {
        try {
            const { user_id } = req.body;
            // update user preferences to show place was rejected
            submitPreference(
                user_id,
                cachedRouteData[user_id].suggestedPlaces[cachedRouteData[user_id].routeCount],
                false
            );
            // Move to next suggested place and plan route
            cachedRouteData[user_id].routeCount++;
            if (cachedRouteData[user_id].routeCount >= cachedRouteData[user_id].suggestedPlaces.length) {
                res.status(404).json({ "message": "No more places to suggest" });
                return;
            }
            const { origin, destination, routeCount } = cachedRouteData[user_id];
            const stopPlace = cachedRouteData[user_id].suggestedPlaces[routeCount];
            let photoURL = '';
            if (stopPlace.photos && stopPlace.photos[0]) {
                photoURL = await getPlacePhoto(stopPlace.photos[0].name);
            } else {
                photoURL = 'https://cdn.vox-cdn.com/thumbor/5d_RtADj8ncnVqh-afV3mU-XQv0=/0x0:1600x1067/1200x900/filters:focal(672x406:928x662)/cdn.vox-cdn.com/uploads/chorus_image/image/57698831/51951042270_78ea1e8590_h.7.jpg';
            }
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
        } catch (err) {
            console.log(err);
            res.status(404).json({ "message": "No more places to suggest" });
            return;
        }
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

    app.post('/api/sortCached', async (req, res) => {
        const { user_id } = req.body;
        const before = cachedRouteData[user_id].suggestedPlaces.map((place) => place.displayName.text);

        console.log(before);
        const result = await sortPlacesByAppeal(user_id, cachedRouteData[user_id].suggestedPlaces);
        const names = result.map((place) => place.displayName.text);
        console.log(names);
        res.status(200).json(names);
    });

    app.get('/test', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

}
