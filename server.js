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
        db = client.db('destinations-library');
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
    db.collection('destinations').find().toArray()
    .then(data => {
        res.render('home.ejs', {locations: data});
    })
    .catch(err => console.log(err))
    
})
//ADD DESTINATION ROUTE
app.post('/home', (req, res) => {
    console.log('ADDING destination....');
    console.log(req.body)

    //check for destination entry with the same name, location, month, and year
    db.collection('destinations').find({
        name: req.body.name,
        location: req.body.location,
        month: req.body.month,
        year: req.body.year
    })
    .toArray()
    .then(data => {
        //if there are no entries add it to the database
        if (data.length === 0) {
            db.collection('destinations').insertOne({
                name: req.body.name,
                location: req.body.location,
                month: req.body.month,
                year: req.body.year,
                notes: req.body.notes
            })
            .then(data => {
                console.log('Destination added');
                console.log(data)
                if (data.acknowledged) res.status(200).send({success: "Desination added successfully"})
                else res.status(400).send({error: "Desination addition unsuccessful"})
            })
        }
        //if there is a pre-existing entry, send an error
        else {
            console.log('Destination already exists');
            res.status(400).send({
                error: 'The destination you are trying to create already exists. Try creating a unique entry'
            })
        }
    })
    .catch(err => console.log(err))     
})
//UPDATE DESTINATION ROUTE
app.put('/home', (req, res) => {
    console.log('UPDATING destination....');
    console.log(req.body)
    db.collection('destinations').findOneAndUpdate(req.body.previous, {
        $set: req.body.new
    })
    .then(result => {
        if (result.lastErrorObject.updatedExisting) res.json({success: "Updated Desination"});
        else res.json({error: "Update was unsucessful. Please try again later."});
    })
    .catch(err => console.log(err));
})
//DELETE DESTINATION ROUTE
app.delete('/home', (req, res) => {
    console.log('DELETING destination....');
    console.log(req.body);
    db.collection('destinations').deleteOne(req.body)
    .then(result => {
        if (data.acknowledged) res.status(200).send({success: "Desination successfully deleted"})
        else res.status(400).send({error: "Desination deletion unsuccessful"})
    })
    .catch(error => console.error(error))
})

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
