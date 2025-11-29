require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';

app.use(cors({
    origin: [FRONTEND_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

app.get('/health', (req, res) => {
    res.json({status: 'ok', message: 'Backend is running'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});