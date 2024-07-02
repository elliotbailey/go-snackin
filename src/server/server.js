import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import polyline from 'google-polyline';

import { processInput } from '../api/natural-language.js';
import { generateRoutePolyline, generateRoutePolylineWithWaypoints, searchNearby,
    convertCoordinatesToCoords } from '../api/google-maps.js';

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

    app.post('/api/generateRoute', async (req, res) => {
        const naturalOutput = await processInput(req.body.input);
        const origin = naturalOutput.locations.origin;
        const destination = naturalOutput.locations.destination;
        const activity = naturalOutput.activity;
        console.log(`Origin: ${origin}, Destination: ${destination}, Activity: ${activity}`)
        const routeCoords = polyline.decode(await generateRoutePolyline(origin, destination));
        const midway = Math.floor(routeCoords.length / 2);
        const nearby = await searchNearby(convertCoordinatesToCoords(routeCoords[midway]), activity);
        const newPoly = await generateRoutePolylineWithWaypoints(origin, destination, 'DRIVE', [nearby.location]);
        res.status(200).json({ 
            stopLocation: nearby.location,
            stopName: nearby.displayName.text,
            stopAddress: nearby.formattedAddress,
            "polyline": newPoly 
        });
    });

    app.get('/test', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

}
