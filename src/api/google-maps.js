import dotenv from 'dotenv';
import { isEmptyObject } from '../tools/js-tools.js';
import baseURLs from './baseURLs.json' with { type: "json" };
dotenv.config();

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

    return data.suggestions[0].placePrediction.text.text; // returns name address
    // return data.suggestions[0].placePrediction.placeId; // returns placeID
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
            "address": 
            // "location": {
            //     "latLng": {
            //         "latitude": d.latitude,
            //         "longitude": d.longitude
            //     }
            // }
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