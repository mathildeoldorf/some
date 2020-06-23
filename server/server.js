const express = require("express");
const app = express();
const cors = require("cors");

// ############################## GLOBAL VARIABLES
global.path = require("path");
global.fs = require("fs");
global.detect = require("detect-file-type");
global.formidable = require("formidable");
global.jwt = require("jsonwebtoken");
global.router = require("express").Router();
global.config = require("./config");
const { v1: uuidv1 } = require("uuid");
const { ObjectID } = require("mongodb");
global.uuid = uuidv1;
global.allowedImageTypes = ["jpg", "jpeg", "png", "svg"];

// ############################## ROUTES
const rUsers = require(path.join(__dirname, "routes", "users.js"));
const rPosts = require(path.join(__dirname, "routes", "posts.js"));
const rContacts = require(path.join(__dirname, "routes", "contacts.js"));
const rChats = require(path.join(__dirname, "routes", "chats.js"));

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(express.json());

app.use(cors());

// Import the mongo client server - require the npm library and call the MongoClient property
const mongoClient = require("mongodb").MongoClient;
// Mongo url
const mongoUrl = "mongodb://localhost:27017/";
// Get access to object id in mongo
global.ObjectID = require("mongodb").ObjectID;

// THE DATABASE
global.db = "";
global.usersCollection;

// ############################## CONNECTION TO COLLECTIONS
mongoClient.connect(
  // Connecting to the Mongo client server, passing the url, useUnifiedTopology (middelware), and callback with error and response
  mongoUrl,
  {
    useUnifiedTopology: true,
  },
  (err, response) => {
    if (err) {
      console.log("cannot use mongo");
      return;
    }
    console.log("connected to mongo");
    db = response.db("facebook");
    usersCollection = db.collection("users");
    usersCollection.createIndex(
      {
        email: 1,
      },
      {
        unique: true,
      }
    );
  }
);

// ############################## ROUTES
app.use(rUsers);
app.use(rPosts);
app.use(rContacts);
app.use(rChats);

// ############################## SERVER AND PORT

const port = process.env.PORT || 80;

const server = app.listen(port, (err) => {
  if (err) {
    console.log("server cannot listen");
  }
  console.log(`server listening to port ${server.address().port}`);
});

// SOCKETS
let counter = 0;
let io = require("socket.io")(server);
io.on("connection", (socket) => {
  counter++;
  // EVERYTIME THE USER CONNECTS - JOIN A ROOM

  // req from user to server (on) --> socket on event name
  socket.on("chatRoom", (userID, contactID) => {
    console.log(`The user is ${userID}, the contact is ${contactID}`);

    if (userID < contactID) {
      socket.join(`${userID}-${contactID}`);
    }
    else {
      socket.join(`${contactID}-${userID}`);
    }
  });

  socket.on("message", async (from, to, message) => {
    console.log(from, to, message);
    let timestamp = Math.round(new Date().getTime() / 1000);

    let toUser = await usersCollection.findOne({ _id: new ObjectID(to) });
    let fromUser = await usersCollection.findOne({ _id: new ObjectID(from) });

    console.log(toUser);
    console.log(fromUser);

    try {
      await usersCollection.findOneAndUpdate({ '_id': new ObjectID(toUser._id), 'contacts.contactID': String(fromUser._id) },
        {
          $push: { 'contacts.$.chat': message, "notifications": { '_id': new ObjectID(), 'type': 'message', 'body': " has sent you a message", 'userID': fromUser._id, 'timestamp': timestamp } }
          // $push: { "notifications": { '_id': new ObjectID(), 'type': 'request', 'body': " has accepted your friend request", 'userID': user._id, 'timestamp': timestamp } }
        }, async (err, jMongoResponseUser) => {
          if (err) {
            console.log(err.errmsg);
            return res.status(500).json({
              response: "Something went wrong processing the MongoDB request",
              type: "error"
            });
          }
          console.log(jMongoResponseUser.value);
          if (!jMongoResponseUser.value)
            return res.status(401).json({
              response: "Something went wrong updating the friendship status",
              type: "error"
            });

          // TRY CATCH 2 - UPDATING CONTACTS ARRAY
          try {
            await usersCollection.findOneAndUpdate({ '_id': new ObjectID(fromUser._id), 'contacts.contactID': String(toUser._id) },
              {
                $push: { 'contacts.$.chat': message, },
              }, async (err, jMongoResponseContact) => {
                // "notifications": { '_id': new ObjectID(), 'type': 'request', 'body': "has sent you a friend request", 'userID': user._id } 
                if (err) {
                  console.log(err.errmsg);
                  return res.status(500).json({
                    response: "Something went wrong processing the MongoDB request",
                    type: "error"
                  });
                }
                console.log(jMongoResponseContact.value);
                if (!jMongoResponseContact.value)
                  return console.log('Something went wrong updating the friendship status');


                return console.log("success");
              })
          } catch (error) {
            return console.log(error, "Something went wrong updating the user collection in the to user");

          } // END TRY CATCH 2 - UPDATING POST ARRAY
        })
    } catch (error) {
      return console.log(error, "Something went wrong updating the user collection in the from user");

    } // END TRY CATCH 2 - UPDATING POST ARRAY

    let roomName;
    if (toUser._id < fromUser._id) {
      roomName = `${toUser._id}-${fromUser._id}`;
    } else {
      roomName = `${fromUser._id}-${toUser._id}`;
    }

    // EMIT THE EVENT OF A MESSAGE TO THE CLIENT IN THE SPECIFIED ROOM NAME

    io.in(roomName).emit("message", {
      from: fromUser._id,
      message: message,
      timestamp: timestamp,
    });

    // LEAVE THE PRIVATE CHAT ROOM IN THE SOCKET IN THE CLIENT
    socket.on("leaveRoom", (userID, contactID) => {
      let roomName;
      if (contactID < userID) {
        roomName = `${contactID}-${userID}`;
      } else {
        roomName = `${userID}-${contactID}`;
      }

      console.log(`Leaving room ${roomName}`);

      socket.leave(roomName);
    });
  });
});

// ############################## protect from crash when there is errors
process.on("uncaughtException", (err, data) => {
  if (err) {
    console.log("critical error, yet system kept running" + err);
    return;
  }
});
