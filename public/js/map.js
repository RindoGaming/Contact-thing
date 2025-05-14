// Fetch data from the database and add markers to the map
fetch('/api/contacts')
    .then((response) => response.json())
    .then((contacts) => {
        contacts.forEach((contact) => {
            // Check if the contact has valid latitude and longitude
            if (contact.latitude && contact.longitude) {
                // Add a marker to the map
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