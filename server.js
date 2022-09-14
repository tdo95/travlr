require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const MongoClient = require('mongodb').MongoClient;

mongoConnectionString = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.vytxyy3.mongodb.net/?retryWrites=true&w=majority`

MongoClient.connect(mongoConnectionString)
    .then(client => {
        console.log('Database Connected - YOU DID IT!!!');
        const db = client.db('travlr-destinations-library');
        const destinationsCollection = db.collection('destinations');

        //MIDDLEWARE
        app.use(express.static("public"));
        app.use(express.json());
        //LANDING PAGE ROUTE
        app.get('/', (req, res) => {
            res.send('<h1>WE IN BUSINESS</h1>');
        })
        //HOMEPAGE ROUTE
        app.get('/home', (req, res) => {
            res.send('<h1>WE IN BUSINESS</h1>');
        })

        app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
    })
    .catch(err => console.log(err));



