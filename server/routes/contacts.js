const AuthHandler = require("../AuthHandler.js");
const { ObjectID } = require("mongodb");

// ############################# GET ALL NOTIFICATIONS

router.get("/notifications", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    const user = req.user;
    if (!user.notifications.length) return res.status(404).send({ response: "no notifications" });
    return res.status(200).send({
        response: "Your notifications",
        data: user.notifications.sort(
            (a, b) => b.timestamp - a.timestamp
        ),
    });
});

// ############################# GET ALL CONTACTS
router.get("/contacts", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    const user = req.user;
    // TRY CATCH 1: FINDING POSTS
    try {
        const contacts = await usersCollection.find({ 'contacts': { $elemMatch: { 'contactID': String(user._id), 'status': "accept" } } }).toArray();
        return res.status(200).json({
            // contacts
            auth: true,
            data: contacts,
            response: "Fetching all posts successful from contacts",
            type: "success"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong reading all posts",
        });
    } // END TRY CATCH 1: FINDING POSTS
});

// ############################# ACCEPT CONTACT
router.get("/contact/accept/:contactID/:notificationID", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).json({ response: "The given user is not authorized", type: "error" });
    const user = req.user;
    let { contactID, notificationID } = req.params;
    let timestamp = Math.round(new Date().getTime() / 1000);
    console.log(contactID);

    if (!contactID) return res.status(400).json({
        response: "Missing ID",
        type: "error"
    });

    contactID = escape(contactID);

    // TRY CATCH 2: FINDING CONTACT
    try {
        // FINDING USER 
        const contact = await usersCollection.findOne({ _id: new ObjectID(contactID) })
        if (!contact) return res.status(500).json({
            response:
                "User doesn't exist",
            type: "error"
        });
        // END FINDING USER

        // FINDING EXISTING CONTACT
        const existingContact = user.contacts.find(contact => contact.contactID === contactID && contact.status === "pending");
        if (!existingContact) return res.status(500).json({
            response:
                "No pending request",
            type: "error"
        });
        // END FINDING EXISTING CONTACT

        console.log(contact);

        // TRY CATCH 2 - UPDATING CONTACTS ARRAY
        try {
            await usersCollection.findOneAndUpdate({ '_id': new ObjectID(user._id), 'contacts.contactID': contactID },
                {
                    $set: { 'contacts.$.status': "accept" },
                    $pull: { "notifications": { "_id": new ObjectID(notificationID) } }
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
                        await usersCollection.findOneAndUpdate({ '_id': new ObjectID(contact._id), 'contacts.contactID': String(user._id) },
                            {
                                $set: { 'contacts.$.status': "accept", },
                                $push: { "notifications": { '_id': new ObjectID(), 'type': 'request', 'body': " has accepted your friend request", 'userID': user._id, 'timestamp': timestamp } }
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
                                    return res.status(401).json({
                                        response: "Something went wrong updating the friendship status",
                                        type: "error"
                                    });

                                return res.status(200).json({
                                    response: "Friendship request accepted successfully",
                                    user: jMongoResponseUser.value,
                                    contact: jMongoResponseContact.value,
                                    accepted: 1
                                })
                            })
                    } catch (error) {
                        console.log(error);
                        return res.status(500).json({
                            response: "Something went wrong updating the user collection with the new friendship status",
                            type: "error"
                        });
                    } // END TRY CATCH 2 - UPDATING POST ARRAY
                })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                response: "Something went wrong updating the user collection with the new friendship status",
                type: "error"
            });
        } // END TRY CATCH 2 - UPDATING POST ARRAY

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong finding the contact",
            type: "error"
        });
    }
});

// ############################# SEND CONTACT REQUEST
router.get("/contact/:contactID", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).json({ response: "The given user is not authorized", type: "error" });
    const user = req.user;
    let { contactID } = req.params;
    let timestamp = Math.round(new Date().getTime() / 1000);

    if (!contactID) return res.status(400).json({
        response: "Missing ID",
        type: "error"
    });

    contactID = escape(contactID);

    if (!user.contacts) user.contacts = [];

    // TRY CATCH 2: FINDING CONTACT
    try {
        // FINDING USER 
        const contact = await usersCollection.findOne({ _id: new ObjectID(contactID) })
        if (!contact) return res.status(500).json({
            response:
                "User doesn't exist",
            type: "error"
        });
        // END FINDING USER

        console.log(contact);

        // FINDING EXISTING CONTACT
        const existingContact = user.contacts.find(contact => contact.contactID === contactID);
        if (existingContact) return res.status(500).json({
            response:
                "Contact already exists",
            type: "error"
        });
        // END FINDING EXISTING CONTACT

        // SETTING BULK UPDATE ARRAY OF OBJECTS
        const bulkUpdateOps = [
            {
                "updateOne": {
                    "filter": { _id: new ObjectID(user._id) },
                    // "update": { "$push": { "contacts": { 'contactID': contactID, firstName: contact.firstName, lastName: contact.lastName, img: contact.img, status: contact.status, chat: [] } } }
                    "update": { "$push": { "contacts": { 'contactID': contactID, chat: [], status: "pending" } } }
                }
            },
            {
                "updateOne": {
                    "filter": { _id: new ObjectID(contact._id) },
                    // "update": { "$push": { "contacts": { 'contactID': user._id, firstName: user.firstName, lastName: user.lastName, img: user.img, status: user.status, chat: [] } } }
                    "update": { "$push": { "contacts": { 'contactID': String(user._id), chat: [], status: "pending" }, "notifications": { '_id': new ObjectID(), 'type': 'request', 'body': " has sent you a friend request", 'userID': user._id, 'timestamp': timestamp } } }
                }
            }
        ];
        // END SETTING BULK UPDATE ARRAY OF OBJECTS
        // TRY CATCH 2: ADDING CONTACT
        try {
            // ADDING CONTACT
            await usersCollection.bulkWrite(bulkUpdateOps, { "ordered": true, "w": 1 }, (err, jMongoResponse) => {
                if (err) { console.log(err); return res.status(500).send({ error: err }); }
                return res.status(200).json({
                    response: "Friendship request sent successfully",
                    data: jMongoResponse,
                    status: "pending"
                })
            })
            // END ADDING CONTACT
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                response: "Something went wrong adding the contact",
                type: "error"
            });
        }// END TRY CATCH 3: ADDING CONTACT
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong finding the contact",
            type: "error"
        });
    }
});

// ############################# DECLINE CONTACT REQUEST
router.delete("/contact/:contactID/:notificationID", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).json({ response: "The given user is not authorized", type: "error" });

    const user = req.user;

    let { contactID, type, notificationID } = req.params;

    if (!contactID) return res.status(400).json({
        response: "Missing ID",
        type: "error"
    });

    contactID = escape(contactID);

    // FINDING EXISTING CONTACT
    const existingContact = user.contacts.find(contact => contact.contactID === contactID);
    if (!existingContact) return res.status(500).json({
        response:
            "Contact not found",
        type: "error"
    });

    // SETTING BULK UPDATE ARRAY OF OBJECTS
    const bulkUpdateOps = [
        {
            "updateOne": {
                "filter": { _id: new ObjectID(user._id) },
                "update": { "$pull": { "contacts": { 'contactID': contactID }, "notifications": { "_id": new ObjectID(notificationID) } } }
            }
        },
        {
            "updateOne": {
                "filter": { _id: new ObjectID(contactID) },
                "update": { "$pull": { "contacts": { 'contactID': String(user._id) } } }
            }
        }
    ];
    // END SETTING BULK UPDATE ARRAY OF OBJECTS

    // TRY CATCH 2: REMOVING CONTACT
    try {
        // REMOVING CONTACT
        await usersCollection.bulkWrite(bulkUpdateOps, { "ordered": true, "w": 1 }, (err, jMongoResponse) => {
            if (err) { console.log(err); return res.status(500).send({ error: err }); }
            return res.status(200).json({ response: `Friendship successfully ${type}`, data: jMongoResponse })
        })
        // END REMOVING CONTACT
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong removing the contact",
            type: "error"
        });
    }// END TRY CATCH 3: REMOVING FRIENDSHIP

    // END FINDING EXISTING CONTACT
});

// ############################# DELETE CONTACT
router.delete("/contact/:contactID/", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).json({ response: "The given user is not authorized", type: "error" });

    const user = req.user;

    let { contactID, type } = req.params;

    if (!contactID) return res.status(400).json({
        response: "Missing ID",
        type: "error"
    });

    contactID = escape(contactID);

    // FINDING EXISTING CONTACT
    const existingContact = user.contacts.find(contact => contact.contactID === contactID);
    if (!existingContact) return res.status(500).json({
        response:
            "Contact not found",
        type: "error"
    });

    // SETTING BULK UPDATE ARRAY OF OBJECTS
    const bulkUpdateOps = [
        {
            "updateOne": {
                "filter": { _id: new ObjectID(user._id) },
                "update": { "$pull": { "contacts": { 'contactID': contactID } } }
            }
        },
        {
            "updateOne": {
                "filter": { _id: new ObjectID(contactID) },
                "update": { "$pull": { "contacts": { 'contactID': String(user._id) } } }
            }
        }
    ];
    // END SETTING BULK UPDATE ARRAY OF OBJECTS

    // TRY CATCH 2: REMOVING CONTACT
    try {
        // REMOVING CONTACT
        await usersCollection.bulkWrite(bulkUpdateOps, { "ordered": true, "w": 1 }, (err, jMongoResponse) => {
            if (err) { console.log(err); return res.status(500).send({ error: err }); }
            return res.status(200).json({ response: `Friendship successfully deleted`, data: jMongoResponse })
        })
        // END REMOVING CONTACT
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong removing the contact",
            type: "error"
        });
    }// END TRY CATCH 3: REMOVING FRIENDSHIP

    // END FINDING EXISTING CONTACT
});

module.exports = router;