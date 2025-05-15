console.log('javascript loaded');
import Camera from "./camera.js";
// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

const camera = new Camera();
const videoElement = document.getElementById('cameraFeed');
const startButton = document.getElementById('startCamera');
const stopButton = document.getElementById('stopCamera');

// Hide camera by default
videoElement.style.display = "none";

startButton.addEventListener('click', async () => {
    videoElement.srcObject = await camera.getStream();
    videoElement.play();
    videoElement.style.display = "block"; // Show camera when started
});

stopButton.addEventListener('click', () => {
    camera.stopStream();
    videoElement.srcObject = null;
    videoElement.style.display = "none"; // Hide camera when stopped
});


// Get DOM elements
const takePhotoButton = document.getElementById('takePhoto');
const canvas = document.getElementById('photoCanvas');
const context = canvas.getContext('2d');

// Capture and store image
takePhotoButton.addEventListener('click', () => {
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Save canvas content as image in localStorage
    const imageData = canvas.toDataURL('image/png');
    localStorage.setItem('savedPhoto', imageData);
});


// Function to draw image to canvas
const drawImage = async (imageData) => {
    try {
        const img = new Image();
        img.src = imageData;
        await img.decode(); // Waits for the image to be decoded
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    } catch (err) {
        console.error("Error decoding or drawing image:", err);
    }
};

// On page load, restore image if available
const savedImage = localStorage.getItem('savedPhoto');
if (savedImage) {
    drawImage(savedImage);
}

const profilesContainer = document.getElementById('profilesContainer');
const profileTemplate = document.getElementById('profileTemplate');

fetch('/api/contacts')
  .then(res => res.json())
  .then(contacts => {
    contacts.forEach(contact => {
      const clone = profileTemplate.content.cloneNode(true);
      clone.querySelector('.name').textContent = contact.name;
      clone.querySelector('.email').textContent = contact.email;
      clone.querySelector('.photo').src = contact.photo ?? '';

      // Combine latitude and longitude as a link
      if (contact.latitude && contact.longitude) {
        const latLngLink = document.createElement('a');
        latLngLink.href = `https://www.google.com/maps?q=${contact.latitude},${contact.longitude}`;
        latLngLink.target = "_blank";
        latLngLink.textContent = `Latitude: ${contact.latitude}°, Longitude: ${contact.longitude}°`;

        // Replace the latitude and longitude elements with the link
        const latitudeElem = clone.querySelector('.latitude');
        const longitudeElem = clone.querySelector('.longitude');
        latitudeElem.replaceWith(latLngLink);
        longitudeElem.remove(); // Remove the old longitude element
        // Optionally, remove the "Longitude:" label if you want
        const spaceLocationElem = clone.querySelector('.space-location');
        if (spaceLocationElem) spaceLocationElem.remove();
      } else {
        // Fallback if no lat/lon
        clone.querySelector('.latitude').textContent = contact.latitude ?? '';
        clone.querySelector('.longitude').textContent = contact.longitude ?? '';
      }

      profilesContainer.appendChild(clone);
    });
  });

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Get image from canvas
    const imageData = canvas.toDataURL('image/jpeg', 0.5); // compress to reduce size

    await fetch('/api/contacts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            latitude: formData.get('latitude'),
            longitude: formData.get('longitude'),
            photo: imageData
        })
    });

    // Refresh the page after adding a contact
    location.reload();
});

// Haversine formula to calculate distance in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon1 - lon2);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function geoFindMe() {
  const status = document.querySelector("#status");
  const mapLink = document.querySelector("#map-link");
  const latInput = document.querySelector('input[name="latitude"]');
  const lonInput = document.querySelector('input[name="longitude"]');

  mapLink.href = "";
  mapLink.textContent = "";

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = "";

    mapLink.href = ` https://www.google.com/maps/@${latitude},${longitude},100m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI1MDUwNy4wIKXMDSoASAFQAw%3D%3D`;
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

    // Set the values in the form fields
    if (latInput) latInput.value = latitude;
    if (lonInput) lonInput.value = longitude;

    // Calculate and display distances for each profile
    document.querySelectorAll('.profile').forEach(profile => {
      // Try to get lat/lon from the link or fallback to text
      const latLngLink = profile.querySelector('a[href^="https://www.google.com/maps?q="]');
      let contactLat, contactLon;
      if (latLngLink) {
        // Extract from link
        const match = latLngLink.href.match(/maps\?q=([0-9.\-]+),([0-9.\-]+)/);
        if (match) {
          contactLat = parseFloat(match[1]);
          contactLon = parseFloat(match[2]);
        }
      }
      if (contactLat == null || contactLon == null) {
        // Fallback: try to get from text content
        const latText = profile.querySelector('.latitude')?.textContent;
        const lonText = profile.querySelector('.longitude')?.textContent;
        contactLat = parseFloat(latText);
        contactLon = parseFloat(lonText);
      }
      if (!isNaN(contactLat) && !isNaN(contactLon)) {
        const dist = haversineDistance(latitude, longitude, contactLat, contactLon);
        const distElem = profile.querySelector('.distance');
        if (distElem) {
          distElem.textContent = `Distance: ${dist.toFixed(2)} km`;
        }
      }
    });
  }

  function error() {
    status.textContent = "Unable to retrieve your location";
  }

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser";
  } else {
    status.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
    // Leaflet map setup
    var map = L.map('map', {
        center: [52.5189853, 4.9728117],
        zoom: 9,
    });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c']
    }).addTo(map);

    var marks = [
        { text: 'Bit Academy', latlng: [52.5189853, 4.9728117], },
        { text: 'Building 233', latlng: [36.728217, 3.205652], },
        { text: 'Building 45', latlng: [36.728217, 3.305652], },
        { text: 'Building 15', latlng: [36.680448, 3.253714], },
    ];

    for (var i = 0; i < marks.length; i++) {
        L.marker(marks[i].latlng)
            .bindTooltip(marks[i].text, {
                direction: 'top',
                sticky: false,
                offset: [0, -15],
            })
            .addTo(map);
    }
});

document.querySelector("#find-me").addEventListener("click", geoFindMe);
