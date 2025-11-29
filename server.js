require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectToDatabase } = require('./db');

const app = express();
app.use(express.json());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';

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