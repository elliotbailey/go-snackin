import locationTypes from '../api/location-types.json' with { type: "json" };

export function submitPreference(user_id, place, preference) {
    const name = place.displayName.text;
    const type = place.types;
    fetch('http://localhost:8001/submitPreference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user_id, place: name, place_type: type, preference: preference })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
        })
        .catch(err => console.log(err));
}

async function getUserPreferences(user_id) {
    try {
        const response = await fetch('http://localhost:8001/getUserPreferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id })
        });

        const data = await response.json();
        console.log(`User preferences: ${data.preferences}`)
        return data.preferences; // Return the fetched data
    } catch (err) {
        console.log(err);
        return []; 
    }
}

async function getAllUserPreferences(user_id) {
    try {
        const response = await fetch('http://localhost:8001/getAllUserPreferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id })
        });

        const data = await response.json();
        return data.userPreferences; // Return the fetched data
    } catch (err) {
        console.log(err);
        return []; 
    }
}

async function checkPlace(user_id, place_name) {
    try {
        const response = await fetch('http://localhost:8001/checkPlace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id, place: place_name })
        });

        const data = await response.json();
        return data.acceptable; // Return the fetched data
    } catch (err) {
        console.log(err);
        return []; 
    }
}


export async function constructPlaceScoreMap(user_id) {
    var placeScoreMap = {};
    const data = await getAllUserPreferences(user_id);
    for (const entry in data) {
        for (const typeIndex in data[entry].place_type.split(',')) {
            const type = data[entry].place_type.split(',')[typeIndex];
            // looping through each type in a historical preference
            let weighting = 0;
            if (locationTypes.cuisine_types.includes(type)) {
                weighting = data[entry].preference ? 4 : -1;
            } else if (locationTypes.venue_types_1.includes(type)) {
                weighting = data[entry].preference ? 4 : -2;
            } else if (locationTypes.venue_types_2.includes(type)) {
                weighting = data[entry].preference ? 5 : -3;
            }
            placeScoreMap[type] = (placeScoreMap[type] || 0) + weighting;
        }
    }
    console.log(placeScoreMap);
    return placeScoreMap;
}

export async function scorePlaceAppeal(user_id, place_name, place_types, user_prefs, score_map) {
    let score = 0;
    // include weighting for account preferences
    for (const p in user_prefs) {
        if (place_types.includes(user_prefs[p])) {
            score += 14;
        }
    }
    // use calculated weighting map to adjust based on historial feedback
    for (const type in place_types) {
        score += score_map[place_types[type]] || 0;
    }

    // add weighting for actual venue itself
    const checkPlaceAcceptability = await checkPlace(user_id, place_name);
    if (checkPlaceAcceptability !== undefined) {
        score += checkPlaceAcceptability ? 5 : -5;
    }

    return score;
}

export async function sortPlacesByAppeal(user_id, places) {
    // calculate scores for all places
    const preferences = await getUserPreferences(user_id);
    const placeScoreMap = await constructPlaceScoreMap(user_id);
    console.log(placeScoreMap);
    const placesWithScores = await Promise.all(
        places.map(async (place) => {
            const score = await scorePlaceAppeal(user_id, place.displayName.text, place.types, preferences, placeScoreMap);
            return { ...place, score };
        })
    );

    placesWithScores.sort((a, b) => b.score - a.score);

    return placesWithScores;
}