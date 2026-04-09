const express = require('express');
const mongoose = require('mongoose');

const app = express(); 

mongoose.connect('mongodb+srv://Admin:QlayUDIfPPIfY53d@cluster0.l9mbit4.mongodb.net/')
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => console.log("Error connecting to MongoDB:", err));