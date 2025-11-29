require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectToDatabase } = require('./db');

const app = express();
app.use(express.json());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';

app.get('/images/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const imagePath = path.join(__dirname, 'images', fileName);

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`Image not found: ${imagePath}`);
            return res.status(404).json({ error: 'Image not found' });
        }
        res.sendFile(imagePath);
    });
});

app.get('/lessons', async (req,res) => {
    try {
        const db = req.app.locals.db;
        const lessonsCollection = db.collection('lessons');

        const lessons = await lessonsCollection.find({}).toArray();
        res.json(lessons);
    } catch (err){
        console.error('Error in GET /lessons:', err);   
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});
app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.url}`);
    next();
})

app.use(cors({
    origin: [FRONTEND_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

app.get('/health', (req, res) => {
    res.json({status: 'ok', message: 'Backend is running'});
});

const PORT = process.env.PORT || 3000;
connectToDatabase().then((db) => {
    app.locals.db = db;
    app.listen(PORT, () => {
        console.log(`Server is running at  http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
});