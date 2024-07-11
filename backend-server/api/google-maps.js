import dotenv from 'dotenv';
import polyline from 'google-polyline';
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

export async function generateRoutePolyline(orig, dest, travelMode = 'DRIVE') {

    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    };

    const body = {
        destination: {
            "address": dest
        },
        origin: {
            "address": orig
        },
        travelMode: travelMode,
    }

    const response = await fetch(baseURLs.MAPS_ROUTES_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const data = await response.json();
    //fs.writeFile('./src/reference/polylineExample.json', JSON.stringify(data), 'utf8', () => {});
    console.log(data);
    try {
        return {
            duration: data.routes[0].duration,
            polyline: data.routes[0].polyline.encodedPolyline
        };
    } catch (err) {
        console.log(err);
        return null;
    }
    
}


export async function generateRoutePolylineWithWaypoints(orig, dest, travelMode = 'DRIVE', intermediates = []) {

    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    };

    const body = {
        destination: {
            "address": dest
        },
        origin: {
            "address": orig
        },
        travelMode: travelMode,
        intermediates: convertCoordsListToLocLatLng(intermediates)
    }

    const response = await fetch(baseURLs.MAPS_ROUTES_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log(JSON.stringify(data));
    return {
        duration: data.routes[0].duration,
        polyline: data.routes[0].polyline.encodedPolyline
    };
    
}

export async function searchNearby(location, activity) {

    // console.log(`Interpreting location: ${location.latitude}, ${location.longitude}`)

    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.photos'
    };

    const body = {
        maxResultCount: 20,
        includedTypes: convertActivityToMapsType(activity),
        locationRestriction: {
            circle: {
                center: {
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                radius: 1000
            }
        }
    }

    const response = await fetch(baseURLs.MAPS_SEARCH_NEARBY, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const data = await response.json();

    return data.places;
}

export async function getPlacePhoto(photoReference) {
    const placePhotoURL = `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=400&skipHttpRedirect=true&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(placePhotoURL, {
        method: 'GET'
    });

    const data = await response.json();
    console.log(data);

    return data.photoUri;
}

export function convertCoordinatesListToLatLng(array) {
    return array.map(coord => ({
        lat: coord[0],
        lng: coord[1]
    }));
}

export function convertCoordinatesToCoords(coords) {
    return {
        latitude: coords[0],
        longitude: coords[1]
    };
}

export function convertCoordsListToLocLatLng(array) {
    return array.map(coord => ({
        location: {
            latLng: {
                latitude: coord.latitude,
                longitude: coord.longitude
            }
        }
    }));
}

function convertActivityToMapsType(activity) {
    switch (activity) {
        case 'coffee_shop':
            return ['cafe', 'coffee_shop'];
        case 'general_food':
            return ['restaurant', 'cafe'];
        default:
            return activity;
    }
}

export function calculatePolylineBounds(poly) {
    const bounds = {
        northwest: {
            latitude: -Infinity,
            longitude: -Infinity
        },
        southeast: {
            latitude: Infinity,
            longitude: Infinity
        },
        hypotenuse: 0
    }
    const path = polyline.decode(poly);
    path.forEach(point => {
        if (point[0] > bounds.northwest.latitude) {
            bounds.northwest.latitude = point[0];
        }
        if (point[0] < bounds.southeast.latitude) {
            bounds.southeast.latitude = point[0];
        }
        if (point[1] > bounds.northwest.longitude) {
            bounds.northwest.longitude = point[1];
        }
        if (point[1] < bounds.southeast.longitude) {
            bounds.southeast.longitude = point[1];
        }
    });

    bounds.hypotenuse = Math.sqrt(
        Math.pow(bounds.northwest.latitude - bounds.southeast.latitude, 2) +
        Math.pow(bounds.northwest.longitude - bounds.southeast.longitude, 2)
    );
    return bounds;
}

export function formatSecondsToMins(input) {
    // input example '192s'
    const seconds = parseInt(input.slice(0, -1));
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}