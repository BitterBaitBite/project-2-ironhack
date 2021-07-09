const MONGO_URI = process.env.DB_REMOTE || process.env.MONGODB_URI || 'mongodb://localhost/project-2-ironhack';
const MAPS_KEY = process.env.MAPS_KEY;

module.exports = { MONGO_URI, MAPS_KEY };
