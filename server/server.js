import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT ?? 6789;
// Connect to MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Provide contacts through the API
app.get('/api/contacts', async (req, res) => {
    const collection = client.db('pwa_demo').collection('contacts')
    const contacts = await collection.find({}).toArray();
    res.json(contacts);
});
app.post('/api/contacts', async (req, res) => {
    const newContact = req.body;
    const collection = client.db('pwa_demo').collection('contacts')
    const result = await collection.insertOne(newContact);
    res.status(201).json(result);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});