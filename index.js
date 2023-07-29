const express = require('express')
const app = express()
const cors = require("cors")
const port = 5000
require("dotenv").config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o7ktjfn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const componentsCollection = await client.db("PC-Builder").collection("components");
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })

        //get random products for homepage
        app.get("/featured-products", async (req, res) => {
            try {
                const numProductsToRetrieve = 6;
                const result = await componentsCollection.aggregate([
                    { $sample: { size: numProductsToRetrieve } }
                ]).toArray();
                res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving random products"
                });
            }
        });

        //get all products
        app.get("/products", async (req, res) => {
            try {
                const result = await componentsCollection.find().toArray();
                res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving the products"
                });
            }
        })

        //get single product
        app.get("/products/:id", async (req, res) => {
            const id = req?.params?.id
            try {
                const result = await componentsCollection.findOne({ _id: new ObjectId(id) })
                res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving the product"
                });
            }
        })


        //get all products
        app.get("/category", async (req, res) => {
            const query = req.query;
            try {
                const result = await componentsCollection.find({ category: query?.name }).toArray();
                res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving the products"
                });
            }
        })



    } finally { }
}
run().catch(console.dir);
