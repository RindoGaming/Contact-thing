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

videoElement.style.display = "none";

startButton.addEventListener('click', async () => {
    videoElement.srcObject = await camera.getStream();
    videoElement.play();
    videoElement.style.display = "block";
});

stopButton.addEventListener('click', () => {
    camera.stopStream();
    videoElement.srcObject = null;
    videoElement.style.display = "none";
});

const takePhotoButton = document.getElementById('takePhoto');
const canvas = document.getElementById('photoCanvas');
const context = canvas.getContext('2d');

let imageData = null;

const uploadInput = document.getElementById('uploadPhoto');
const uploadBtn = document.getElementById('uploadPhotoBtn');

uploadBtn.addEventListener('click', () => {
    uploadInput.click();
});

uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        imageData = e.target.result;
        drawImage(imageData);
        localStorage.setItem('savedPhoto', imageData);
    };
    reader.readAsDataURL(file);
});

// Update take photo button to set imageData
takePhotoButton.addEventListener('click', () => {
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    imageData = canvas.toDataURL('image/png');
    localStorage.setItem('savedPhoto', imageData);
});

takePhotoButton.addEventListener('click', () => {
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    localStorage.setItem('savedPhoto', imageData);
});


// Function to draw image to canvas
const drawImage = async (imageData) => {
    try {
        const img = new Image();
        img.src = imageData;
        await img.decode();
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    } catch (err) {
        console.error("Error decoding or drawing image:", err);
    }
};

const savedImage = localStorage.getItem('savedPhoto');
if (savedImage) {
    imageData = savedImage;
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
        latLngLink.className = "latlng-link";

        const latitudeElem = clone.querySelector('.latitude');
        const longitudeElem = clone.querySelector('.longitude');
        latitudeElem.replaceWith(latLngLink);
        longitudeElem.remove();

        const spaceLocationElem = clone.querySelector('.space-location');
        if (spaceLocationElem) spaceLocationElem.remove();
      } else {
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

    if (!imageData) {
        alert("Please add a photo using the camera or upload before submitting.");
        return;
    }

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
    mapLink.textContent = `${latitude}°, ${longitude} °`;

    if (latInput) latInput.value = latitude;
    if (lonInput) lonInput.value = longitude;

    // Calculate and display distances for each profile
    document.querySelectorAll('.profile').forEach(profile => {
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
