const express = require("express");
const app = express();
const port = process.env.port || 5000;
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clgsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run(){
    try{
        await client.connect();
        // console.log('DataBase connected successfully yeyy')
        const database = client.db('onlineShop');
        const productCollection = database.collection('products');

        // Get Products Api
        app.get('/products', async(req, res) =>{
            // console.log(req.query);
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                const products = await cursor.toArray();
            }

            res.send({
                count,
                products
            });
        });

        // Use POst to get data by keys
        app.post('/product/byKeys', async (req, res) =>{
            const keys = req.body;
            const query = {key: {sin: keys} }
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        // add orders API
        app.post('/orders', async (req, res) =>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send("Running my CRUD server of Spine-Firm on web")
});

app.listen(port, ()=>{
    console.log("Running spine-firm server on port", port);
});