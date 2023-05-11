const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chocolate server is running !");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.g4f1thy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const chocolatesCollection = client
      .db("chocolateDB")
      .collection("chocolate");

    app.get("/chocolates", async (req, res) => {
      const cursor = await chocolatesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await chocolatesCollection.findOne(query);
      res.send(result);
    });

    app.post("/chocolates/add", async (req, res) => {
      const chocolate = req.body;
      const result = await chocolatesCollection.insertOne(chocolate);
      res.send(result);
    });

    app.put("/chocolates/update/:id", async (req, res) => {
      const id = req.params.id;
      const chocolate = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedChocolate = {
        $set: {
          name: chocolate.name,
          country: chocolate.country,
          category: chocolate.category,
          photoUrl: chocolate.photoUrl,
        },
      };
      const result = await chocolatesCollection.updateOne(
        filter,
        updatedChocolate,
        options
      );
      res.send(result); 
    });

    app.delete("/chocolates/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result =  await chocolatesCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Chocolate server is listening at http://localhost:${port}`);
});
