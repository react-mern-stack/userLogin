const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/"

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI)
        console.log("Connected to Mongo Successfully");
    } catch (error) {
        console.error('Connection error:', error);
    }
}

module.exports = connectToMongo;