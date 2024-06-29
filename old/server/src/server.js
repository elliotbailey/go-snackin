import dotenv from 'dotenv';
import { autocompleteLocation, generateRoutePolyline, convertPlaceIDToCoordinates } from './modules/google-api-wrapper.js';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import pkg from '@googlemaps/js-api-loader';
const { Loader } = pkg;

const loader = new Loader({
  apiKey: "",
  version: "weekly",
  libraries: ["places"]
});

const mapOptions = {
  center: {
    lat: 0,
    lng: 0
  },
  zoom: 4
};

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Hello, world!' });
});

app.post('/api/post', (req, res) => {
  console.log(req.body.text)
  res.status(200).json({ message: req.body.text });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


// var placeID1 = "ChIJKdJhnLRmjzUR6eBKoLyfvhQ";//await autocompleteLocation('dnui', []);
// var placeID2 = "ChIJiXJA1phhjzURyCUL1uX896Q"; //await autocompleteLocation('Xinghai Square', []);
// console.log(placeID1);
// console.log(placeID2);
// // console.log(placeID); // ChIJKdJhnLRmjzUR6eBKoLyfvhQ
// var coord1 = { latitude: 38.889698, longitude: 121.53504 };//await convertPlaceIDToCoordinates(placeID1);
// var coord2 = { latitude: 38.876203, longitude: 121.588889 }; //await convertPlaceIDToCoordinates(placeID2);
// console.log(coord1);
// console.log(coord2);
// console.log(await generateRoutePolyline(coord1, coord2, 'DRIVE'));
// //await generateRoutePolyline('Sydney', 'Melbourne', 'DRIVE');
