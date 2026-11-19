const location = {
    streetAddress: 'Room no. 2, Chauhan Chawl, Hans Vijay Nagar, Hawai Pada',
    addressLocality: 'Nalasopara East',
    addressRegion: 'Maharashtra',
    postalCode: '401209',
};

export const business = {
    ...location,
    name: 'Vishwa IT Solutions',
    phone: '+917666704188',
    phoneText: '+91 76667 04188',
    email: (import.meta.env.VITE_BUSINESS_EMAIL || '').trim(),
    address: [
        location.streetAddress,
        location.addressLocality,
        'Vasai-Virar',
        location.addressRegion + ' ' + location.postalCode,
    ].join(', '),
    placeId: (import.meta.env.VITE_GOOGLE_PLACE_ID || '').trim(),
};

export function whatsapp(
    message = 'Hi Vishwa IT Solutions, I’d like to make an enquiry.',
) {
    return `https://wa.me/${business.phone.slice(1)}?text=${encodeURIComponent(message)}`;
}

export const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`;
const mapsQuery = new URLSearchParams({
    api: '1',
    query: business.placeId
        ? business.name
        : `${business.name}, Nalasopara East, Vasai-Virar`,
});
if (business.placeId) mapsQuery.set('query_place_id', business.placeId);
export const mapsListing = `https://www.google.com/maps/search/?${mapsQuery}`;
export const justdialListing =
    'https://www.justdial.com/Palghar/Vishwa-It-Solutions-Near-Rambharose-Hotel-Nalasopara-East/022PXX22-XX22-211220161254-E5C8_BZDET';

export const money = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

export const base = '/';
