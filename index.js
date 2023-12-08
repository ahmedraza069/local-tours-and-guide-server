const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors({
  origin: [ 'https://local-tours-and-guide.surge.sh'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_KEY}@cluster0.ppdfwyq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// const logger = (req, res, next) => {
//   console.log('logInfo',req.method, req.url);
//   next()
// }

// const verifyToken = (req, res, next) => {
//   const token = req.cookies?.token;

//   if (!token) {
//     return res.status(401).send({message : 'unauthorized access'})
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
//     if (err) {
//       return res.send({message: 'unauthorized access'})
//     }
//     req.user = decoded;
//     next();
//   })
// }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const servicesCollection = client.db("servicesDB").collection("services");
    const bookingCollection = client.db("servicesDB").collection("bookings");

    // jwt related
    // app.post('/jwt',logger, async(req, res) => {
    //   const user = req.body;
    //   console.log(user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1h"})
    //   res
    //   .cookie('token', token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'none'
    //   })
    //   .send({succes: true})
    // })

    // app.post('/logout', async(req, res) =>{
    //   const user = req.body;
    //   console.log('login out user', user);
    //   res.clearCookie('token', {maxAge: 0}).send({succes: true})
    // })

    // service related
    app.post("/services", async (req, res) => {
      try {
        const service = req.body;
        const result = await servicesCollection.insertOne(service);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      if (result) {
        res.send(result);
      } else {
        res.status(404).send("Services not found");
      }
    });

    // Booking Collection
    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/bookings", async (req, res) => {
      console.log(req.query.email);
      let query = {};

      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/bookings/:id', async(req, res) => {
      try{
        const package = await bookingCollection.findOne({_id : new ObjectId(req.params.id)})
        res.send(package)
      }catch(error){
        console.log(error)
      }
    })

    app.put('/bookings/:id', async(req, res) => {
     try{
      const id = {_id : new ObjectId(req.params.id)}
      const body = req.body
      const updatedData = {
        $set: {
          ...body,
        },
      }
      const option = {upsert : true}
      const result = await bookingCollection.updateOne(id, updatedData, option)


      res.send(result)
     }catch(error){
      console.log(error);
     }
    })

    // app.patch("/bookings/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const newStatus = req.body.status;
    //   console.log(newStatus);
    //   const query = { _id: new ObjectId(id) };
    //   const update = {
    //     $set: { status: newStatus },
    //   };

    //   const result = await bookingCollection.updateOne(query, update);
    //   res.send(result);
    // });

    // Delete Cart
    app.delete("/bookings/:id", async (req, res) => {
      try{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
      }
      catch(error){
        console.log(error);
      }
    });

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

app.get("/", (req, res) => {
  res.send("LOCAL TOUR AND GUIDE WEB APPLICATION IS SERVER IS RUNNING");
});
app.listen(port, () => {
  console.log(`LOCAL TOUR AND GUIDE SERVER IS RUNNING PORT ON ${port}`);
});
