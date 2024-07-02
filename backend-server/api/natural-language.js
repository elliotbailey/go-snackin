import dotenv from 'dotenv';
import { autocompleteLocation } from './google-maps.js';
import locationTypes from './location-types.json' with { type: "json" };
import baseURLs from './baseURLs.json' with { type: "json" };
dotenv.config();

export async function processInput(input) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WIT_API_KEY}`
    };

    const response = await fetch(`${baseURLs.WIT_URL}${input}`, {
        headers: headers
    });

    const data = await response.json();

    const output = {
        activity: classifyActivity(data),
        locations: await extractAndCompleteLocations(data)
    }

    return output;
}

function classifyActivity(data) {
    for (const loc in locationTypes.types) {
        if (data.entities["food_or_drink:" + locationTypes.types[loc]] !== undefined) {
            return data.entities["food_or_drink:" + locationTypes.types[loc]][0]["role"];
        }
    }
}

async function extractAndCompleteLocations(data) {
    const locations = {
        origin: null,
        destination: null
    };

    var orig = data.entities['wit$location:origin'];
    var dest = data.entities['wit$location:destination'];

    if (dest !== undefined && orig !== undefined) {
        locations.origin = dest[0].body;
        locations.destination = orig[0].body;
    } else if (dest !== undefined && dest.length == 1) {
        locations.destination = dest[0].body;
    } else if (orig !== undefined && orig.length == 1) {
        locations.origin = orig[0].body;
    } else if (orig !== undefined && orig.length > 1) {
        locations.origin = orig[0].body;
        locations.destination = orig[1].body;
    } else if (dest !== undefined && dest.length > 1) {
        locations.origin = dest[0].body;
        locations.destination = dest[1].body;
    }

    if (locations.origin !== null) {
        locations.origin = await autocompleteLocation(locations.origin);
    }

    if (locations.destination !== null) {
        locations.destination = await autocompleteLocation(locations.destination);
    }

    return locations;
}