// Initialize the map
const map = L.map('map').setView([52.5189853, 4.9728117], 9); // Example coordinates and zoom level

// Prevent infinite scrolling
map.setMaxBounds([
    [-90, -180], // Southwest coordinates
    [90, 180]    // Northeast coordinates
]);
map.on('drag', function() {
    map.panInsideBounds(map.options.maxBounds, { animate: false });
});

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Default icon in case contact has no photo
const defaultIcon = L.icon({
    iconUrl: 'https://images.contentstack.io/v3/assets/bltcedd8dbd5891265b/blta6616ffff97cc383/664cbc22c2be8e07f1eebc2c/ChumSalmon.jpeg?q=70&width=3840&auto=webp',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Create a marker cluster group
const markers = L.markerClusterGroup();

// Fetch data from the database and add markers to the map
fetch('/api/contacts')
    .then((response) => response.json())
    .then((contacts) => {
        contacts.forEach((contact) => {
            if (contact.latitude && contact.longitude) {
                // Use contact photo if available, otherwise use default icon
                const icon = L.icon({
                    iconUrl: contact.photo ? contact.photo : defaultIcon.options.iconUrl,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                    className: 'round-marker-img' // Add this line
                });

                const marker = L.marker([contact.latitude, contact.longitude], { icon })
                    .bindTooltip(`${contact.name}`, {
                        direction: 'top',
                        sticky: false,
                        offset: [0, -15],
                    });
                markers.addLayer(marker);
            }
        });
        map.addLayer(markers);
    })
    .catch((error) => {
        console.error('Error fetching contacts:', error);
    });

const pickLocationBtn = document.getElementById('pickLocation');
let pickingLocation = false;
let tempMarker = null;

if (pickLocationBtn) {
    pickLocationBtn.addEventListener('click', () => {
        pickingLocation = true;
        pickLocationBtn.textContent = "Click on the map…";
        map.getContainer().style.cursor = "crosshair";
    });

    map.on('click', function(e) {
        if (!pickingLocation) return;
        pickingLocation = false;
        pickLocationBtn.textContent = "Pick Location on Map";
        map.getContainer().style.cursor = "";

        // Remove previous temp marker if exists
        if (tempMarker) {
            map.removeLayer(tempMarker);
        }

        // Place a marker at the clicked location
        tempMarker = L.marker(e.latlng).addTo(map);

        // Set the form fields
        const latInput = document.querySelector('input[name="latitude"]');
        const lngInput = document.querySelector('input[name="longitude"]');
        if (latInput) latInput.value = e.latlng.lat.toFixed(6);
        if (lngInput) lngInput.value = e.latlng.lng.toFixed(6);
    });
}