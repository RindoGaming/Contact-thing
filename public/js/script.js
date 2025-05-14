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

startButton.addEventListener('click', async () => {
    videoElement.srcObject = await camera.getStream();
    videoElement.play();
});

stopButton.addEventListener('click', () => {
    camera.stopStream();
    videoElement.srcObject = null;
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
      clone.querySelector('.latitude').textContent = contact.latitude;
      clone.querySelector('.longitude').textContent = contact.longitude;
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
});




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
