require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const MongoClient = require('mongodb').MongoClient;

let mongoConnectionString = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.vytxyy3.mongodb.net/?retryWrites=true&w=majority`;
let db;

MongoClient.connect(mongoConnectionString)
    .then(client => {
        console.log('Database Connected - YOU DID IT!!!');
        db = client.db('travlr-destinations-library');
        // const destinationsCollection = db.collection('destinations');    
    })
    .catch(err => console.log(err));

//MIDDLEWARE
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//LANDING PAGE ROUTE
app.get('/', (req, res) => {
    console.log('LANDING loading...');
    res.sendFile(__dirname + '/index.html');   
})
//HOMEPAGE ROUTE
app.get('/home', (req, res) => {
    res.render('home.ejs', {});
})
//ADD DESTINATION ROUTE
app.post('/home', (req, res) => {
    console.log('ADDING destination....');
    
})
//UPDATE DESTINATION ROUTE
app.put('/home', (req, res) => {
    console.log('UPDATING destination....');
})
//DELETE DESTINATION ROUTE
app.put('/home', (req, res) => {
    console.log('DELETING destination....');
})

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
