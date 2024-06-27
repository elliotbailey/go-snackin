import baseURLs from '../assets/api/baseURLs.json' with { type: "json" };
import { isEmptyObject } from './js-tools.js';


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

    return data.suggestions[0].placePrediction.text.text;
}