require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect(process.env.DB_STRING)
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
//GET LOCATION RESULTS
app.post('/roadgoat', async (req, res) => {
    console.log(req.body.input);
    fetch(`https://api.roadgoat.com/api/v2/destinations/auto_complete?q=${req.body.input}`, {
        method:'GET',
        headers: {
          "Authorization": `Basic ${new Buffer.from(process.env.ROADGOAT_KEY + ":" + process.env.ROADGOAT_SECRET).toString('base64')}`,
        }
    })
    .then(response => response.json())
    .then(result => res.status(200).send(result))
    .catch(err => console.log(err));
    
})
//GET DESTINATION IMAGE
app.post('/unsplash', async (req, res) => {
    console.log('GETTING IMAGE....')
    console.log(req.body)
    fetch(`https://api.unsplash.com/search/photos?query=${req.body.input.toLowerCase()}&orientation=landscape&client_id=${process.env.UNSPLASH_KEY}`)
    .then(response => response.json())
    //sends the first image obj in results
    .then(result => {
        console.log(result);
        console.log(process.env.UNSPLASH_KEY)
        
        if (result.total && result.total != 0) res.status(200).send(result.results[0])
        else {
            
            res.status(200).send({error: "No images found :("});
        }
    })
    .catch(err => console.log(err));
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
                notes: req.body.notes,
                imageURL: req.body.imageURL
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
                error: 'The destination you are trying to create already exists. Please create a unique entry'
            })
        }
    })
    .catch(err => console.log(err))     
})
//UPDATE DESTINATION ROUTE
app.put('/home', (req, res) => {
    console.log('UPDATING destination....');
    console.log(req.body)
    //check if the desired entry already exists
    db.collection('destinations').find({
        name: req.body.new.name,
        location: req.body.new.location,
        month: req.body.new.month,
        year: req.body.new.year
    })
    .toArray()
    .then(data => {
        //if the desired entry doesnt already exist update to the desired entry
        if (data.length) {

            db.collection('destinations').findOneAndUpdate(req.body.previous, {
                $set: req.body.new
            })
            .then(result => {
                if (result.lastErrorObject.updatedExisting) res.json({success: "Updated Desination"});
                else res.json({error: "Update was unsucessful. Please try again later."});
            })
            .catch(err => console.log(err));

        }
        //if desired entry exists send an error
        else {
            console.log('Desired entry could not be found, update failed');
            res.status(400).send({
                error: 'The destination you are trying to update could not be found.'
            })
        }
    })
    .catch(err => console.log(err))  
    
})
//DELETE DESTINATION ROUTE
app.delete('/home', (req, res) => {
    console.log('DELETING destination....');
    db.collection('destinations').deleteOne(req.body)
    .then(result => {
        console.log(result)
        if (result.deletedCount > 0) res.status(200).send({success: "Desination successfully deleted"})
        else res.status(400).send({error: "Desination deletion unsuccessful"})
    })
    .catch(error => console.error(error))
})

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
