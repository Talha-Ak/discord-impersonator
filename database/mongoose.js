require('dotenv-flow').config();
const mongoose = require('mongoose');

/**
 * Initialises the connection to the MongoDB instance.
 */
module.exports = {
    init: () => {
        const dbOptions = {
            useNewUrlParser: true,
            autoIndex: false,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500,
            useFindAndModify: false,
        };

        // Change the below URL to another MongoDB database if not using MongoDB Atlas.
        mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.m0znd.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`, dbOptions);

        mongoose.connection.on('connected', () => console.log('Connected to MongoDB server.'));
        mongoose.connection.on('error', err => console.error(`MongoDB connection error. ${err}`));
        mongoose.connection.on('disconnected', () => console.log('Disconnected from MongoDB server.'));
    },
};
