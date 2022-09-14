const express = require('express');
const app = express();
const PORT = 3000;
const MongoClient = require('mongodb').MongoClient;

mongoConnectionString = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.vytxyy3.mongodb.net/?retryWrites=true&w=majority`

// MongoClient.connect(mongoConnectionString)
//     .then(client => console.log('YOU DID IT!!!'))
//     .catch(err => console.log(err));

console.log(process.env.MONGO_PASSWORD);

app.use(express.static("public"));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>WE IN BUSINESS</h1>');
})

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
