const express = require('express')
const app = express()
 const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
var cors = require('cors')
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET)
const fileupload = require('express-fileupload')
const port = process.env.PORT || 5000
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
app.use(cors())
app.use(express.json())
app.use(fileupload())
app.use(express.urlencoded({extended:true}))
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lp6z6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('Ecommerce');
        const products = database.collection('products');
        const addtocart = database.collection('addtocart');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

      
       app.post("/addproduct", async (req,res) => {
          
         const result = await products.insertOne(req.body);
         res.send(result);

        })
      
       
      
      app.get("/manageproduct", async (req, res) => {

        res.send("manageproduct")

      })


      







      
      
      // dashboard work end
      
      
      
        app.get("/products", async (req, res) => {
               const result=await products.find({}).toArray();
               res.send(result)
        })

        app.get("/allorders", async (req, res) => {
               const result = await ordersCollection.find({}).toArray();
               res.send(result)
        })

      app.get("/allorders/:email", async (req, res) => {
        let myemail = req.params.email
        console.log(myemail)
        const query={email:myemail}
        const result = await ordersCollection.find(query).toArray();
        res.send(result)
      })

      app.delete("/productdelete/:id", async (req, res) => {
             let id = req.params.id;
             console.log(id)
             const query = { _id:ObjectId(id) };
             const result = await products.deleteOne(query); 
             res.send(result)
        })

      app.get("/singleproduct/:id", async (req, res) => {
               const id = req.params.id;
               const query = { _id: ObjectId(id) }
               const product = await products.findOne(query);
               res.send(product)
        })

      app.get("/categoryproduct/:category", async (req, res) => {
        const category= req.params.category;
        const query = { category: category }
        const result = await products.find(query).toArray();
        res.send(result)
       })

       
        

        app.post("/addtocart", async (req, res) => {
            const result = await addtocart.insertOne(req.body);
            res.send(result);
         });

        app.post("/saveoder", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
         });

        app.get("/saveoder/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const order = await ordersCollection.findOne(query);
            res.send(order);
         });


      app.delete("/cartproductdelete/:id", async (req, res) => {
        let id = req.params.id;
        console.log(id)
        const query = { _id: ObjectId(id) };
        const result = await addtocart.deleteOne(query);
        res.send(result)
      })

      app.delete("/cartproductdelete/:email", async (req, res) => {
        let emails = req.params.email;
        console.log(emails)
        
        const result = await addtocart.deleteMany({ email: emails });
        res.send(result)
      })

        //stripe cdoe
        // app.post("/create-payment-intent", async (req, res) => {
        //     const paymentInfo = req.body;
        //     const amount = paymentInfo.fees * 100;
        //     const paymentIntent = await stripe.paymentIntents.create({
        //       currency: "usd",
        //       amount: amount,
        //       payment_method_types: ["card"],
        //     });
        //     res.json({ clientSecret: paymentIntent.client_secret });
        //   });

        app.get("/cartproductshow/:email", async (req, res) => {
            const email=req.params.email
            const query = { email: email }
            const result = await addtocart.find(query).toArray();
            res.send(result)
        });


        //getting user info
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
              isAdmin = true;
            }
            res.json({ admin: isAdmin });
          });
          
          //adding user on sign in 
          app.post("/users", async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
          });
          //check for admin
          app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
           
            const result = await usersCollection.updateOne(
              filter,
              updateDoc,
              options
            );
            res.json(result);
          });
       
          //make admin
        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
          
         
      });
        
    } finally {
        // Ensures that the client will close when you finish/error
        
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!two')
})

app.listen(port, () => {
    console.log(`server running listening at http://localhost:${port}`)
})