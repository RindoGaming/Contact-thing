// Initialize the map
const map = L.map('map').setView([52.5189853, 4.9728117], 9); // Example coordinates and zoom level

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch data from the database and add markers to the map
fetch('/api/contacts')
    .then((response) => response.json())
    .then((contacts) => {
        contacts.forEach((contact) => {
            if (contact.latitude && contact.longitude) {
                L.marker([contact.latitude, contact.longitude])
                    .bindTooltip(`${contact.name}`, {
                        direction: 'top',
                        sticky: false,
                        offset: [0, -15],
                    })
                    .addTo(map);
            }
        });
    })
    .catch((error) => {
        console.error('Error fetching contacts:', error);
    });