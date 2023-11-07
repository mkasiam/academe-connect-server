const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

//using middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://academe-connect.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzmwwb7.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  const assignmentCollection = client
    .db("AssignmentDB")
    .collection("assignments");
  const submittedAssignmentCollection = client
    .db("submittedDB")
    .collection("assignments");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    //Assignments
    app.post("/assignments", async (req, res) => {
      const assignment = req.body;
      const result = await assignmentCollection.insertOne(assignment);
      res.send(result);
    });
    app.get("/assignments", async (req, res) => {
      const result = await assignmentCollection.find().toArray();
      res.send(result);
    });
    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });
    app.put("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedInfo = req.body;
      const options = { upsert: true };
      const assignment = {
        $set: {
          title: updatedInfo.title,
          marks: updatedInfo.marks,
          thumbnail: updatedInfo.thumbnail,
          dueDate: updatedInfo.dueDate,
          details: updatedInfo.details,
          difficulty: updatedInfo.difficulty,
        },
      };
      const result = await assignmentCollection.updateOne(
        filter,
        assignment,
        options
      );
      res.send(result);
    });
    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });
    // Submitted Assignments
    app.post("/submittedAssignments", async (req, res) => {
      const submittedAssignment = req.body;
      const result = await submittedAssignmentCollection.insertOne(
        submittedAssignment
      );
      res.send(result);
    });
    app.get("/submittedAssignments", async (req, res) => {
      const status = req.query.status;
      const email = req.query.email; // Get the email from the query parameter
    
      const query = {}; // Initialize an empty query object
    
      if (status === "pending") {
        query.status = "pending";
      }
    
      if (email) {
        query.submittedUserEmail = email; // Add the email condition to the query
      }
    
      // Query assignments based on the combined conditions
      const result = await submittedAssignmentCollection.find(query).toArray();
      res.send(result);
    });
    app.put("/submittedAssignments/:id", async (req, res) => {
      const submittedAssignment = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: submittedAssignment.status,
          obtainMarks: submittedAssignment.obtainMarks,
          feedback: submittedAssignment.feedback,
        },
      };
      const result = await submittedAssignmentCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
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
  res.send("Academe-Connect Server is running");
});
app.listen(port, () => {
  console.log(`Server is running from port ${port}`);
});
