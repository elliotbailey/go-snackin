export function convertCuisineToMapsType(cuisine) {
    switch (cuisine.toLowerCase()) {
        case 'chinese':
            return 'chinese_restaurant';
        case 'indian':
            return 'indian_restaurant';
        case 'italian':
            return 'italian_restaurant';
        case 'japanese':
            return 'japanese_restaurant';
        case 'korean':
            return 'korean_restaurant';
        case 'mexican':
            return 'mexican_restaurant';
        case 'thai':
            return 'thai_restaurant';
        case 'vietnamese':
            return 'vietnamese_restaurant';
        case 'ice-cream':
            return 'ice_cream_shop';
        case 'hamburger':
            return 'hamburger_restaurant';
        case 'coffee':
            return 'coffee_shop';
        case 'breakfast':
            return 'breakfast_restaurant';
        case 'vegan':
            return 'vegan_restaurant';
        case 'vegetarian':
            return 'vegetarian_restaurant';
        case 'pizza':
            return 'pizza_restaurant';
        case 'turkish':
            return 'turkish_restaurant';
        case 'ramen':
            return 'ramen_restaurant';
        case 'korean':
            return 'korean_restaurant';
        case 'spanish':
            return 'spanish_restaurant';
        case 'american':
            return 'american_restaurant';
        default:
            return cuisine;
    }
}