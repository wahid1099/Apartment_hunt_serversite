const express=require('express');
const app=express();
const cors=require('cors');
require('dotenv').config();
const ObjectId=require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
// const admin = require("firebase-admin");
// const fileUpload = require('express-fileupload');

//defualt port
const port=process.env.PORT || 7000;


//middlewares

app.use(cors());
app.use(express.json());
// app.use(fileUpload());



//connection uri to connect mongodb with server

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.byzxg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
         //making connnection with database
         await client.connect();
         console.log("database connected");
 
          //creating database and collections
          const database = client.db('ApartmentHunt');
          const apartmentCollection = database.collection('apartments');
          const userCollection = database.collection('user');
          const bookingCollection = database.collection('booking');
            //api 
          //getting all apartments
         app.get('/apartments', async (req, res) => {
            const cursor = apartmentCollection.find({});
            const allapartments = await cursor.toArray();
            res.json(allapartments);
        });

        //apartments with their id
        app.get('/apartments/:id', async (req, res) => {
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const singleapartment=await apartmentCollection.findOne(query);
            res.json(singleapartment);
        });
        //add apartments
               //inserting data to database collection
     

//book apartment
 
 app.post('/bookapartment',async (req,res)=>{
    const bookapartment=req.body;
    const bookinresult=await bookingCollection.insertOne(bookapartment);
   // console.log(carresult);
    res.json(bookinresult);
});

  //addding services to database
  app.post('/addApartments', async (req, res) => {
    const name = req.body.name;
   const price = req.body.price;
   const description=req.body.description;
   const pic = req.files.img;
   const picData = pic.data;
   const encodedPic = picData.toString('base64');
   const imageBuffer = Buffer.from(encodedPic, 'base64');
   const doctor = {
       name,
       price,
       img: imageBuffer,
       description
   }
   const apartmentresult = await apartmentCollection.insertOne(doctor);
   res.json(apartmentresult);

});

 //getting user all appointments
 app.get('/userbooking', async (req, res) => {
    const email = req.query.email;
    const query = { useremail: email }
    
    const cursor = bookingCollection.find(query);
    const apartmentbooked = await cursor.toArray();
    res.json(apartmentbooked);
});
//getting all orders
 //alluser orders
 app.get('/allbookibng',async (req, res) => {
    const cursor=apartmentCollection.find({});
    const bookigns=await cursor.toArray();
    res.send(bookigns);
    });



 //deleting user car booked for buyings 
 app.delete('/deleteBooking/:id',async (req,res)=>{
  const id=req.params.id;
  const query={_id:ObjectId(id)};
  const result=await bookingCollection.deleteOne(query);
  console.log(result);
  res.json(result);
});

 //deleting user car item for buyings 
 app.delete('/deleteapartment/:id',async (req,res)=>{
   const id=req.params.id;
   const query={_id:ObjectId(id)};
   const result=await apartmentCollection.deleteOne(query);
   res.json(result);
});
  ///getting admins database
  app.get('/users/:email',async (req, res)=>{
    const email=req.params.email;
    const query={email: email};
    const user=await userCollection.findOne(query);
    let isAdmin =false;
    if(user?.role==='admin') {
        isAdmin = true;
    }
    res.json({admin: isAdmin});


    });
  //adding user data to databse
  app.post('/users',async (req, res) => {
    const user=req.body;
    const result = await userCollection.insertOne(user);
    console.log(result);
    res.json(result);
    });
///adding already exists users  data to database
app.put('/users',async (req, res) => {
    const user = req.body;
    const filter={email: user.email};
   
    const options = {upsert: true};
    const updateDoc={$set:user};
    const result=await userCollection.updateOne(filter,updateDoc,options);
    console.log(result);
    res.json(result);
});




    }
    finally{

        //do something
    }
}


run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Apartment Hunt!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})


