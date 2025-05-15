# Contact-thing

A Progressive Web App (PWA) for creating, viewing, and sharing contacts with geolocation and photo support, backed by MongoDB.

---

## Features

- 📱 **PWA**: Installable and works offline with service worker caching.
- 🗺️ **Interactive Map**: View all contacts on a Leaflet map with clustering and custom photo markers.
- 📸 **Photo Support**: Add a contact photo using your camera or by uploading an image.
- 📍 **Geolocation**: Automatically fill in your current location or pick a location on the map.
- 🗃️ **MongoDB Backend**: All contacts are stored in a MongoDB database.
- 🔒 **File Size Limit**: Prevents uploading images larger than 1MB.
- 🌐 **Cross-device**: Works on desktop and mobile browsers.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or cloud, e.g. MongoDB Atlas)

### Setup

1. **Clone the repository**
    ```sh
    git clone https://github.com/RindoGaming/Contact-thing.git
    cd Contact-thing
    ```

2. **Install server dependencies**
    ```sh
    cd server
    npm install
    ```

3. **Configure environment variables**

    Create a `.env` file in the `server` folder with your MongoDB connection string:
    ```
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
    ```

4. **Start the server**
    ```sh
    npm start
    ```
    The server will run on [http://localhost:6789](http://localhost:6789) by default.

5. **Open the app**

    Open your browser and go to [http://localhost:6789](http://localhost:6789).

---

## Usage

- **Add a Contact**: Fill in the form, take or upload a photo (required), set a location (auto, map, or manual), and submit.
- **View Contacts**: All contacts appear as cards and as markers on the map.
- **Map Features**: Click "Pick Location on Map" to set coordinates, or "Show my location" to auto-fill your current position.
- **Camera**: Use "Start Camera" and "Take Photo" to capture a profile image.

---

## Project Structure

<br/>
## Used for sharing during presentation
<br/>
https://github.com/Genymobile/scrcpy/releases/tag/v3.2
<br/>
https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md#run

---

## Troubleshooting

- **CORS Issues**: The server uses CORS to allow cross-origin requests.
- **Payload Too Large**: Images are limited to 1MB. Compress or resize if needed.
- **MongoDB Connection**: Ensure your connection string is correct and MongoDB is running.

---

## Credits

- [Leaflet](https://leafletjs.com/) for maps
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) for marker clustering
- [Express](https://expressjs.com/) and [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)

---

## License

MIT License

---

*Made for educational purposes and demo presentations.*




