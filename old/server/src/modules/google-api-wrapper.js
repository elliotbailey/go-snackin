import baseURLs from '../assets/api/baseURLs.json' with { type: "json" };
import { isEmptyObject } from './js-tools.js';
import fs from 'fs';


export async function autocompleteLocation(input, countries = ['au']) {
    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY
    };

    const body = {
        input: input,
        includedRegionCodes: countries
    }

    const response = await fetch(baseURLs.MAPS_AUTOCOMPLETE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (isEmptyObject(data)) {
        return null;
    }

    // return data.suggestions[0].placePrediction.text.text; // returns name address
    return data.suggestions[0].placePrediction.placeId; // returns placeID
}


export async function convertPlaceIDToCoordinates(placeID) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeID}&key=${apiKey}`;

    const headers = {
        'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    });

    const data = await response.json();

    return {
        "latitude": data.results[0].geometry.location.lat,
        "longitude": data.results[0].geometry.location.lng
    };
}


export async function generateRoutePolyline(d, o = null, travelMode = 'DRIVE') {
    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    };

    // if (origin == null) {
    //     /// get current location somehow
    // }

    const body = {
        destination: {
            "location": {
                "latLng": {
                    "latitude": d.latitude,
                    "longitude": d.longitude
                }
            }
        },
        origin: {
            "location": {
                "latLng": {
                    "latitude": o.latitude,
                    "longitude": o.longitude
                }
            }
        },
        travelMode: travelMode
    }

    const response = await fetch(baseURLs.MAPS_ROUTES_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const data = await response.json();
    fs.writeFile('./src/reference/polylineExample.json', JSON.stringify(data), 'utf8', () => {});

    return data;
    
}