const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'vue_database';

if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
}

let dbInstance;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    dbInstance = client.db(dbName);
    return dbInstance;
}

module.exports = { connectToDatabase };