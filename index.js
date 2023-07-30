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

        //add new commnet on product
        app.post("/products/:id", async (req, res) => {
            const productId = req.params.id;
            const { comment } = req.body.comment;

            try {
                const result = await componentsCollection.updateOne(
                    { _id: new ObjectId(productId) },
                    { $push: { reviews: comment } }
                );
                res.status(200).send({ success: true, message: "Comment added successfully" })

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error adding comment"
                });
            }
        })

        //add new review on product
        app.patch("/products/:id", async (req, res) => {
            const productId = req.params.id;
            const rating = req.body.rating;
            const user = req.body.user;
            const ratingData = {
                productId,
                rating,
                user
            }
            try {
                const result = await componentsCollection.updateOne(
                    { _id: new ObjectId(productId) },
                    {
                        $push: {
                            ratings: rating, // Push rating into the ratings array
                            individualRatings: ratingData, // Push ratingData into the individualRatings array
                        },
                    }
                );
                res.status(200).send({ success: true, message: "Rating submitted successfully" })

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error rating submission"
                });
            }
        })



    } finally { }
}
run().catch(console.dir);
