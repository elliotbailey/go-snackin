
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

export function rankPlacesByPreference(places) {
    
    return rankedPlaces;
}