// ############################## ROUTES FOR POSTS
const escape = require("escape-html");
const AuthHandler = require("./../AuthHandler");
const { ObjectID } = require("mongodb");

// POSTS //

// ############################# CREATE POST // COMBINED WORKING BUT NOT NICE STRUCTURE, GETTING CLOSER
router.post("/post", AuthHandler, async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).json({ response: "The given user is not authorized", type: "error" });
    const user = req.user;
    // TRY CATCH 1: PARSING FORM
    try {
        const form = formidable({
            multiples: true,
        });
        // PARSING FORM
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    message: "Something went wrong with parsing the form!",
                    type: "error",
                });
            }

            let timestamp = Math.round(new Date().getTime() / 1000);
            let post;

            let fieldsToUpdate = {};
            fieldsToUpdate._id = new ObjectID();
            fieldsToUpdate.timestamp = timestamp;
            fieldsToUpdate.likes = [];
            fieldsToUpdate.comments = [];

            fieldsToUpdate.userID = req.user._id;
            // LOOPING FIELDS
            for (let [key, value] of Object.entries(fields)) {
                if (key !== "img") {
                    if (!value) return res.status(400).json({
                        response: "Please fill out all the required fields",
                        type: "error"
                    });
                    value = escape(value);
                    fieldsToUpdate[key] = value;
                }
            }

            if (files.img !== undefined) {
                // DETECTING FILE DETAILS
                await detect.fromFile(files.img.path, async (err, result) => {
                    if (err) {
                        return res.status(500).json({ response: "Error in detecting file details", type: "error" });
                    }
                    if (result) {
                        // return res.status(500).json({ response: "No image detected", type: "error" });
                        if (!allowedImageTypes.includes(result.ext)) {
                            return res.send("image not allowed");
                        }
                        // CREATE UNIQUE FILE NAME WITH UUID FUNCTION
                        const imgName = uuid() + "." + result.ext;
                        fieldsToUpdate.img = imgName;

                        // MOVING PROFILE IMAGE TO NEW PATH
                        const currentPath = files.img.path;
                        const newPath = path.join(
                            __dirname,
                            "..",
                            "..",
                            "public",
                            "images",
                            "posts",
                            imgName
                        );

                        // MOVE FILE
                        await fs.rename(currentPath, newPath, async (err) => {
                            if (err) {
                                return res.status(500).send("Error moving the file");
                            }
                        }) // END MOVE FILE

                        post = {
                            ...fieldsToUpdate,
                            comments: [],
                            likes: []
                        }

                        // IF THE ARRAY OF POSTS IS NOT INITIALIZED
                        if (!req.user.posts) req.user.posts = [];

                        // TRY CATCH 2 - UPDATING POST ARRAY
                        try {
                            await usersCollection.findOneAndUpdate({ _id: new ObjectID(user._id) }, { $push: { 'posts': post } }, (err, jMongoResponse) => {
                                if (err) {
                                    console.log(err.errmsg);
                                    return res.status(500).json({
                                        response: "Something went wrong processing the MongoDB request",
                                        type: "error"
                                    });
                                }

                                if (!jMongoResponse.value)
                                    return res.status(401).json({
                                        response: "Something went wrong updating the user",
                                        type: "error"
                                    });

                                return res.status(200).json({
                                    auth: true,
                                    response: "Create post successful",
                                    data: post,
                                    type: "success"
                                });
                            })
                        } catch (error) {
                            console.log(error);
                            return res.status(500).json({
                                response: "Something went wrong updating the user collection with the post",
                                type: "error"
                            });
                        } // END TRY CATCH 2 - UPDATING POST ARRAY
                    }
                }); // END DETECTING FILE DETAILS
            }
            else {

                post = {
                    ...fieldsToUpdate
                }
                console.log("in the else");
                // IF THE ARRAY OF POSTS IS NOT INITIALIZED
                if (!req.user.posts) req.user.posts = [];

                let posts = [...req.user.posts, post];

                // TRY CATCH 2 - UPDATING USER COLLECTION WITH POST
                try {
                    // UPDATING USER COLLECTION WITH POST
                    usersCollection.findOneAndUpdate({ _id: new ObjectID(user._id) }, { $push: { 'posts': post } }, (err, jMongoResponse) => {
                        if (err) {
                            console.log(err.errmsg);
                            return res.status(500).json({
                                response: "Something went wrong processing the MongoDB request",
                                type: "error"
                            });
                        }

                        if (!jMongoResponse.value)
                            return res.status(401).json({
                                response: "Something went wrong updating the user",
                                type: "error"
                            });

                        return res.status(200).json({
                            auth: true,
                            response: "Create post successful",
                            data: post,
                            type: "success"
                        });
                    }) // END UPDATING USER COLLECTION WITH POST
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({
                        response: "Something went wrong updating the user collection with the post",
                        type: "error"
                    });
                } // END TRY CATCH 2 - UPDATING USER COLLECTION WITH POST

            }
        }); // END PARSING FORM
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong creating the post",
            type: "error"
        });
    } // END TRY CATCH 1: PARSING FORM
});

// ############################# UPDATE POST // COMBINED WORKING BUT NOT NICE STRUCTURE, GETTING CLOSER
router.patch("/post", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).json({ response: "The given user is not authorized", type: "error" });
    const user = req.user;
    // TRY CATCH 1: PARSING FORM
    try {
        const form = formidable({
            multiples: true,
        });
        // PARSING FORM
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    message: "Something went wrong with parsing the form!",
                    type: "error",
                });
            }
            let post;
            let fieldsToUpdate = {};

            const postID = fields.postID;
            if (!postID) return res.status(400).json({
                response: "Missing ID",
                type: "error"
            });

            fieldsToUpdate._id = new ObjectID(postID);
            // LOOPING FIELDS
            for (let [key, value] of Object.entries(fields)) {
                if (key !== "img") {
                    if (!value) return res.status(400).json({
                        response: "Please fill out all the required fields",
                        type: "error"
                    });
                    value = escape(value);
                    fieldsToUpdate[key] = value;
                }
            }

            delete fieldsToUpdate.postID;

            if (files.img !== undefined) {
                // DETECTING FILE DETAILS
                await detect.fromFile(files.img.path, async (err, result) => {
                    if (err) {
                        return res.status(500).json({ response: "Error in detecting file details", type: "error" });
                    }
                    if (result) {
                        if (!allowedImageTypes.includes(result.ext)) {
                            return res.send("image not allowed");
                        }
                        // CREATE UNIQUE FILE NAME WITH UUID FUNCTION
                        const imgName = uuid() + "." + result.ext;
                        fieldsToUpdate.img = imgName;

                        // MOVING PROFILE IMAGE TO NEW PATH
                        const currentPath = files.img.path;
                        const newPath = path.join(
                            __dirname,
                            "..",
                            "..",
                            "public",
                            "images",
                            "posts",
                            imgName
                        );

                        // MOVE FILE
                        await fs.rename(currentPath, newPath, async (err) => {
                            if (err) {
                                return res.status(500).send("Error moving the file");
                            }
                        }) // END MOVE FILE

                        post = {
                            ...fieldsToUpdate
                        }

                        // TRY CATCH 2 - UPDATING POST ARRAY
                        try {
                            await usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) }, { $set: { 'posts.$.body': fieldsToUpdate.body, 'posts.$.img': fieldsToUpdate.img } }, (err, jMongoResponse) => {
                                console.log(jMongoResponse);
                                if (err) {
                                    console.log(err.errmsg);
                                    return res.status(500).json({
                                        response: "Something went wrong processing the MongoDB request",
                                        type: "error"
                                    });
                                }

                                if (!jMongoResponse.value)
                                    return res.status(401).json({
                                        response: "Something went wrong updating the user",
                                        type: "error"
                                    });

                                return res.status(200).json({
                                    auth: true,
                                    response: "Update post successful",
                                    data: post,
                                    type: "success"
                                });
                            })
                        } catch (error) {
                            console.log(error);
                            return res.status(500).json({
                                response: "Something went wrong updating the user collection with the post",
                                type: "error"
                            });
                        } // END TRY CATCH 2 - UPDATING POST ARRAY
                    }
                }); // END DETECTING FILE DETAILS
            } else {

                if (fields.removed === "true") {
                    console.log("image is removed");
                    delete fieldsToUpdate.removed;
                    // TRY CATCH 2 - UPDATING POST ARRAY
                    try {
                        await usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) }, { $set: { 'posts.$.body': fieldsToUpdate.body, 'posts.$.img': "" } }, (err, jMongoResponse) => {
                            if (err) {
                                console.log(err.errmsg);
                                return res.status(500).json({
                                    response: "Something went wrong processing the MongoDB request",
                                    type: "error"
                                });
                            }

                            if (!jMongoResponse.value)
                                return res.status(401).json({
                                    response: "Something went wrong updating the user",
                                    type: "error"
                                });

                            return res.status(200).json({
                                auth: true,
                                response: "Update post successful",
                                data: post,
                                type: "success"
                            });
                        })
                    } catch (error) {
                        console.log(error);
                        return res.status(500).json({
                            response: "Something went wrong updating the user collection with the post",
                            type: "error"
                        });
                    } // END TRY CATCH 2 - UPDATING POST ARRAY
                }
                post = {
                    ...fieldsToUpdate
                }

                // TRY CATCH 2 - UPDATING POST ARRAY
                try {
                    await usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) }, { $set: { 'posts.$.body': fieldsToUpdate.body } }, (err, jMongoResponse) => {
                        if (err) {
                            console.log(err.errmsg);
                            return res.status(500).json({
                                response: "Something went wrong processing the MongoDB request",
                                type: "error"
                            });
                        }

                        if (!jMongoResponse.value)
                            return res.status(401).json({
                                response: "Something went wrong updating the user",
                                type: "error"
                            });

                        return res.status(200).json({
                            auth: true,
                            response: "Update post successful",
                            data: post,
                            type: "success"
                        });
                    })
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({
                        response: "Something went wrong updating the user collection with the post",
                        type: "error"
                    });
                } // END TRY CATCH 2 - UPDATING POST ARRAY
            }

        }); // END PARSING FORM
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong creating the post",
            type: "error"
        });
    } // END TRY CATCH 1: PARSING FORM
});

// ############################# DELETE POST √
router.delete("/post/:postID", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).json({ response: "The given user is not authorized", type: "error" });
    const user = req.user;
    console.log(req.user);

    const { postID } = req.params;
    if (!postID) return res.status(400).json({
        response: "Missing ID",
        type: "error"
    });

    usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) }, { $pull: { 'posts': { _id: new ObjectID(postID) } } }, (err, jMongoResponse) => {
        if (err) {
            console.log(err.errmsg);
            return res.status(500).json({
                response: "Something went wrong processing the MongoDB request",
                type: "error"
            });
        }

        if (!jMongoResponse.value)
            return res.status(401).json({
                response: "Something went wrong updating the user",
                type: "error"
            });

        return res.status(200).json({
            auth: true,
            response: "Deleting post successful",
            data: jMongoResponse,
            type: "success"
        });
    });
});

// ############################# READ LOGGED USERS POSTS
router.get("/profile/posts", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");

    // TRY CATCH 1: FINDING POSTS
    try {
        // FINDING POSTS
        await usersCollection.findOne(
            {
                _id: new ObjectID(req.user._id),
                isActive: 1,
                status: 1,
            },
            async (err, jMongoResponse) => {
                if (err) {
                    console.log(err.errmsg);
                    return res.status(500).json({
                        response: "Something went wrong processing the MongoDB request",
                        type: "error"
                    });
                }

                if (!jMongoResponse)
                    return res.status(401).json({
                        response: "The given user is not authorized",
                        type: "error"
                    });

                if (!jMongoResponse.posts) return res.status(404).json({
                    response: "No posts",
                    data: [],
                    type: "error"
                });
                // SORT BY NEWEST POSTS
                await jMongoResponse.posts.sort(function (a, b) { return b.timestamp - a.timestamp });

                return res.status(200).json({
                    auth: true,
                    data: jMongoResponse.posts,
                    response: "Fetching users posts successful",
                    type: "success"
                });
            })
        // END FINDING POSTS

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong reading the user's posts",
        });
    } // END TRY CATCH 1: FINDING POSTS
});

// ############################# READ ALL POSTS FROM ALL USERS
router.get("/posts", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    const user = req.user;
    try {
        const users = await usersCollection.find().toArray();
        // console.log(users);
        let posts = [];
        users.map((user) => {
            if (user.posts) {
                user.posts.map((post) => {
                    // console.log(post);
                    let public_json = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        img: user.img,
                        status: user.status
                    };

                    post.user = public_json;
                    // console.log(post);

                    posts = [...posts, post]
                })
            }
        })

        await posts.sort(function (a, b) { return b.timestamp - a.timestamp });
        return res.status(200).json({
            auth: true,
            data: posts,
            response: "Fetching all posts successful",
            type: "success"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong reading all posts",
        });
    } // END TRY CATCH 1: FINDING POSTS
});

// ############################# READ ALL POSTS (CONTACTS)
router.get("/contacts/posts", AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    const user = req.user;
    // TRY CATCH 1: FINDING POSTS
    try {
        const contacts = await usersCollection.find({ 'contacts': { $elemMatch: { 'contactID': user._id } } }).project({ 'posts': 1, 'firstName': 1, 'lastName': 1, 'img': 1, 'status': 1 }).toArray();
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

// LIKES //

// ############################# LIKE POST √
router.post('/like', AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");

    console.log(req);
    const { postID } = req.body;

    if (!postID) return res.status(400).json({
        response: "Missing ID",
        type: "error"
    });
    const user = req.user;
    let timestamp = Math.round(new Date().getTime() / 1000);

    try {
        const postOwner = await usersCollection.find({ 'posts._id': new ObjectID(postID) }, { 'userID': user._id }).project({ 'posts.likes': 1, 'posts._id': 1, 'posts.body': 1 }).toArray();
        postOwner[0].posts.map(post => {
            if (post._id.toString() === postID) {
                if (post.hasOwnProperty('likes')) {
                    post.likes.map(like => {
                        if (like.userID.toString() === user._id.toString()) {
                            return res.status(500).send({ error: 'Already liked by you' })
                        }
                    })
                }
            }
        })

        let fieldsToUpdate = {
            // _id: new ObjectID(),
            userID: user._id,
            post_id: new ObjectID(postID),
            timestamp: timestamp,
            firstName: user.firstName,
            lastName: user.lastName,
            img: user.img,
            status: user.status
        };

        let like = {
            ...fieldsToUpdate
            // user: user
        }

        try {
            await usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) },
                { $push: { 'posts.$.likes': like } }, (err, jMongoResponse) => {
                    // { $push: { 'posts.$.likes': { 'userID': user._id, 'firstName': user.firstName, 'lastName': user.lastName } } }, (err, jMongoResponse) => {
                    if (err) {
                        console.log(err.errmsg);
                        return res.status(500).json({
                            response: "Something went wrong processing the MongoDB request",
                            type: "error"
                        });
                    }

                    if (!jMongoResponse.value)
                        return res.status(401).json({
                            response: "Something went wrong updating the user",
                            type: "error"
                        });

                    return res.status(200).json({
                        auth: true,
                        response: "Adding a like to the post successful",
                        data: jMongoResponse,
                        type: "success"
                    });
                })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                response: "Something went wrong adding a like to the post",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong adding a like to the post",
        });
    }
})

// ############################# UNLIKE POST √
router.delete('/like/:postID', AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    const { postID } = req.params;

    if (!postID) return res.status(400).json({ response: "Missing ID", type: "error" });
    const user = req.user;

    try {
        usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) }, { $pull: { 'posts.$.likes': { 'userID': user._id } } }, (err, jMongoResponse) => {
            if (err) {
                console.log(err.errmsg);
                return res.status(500).json({
                    response: "Something went wrong processing the MongoDB request",
                    type: "error"
                });
            }

            console.log(jMongoResponse.value);
            if (!jMongoResponse.value)
                return res.status(401).json({
                    response: "Something went wrong updating the user",
                    type: "error"
                });

            return res.status(200).json({
                auth: true,
                response: "Deleting a like from the post successful",
                data: jMongoResponse,
                type: "success"
            });

        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong deleting a like from the post",
        });
    }
});

// COMMENTS //

// ############################# COMMENT POST √
router.post('/comment', AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");

    const { postID, body } = req.body
    const user = req.user;

    if (!postID || !body) return res.status(400).json({ response: 'Please fill out all the required fields', type: "error" })
    let timestamp = Math.round(new Date().getTime() / 1000);
    let comment;

    let fieldsToUpdate = {
        _id: new ObjectID(),
        timestamp: timestamp,
        body: body,
        post_id: new ObjectID(postID),
        userID: user._id
    };

    comment = {
        ...fieldsToUpdate
        // user: user
    }
    try {
        usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) }, { $push: { 'posts.$.comments': comment } }, (err, jMongoResponse) => {
            if (err) {
                console.log(err.errmsg);
                return res.status(500).json({
                    response: "Something went wrong processing the MongoDB request",
                    type: "error"
                });
            }

            if (!jMongoResponse.value)
                return res.status(401).json({
                    response: "Something went wrong updating the user",
                    type: "error"
                });

            return res.status(200).json({
                auth: true,
                response: "Creating a comment on the post successful",
                data: jMongoResponse,
                type: "success"
            });
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong creating a comment on the post",
        });
    }
})

// ############################# DELETE COMMENT √
router.delete('/comment/:postID/:commentID', AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    console.log(req.params);

    const { postID, commentID } = req.params
    const user = req.user;

    if (!postID || !commentID) return res.status(400).json({ response: 'Missing IDs', type: "error" });

    try {
        usersCollection.findOneAndUpdate({ 'posts._id': new ObjectID(postID) }, { $pull: { 'posts.$.comments': { '_id': new ObjectID(commentID) } } }, (err, jMongoResponse) => {
            if (err) {
                console.log(err.errmsg);
                return res.status(500).json({
                    response: "Something went wrong processing the MongoDB request",
                    type: "error"
                });
            }

            if (!jMongoResponse.value)
                return res.status(401).json({
                    response: "Something went wrong updating the user",
                    type: "error"
                });

            return res.status(200).json({
                auth: true,
                response: "Deleting a comment from the post successful",
                data: jMongoResponse,
                type: "success"
            });
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong deleting a comment from the post",
        });
    }
})

// ############################# UPDATE COMMENT √
router.put('/comment', AuthHandler, async (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    const { postID, commentID, body, timestamp } = req.body;
    console.log(req.body);
    const user = req.user;
    try {
        usersCollection.updateOne(
            { 'posts._id': new ObjectID(postID) },
            { $set: { "posts.$.comments.$[inner].body": body, "posts.$.comments.$[inner].timestamp": timestamp } },
            {
                arrayFilters: [{ 'inner._id': new ObjectID(commentID) }],
                upsert: true
            }, (error, jMongoResponse) => {
                console.log(jMongoResponse);
                if (error) {
                    console.log(err.errmsg);
                    return res.status(500).json({
                        response: "Something went wrong processing the MongoDB request",
                        type: "error"
                    });
                }

                if (jMongoResponse.matchedCount !== 1)
                    return res.status(401).json({
                        response: "Something went wrong finding the comment",
                        type: "error"
                    });

                if (jMongoResponse.modifiedCount !== 1)
                    return res.status(401).json({
                        response: "The new comment is identical to the old one",
                        type: "error"
                    });

                return res.status(200).json({
                    auth: true,
                    response: "Updating a comment from the post successful",
                    data: body,
                    type: "success"
                });
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            response: "Something went wrong updating a comment from the post",
        });
    }
})

module.exports = router;