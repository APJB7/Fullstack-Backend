require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const { connectToDatabase } = require('./db');

const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log("---- LOGGER ----");
    console.log("Time:", now);
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Query:", req.query);
    console.log("Body:", req.body);
    console.log("----------------");
    next();
})


app.use(cors());

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

app.get('/lessons', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const lessonsCollection = db.collection('lessons');

        const lessons = await lessonsCollection.find({}).toArray();
        res.json(lessons);
    } catch (err) {
        console.error('Error in GET /lessons:', err);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const ordersCollection = db.collection('orders');

        const { name, phone, items } = req.body;

        if (!name || !phone || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'name, phone, items[] are required' });
        }

        const nameRegex = /^[A-Za-z]+$/;
        const phoneRegex = /^[0-9]+$/;

        if (!nameRegex.test(name)) {
            return res.status(400).json({
                error: 'Invalid name format. Only alphabetic characters are allowed.'
            });
        }

        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                error: 'Invalid phone format. Only numeric characters are allowed.'
            });
        }

        const validItems = items.every(i =>
            typeof i.lessonId === 'number' &&
            Number.isInteger(i.lessonId) &&
            i.lessonId > 0 &&
            typeof i.qty === 'number' &&
            Number.isInteger(i.qty) &&
            i.qty > 0
        );

        if (!validItems) {
            return res.status(400).json({ error: 'Each item must have a valid lessonId (positive integer) and qty (positive integer)' });
        };

        const totalSpaces = items.reduce((sum, i) => sum + (i.qty || 0), 0);

        const orderDocument = {
            name,
            phone,
            totalSpaces,
            items,
            createdAt: new Date()
        };

        const result = await ordersCollection.insertOne(orderDocument);

        res.status(201).json({
            message: 'Order created successfully',
            orderId: result.insertedId
        });
    } catch (err) {
        console.error('Error in POST /orders:', err);
        res.status(500).json({ error: 'Failed to save order' });
    }
});

app.put('/lessons/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const lessonsCollection = db.collection('lessons');
        const id = parseInt(req.params.id, 10);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid lesson ID, must be a number' });
        }

        const updates = { ...req.body };
        delete updates._id;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        if (updates.space !== undefined) {
            if (
                typeof updates.space !== 'number' ||
                !Number.isInteger(updates.space) ||
                updates.space < 0
            ) {
                return res.status(400).json({
                    error: 'space must be a non-negative integer'
                });
            }
        }

        const result = await lessonsCollection.updateOne(
            { id },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.json({
            message: 'Lesson updated successfully',
            updateId: id,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error('Error in PUT /lessons/:id:', err);
        res.status(500).json({ error: 'Failed to update lesson' });
    }
});

app.get('/search', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const lessonsCollection = db.collection('lessons');

        const q = (req.query.q || '').trim();
        if (!q) {
            const all = await lessonsCollection.find({}).toArray();
            return res.json(all);
        }

        const regex = new RegExp(q, 'i');

        const orConditions = [
            { subject: { $regex: regex } },
            { topic: { $regex: regex } },
            { location: { $regex: regex } },

            {
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$price" },
                        regex: q,
                        options: "i"
                    }
                }
            },

            {
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$space" },
                        regex: q,
                        options: "i"
                    }
                }

            }

        ];

        const results = await lessonsCollection.find({ $or: orConditions }).toArray();
        res.json(results);

    } catch (err) {
        console.error('Error in GET /search:', err);
        res.status(500).json({ error: 'Search failed' });
    }
})

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
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