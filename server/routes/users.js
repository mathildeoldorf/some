// ############################## ROUTES FOR USERS
const escape = require("escape-html");
const bcrypt = require("bcryptjs");
const AuthHandler = require("./../AuthHandler");
const { ObjectID } = require("mongodb");

const alphaCharacterValidation = /[a-zA-Z -]/;
const emailValidation = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
let saltRounds = 10;

// ############################# SIGNUP ** TODO: CAN IT BE DYNAMIC?
router.post("/signup", (req, res) => {
  // TRY CATCH 1 - PARSING FORM

  let { firstName, lastName, email, password, repeatPassword } = req.body;

  console.log(req.body);
  if (!firstName || !lastName || !email || !password || !repeatPassword)
    return res.status(400).json({
      response: "Please fill out all the required fields",
    });

  firstName = escape(firstName);
  lastName = escape(lastName);
  email = escape(email);
  password = escape(password);
  repeatPassword = escape(repeatPassword);

  if (firstName.length < 2 || firstName.length > 50)
    return res.status(400).json({
      response: "Your first name must be between 2 and 50 characters",
      type: "error"
    });

  if (lastName.length < 2 || lastName.length > 50)
    return res.status(400).json({
      response: "Your last name must be between 2 and 50 characters",
      type: "error"
    });

  if (password.length < 8 || password.length > 20)
    return res.status(400).json({
      response: "Your password must be between 8 and 20 characters",
      type: "error"
    });

  if (password !== repeatPassword)
    return res.status(400).json({
      response: "The passwords doesn't match",
      type: "error"
    });

  if (emailValidation.test(email) === false)
    return res.status(400).json({
      response: "Please enter a valid e-mail",
      type: "error"
    });

  // ENCRYPT PASSWORD
  bcrypt.hash(password, saltRounds, async (error, hashedPassword) => {
    if (error)
      return res.status(500).json({
        response:
          "Something went wrong hashing the password, please try again",
        type: "error"
      });

    const id = new ObjectID;

    // TRY CATCH 1 - SIGNUP USER
    try {
      // SIGNUP USER
      await usersCollection.insertOne(
        {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hashedPassword,
          isActive: 1,
          status: 1,
          img: "userThumbnail.png",
          cover: "cover.jpg",
          chats: [],
          contacts: [],
          posts: [],
          notifications: []
        },
        async (err, jMongoResponse) => {
          if (err) {
            console.log(err.errmsg);
            if (err.code === 11000)
              return res.status(500).json({
                response:
                  "The given e-mail is already registered. Please login in",
                type: "error"
              });
            return res.status(500).json({
              response:
                "Something went wrong processing the MongoDB request",
              type: "error"
            });
          }

          let user = jMongoResponse.ops[0];

          delete user.password;

          const token = jwt.sign(
            { ...user }, config.secret,
            {
              expiresIn: 86400, // expires in 24 hours
            }
          );

          return res.status(200).json({
            auth: true,
            token: token,
            type: "success"
          });
        }
      ); // END SIGNUP USER
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        response: "Something went wrong signing up",
        type: "error"
      });
    } // END TRY CATCH 1 - SIGNUP USER
  }); // END ENCRYPT PASSWORD
});

// ############################# REACTIVATE user ** TODO: CAN IT BE DYNAMIC?
router.post("/reactivate", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const form = formidable({
    multiples: true,
  });

  // TRY CATCH 1 - PARSING FORM
  try {
    // PARSING FORM
    form.parse(req, async (err, fields, files) => {
      if (!fields.txtEmail || !fields.txtPassword) {
        return res.status(400).json({
          response: "Please fill out all the required fields",
          type: "error"
        });
      }
      let email = escape(fields.txtEmail);
      let password = escape(fields.txtPassword);

      if (emailValidation.test(email) === false) {
        return res.status(400).json({
          response: "Please enter a valid e-mail",
          type: "error"
        });
      }
      if (password.length < 8 || password.length > 20) {
        return res.status(400).json({
          response: "Your password must be between 8 and 20 characters",
          type: "error"
        });
      }

      // TRY CATCH 2 - FIND EXISTING USER
      try {
        // FIND EXISTING USER
        await usersCollection.findOne({ email: email, isActive: 0, status: 0, }, async (err, jMongoResponse) => {
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

          // COMPARE ENCRYPT PASSWORD
          bcrypt.compare(password, jMongoResponse.password, async (error, isValid) => {
            if (error)
              return res.status(500).json({
                response:
                  "Something went wrong hashing password, please try again",
                type: "error"
              });
            if (!isValid)
              return res.status(401).json({
                auth: false,
                token: null,
                response:
                  "The given user is not authorized, the given password is incorrect.",
                type: "error"
              });

            // TRY CATCH 3 - REACTIVATING USER
            try {
              // REACTIVATING USER
              await usersCollection.updateOne({ email: email, password: jMongoResponse.password, isActive: 0, status: 0, },
                { $set: { isActive: 1, status: 1, }, }, (err, jMongoUpdateResponse) => {
                  if (err) {
                    console.log(err.errmsg);
                    return res.status(500).json({
                      response:
                        "Something went wrong processing the MongoDB request",
                      type: "error"
                    });
                  }
                  if (jMongoUpdateResponse.modifiedCount !== 1)
                    return res.status(500).json({
                      response:
                        "Something went wrong reactivating the user",
                      type: "error"
                    });

                  const token = jwt.sign(
                    {
                      id: jMongoResponse._id,
                      firstName: jMongoResponse.firstName,
                      lastName: jMongoResponse.lastName,
                      email: jMongoResponse.email,
                      isActive: jMongoUpdateResponse.result.ok,
                      status: jMongoUpdateResponse.result.ok,
                    }, config.secret, { expiresIn: 86400, }
                  );

                  return res.status(200).json({
                    auth: true,
                    token: token,
                    message: "Reactivation successfull",
                    type: "success"
                  });
                }
              ); // END REACTIVATING USER
            } catch (error) {
              if (error) {
                console.log(error);
                return res.status(500).json({
                  response: "Something went wrong reactivating the user",
                  type: "error"
                });
              }
            } // END TRY CATCH 3
          }
          ); // END ENCRYPT PASSWORD
        }
        ); // END FIND EXISTING USER
      } catch (error) {
        if (error) {
          console.log(error);
          return res.status(500).json({
            response: "Something went wrong finding the existing user",
            type: "error"
          });
        }
      } // END TRY CATCH 2
    }); // END PARSING FORM
  } catch (error) {
    if (error) {
      console.log(error);
      return res.status(500).json({
        response: "Something went wrong parsing the form",
        type: "error"
      });
    }
  } // END TRY CATCH 1 - PARSING FORM
});

// ############################## LOGIN ** TODO: CAN IT BE DYNAMIC?
router.post("/login", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  let { email, password } = req.body;
  email = escape(email);
  password = escape(password);


  if (emailValidation.test(email) === false)
    return res.status(400).json({
      response: "Please enter a valid e-mail",
      type: "error"
    });

  if (password.length < 8 || password.length > 20)
    return res.status(400).json({
      response: "Your password must be between 8 and 20 characters",
      type: "error"
    });

  // TRY CATCH 1 - FINDING EXISTING USER
  try {
    // FIND EXISTING USER NOT LOGGED USER
    await usersCollection.findOne({ email: email, isActive: 1, status: 0, }, async (err, jMongoResponse) => {
      if (err) {
        console.log(err.errmsg);
        return res.status(500).json({
          response: "Something went wrong processing the MongoDB request",
          type: "error"
        });
      }

      if (!jMongoResponse)
        return res.status(401).json({
          response: "The given user not authorized",
          type: "error"
        });

      // COMPARE ENCRYPT PASSWORD
      bcrypt.compare(password, jMongoResponse.password, async (error, isValid) => {
        if (error)
          return res.status(500).json({
            response:
              "Something went wrong hashing password, please try again",
            type: "error"
          });
        if (!isValid)
          return res.status(401).json({
            auth: false,
            token: null,
            response:
              "The given user is not authorized, the given password is incorrect.",
            type: "error"
          });

        let user = jMongoResponse;

        // TRY CATCH 2 - LOGGING IN USER
        try {
          // LOGGING IN EXISTING USER
          await usersCollection.updateOne(
            { email: email, password: jMongoResponse.password, isActive: 1, status: 0, },
            { $set: { status: 1, }, }, (err, jMongoUpdateResponse) => {
              if (err) {
                console.log(err.errmsg);
                return res.status(500).json({
                  response:
                    "Something went wrong processing the MongoDB request",
                  type: "error"
                });
              }

              if (jMongoUpdateResponse.modifiedCount !== 1)
                return res.status(500).json({
                  response: "Something went wrong logging in",
                  type: "error"
                });

              user.status = jMongoUpdateResponse.result.ok;
              delete user.password;

              const token = jwt.sign({ ...user }, config.secret, { expiresIn: 86400, });

              return res.status(200).json({
                auth: true,
                token: token,
                data: jMongoResponse,
                type: "success"
              });
            }
          ); // END LOGGING IN EXISTING USER
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            response: "Something went wrong logging in",
            type: "error"
          });
        } // END TRY CATCH 2 - LOGGING IN USER
      }); // END ENCRYPT PASSWORD
    }); // END FIND EXISTING USER
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      response: "Something went wrong finding an existing user",
      type: "error"
    });
  } // END TRY CATCH 1 - FINDING EXISTING USER NOT LOGGED USER
});

// ############################# LOGOUT **
router.get("/logout", AuthHandler, async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  if (!req.user) return res.status(401).send({ response: "The given user is not authorized", type: "error" });

  // TRY CATCH 1 - LOGGING OUT USER
  try {
    // LOGOUT USER
    await usersCollection.updateOne(
      {
        _id: new ObjectID(req.user._id),
        isActive: 1,
        status: 1,
      },
      {
        $set: {
          status: 0,
        },
      },
      (err, jMongoResponse) => {
        if (err) {
          console.log(err.errmsg);
          return res.status(500).json({
            response: "Something went wrong processing the MongoDB request", type: "error"
          });
        }

        if (jMongoResponse.modifiedCount !== 1)
          return res.status(500).json({
            response: "Something went wrong logging out the user",
            type: "error"
          });

        console.log(req.user);
        delete req.user;

        res.status(200).json({
          auth: false,
          token: null,
          response: "Logout successful",
          type: "success",
          user: req.user
        });
      }
    ); // END LOGOUT USER
  } catch (error) {
    if (error) {
      console.log(error);
      return res.status(500).json({
        response: "Something went wrong logging out the user",
        type: "error"
      });
    }
  } // END TRY CATCH 1 - LOGGING OUT USER
});

// ############################# DELETE USER **
router.delete("/profile", AuthHandler, async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  if (!req.user) return res.status(401).json({ response: "The given user is not authorized", type: "error" });

  // TRY CATCH 1 - DELETING USER
  try {
    // DELETE USER
    await usersCollection.updateOne(
      {
        _id: new ObjectID(req.user._id),
        isActive: 1,
        status: 1,
      },
      {
        $set: {
          isActive: 0,
          status: 0,
        },
      },
      (err, jMongoResponse) => {
        if (err) {
          console.log(err.errmsg);
          return res.status(500).json({
            response: "Something went wrong processing the MongoDB request",
            type: "error"
          });
        }

        if (jMongoResponse.modifiedCount !== 1)
          return res.status(500).json({
            response: "Something went wrong deleting the user",
            type: "error"
          });

        res.status(200).json({
          auth: false,
          token: null,
          response: "Deletion successful",
          type: "success"
        });
      }
    ); // END DELETE USER
  } catch (error) {
    if (error) {
      console.log(error);
      return res.status(500).json({
        response: "Something went wrong deleting the user",
        type: "error"
      });
    }
  } // END TRY CATCH 1 - DELETING USER
});

// ############################# READ PROTECTED PROFILE **
router.get("/profile", AuthHandler, async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log(req.user);
  if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user here is not authorized");

  return res.status(200).send({ response: req.user })
});

// ############################# UPDATE PROTECTED PROFILE ONLY FIELDS ** 
router.patch("/profile", AuthHandler, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  if (!req.user) return res.status(401).send({ response: "The given user is not authorized", type: "error" });

  // TRY CATCH 1 - PARSING FORM
  try {
    const form = formidable({
      multiples: true,
    });
    // PARSING FORM
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ response: "Error in fields", type: "error" });
      }

      // TODO: WHY CAN'T I DETECT IF THE FIELD IS NOT PRESENT?

      let fieldsToUpdate = {};

      // LOOPING FIELDS
      for (let [key, value] of Object.entries(fields)) {
        if (!value) return res.status(400).json({
          response: "Please fill out all the required fields",
          type: "error"
        });

        value = escape(value);
        // let str = key.substr(3);
        // key = str.charAt(0).toLowerCase() + str.substr(1);
        fieldsToUpdate[key] = value;

        if (fieldsToUpdate[key].length < 2 || fieldsToUpdate[key].length > 50)
          return res.status(400).send({
            response: "Your name must be between 2 and 50 characters",
            type: "error"
          });

        // TRY CATCH 2 - UPDATING USER
        try {
          // UPDATE USER
          usersCollection.findOneAndUpdate(
            {
              _id: new ObjectID(req.user._id),
              isActive: 1,
              status: 1,
            },
            {
              $set: fieldsToUpdate,
            },
            (err, jMongoResponse) => {
              // console.log(jMongoResponse);
              if (err) {
                console.log(err.errmsg);
                return res.status(500).json({
                  response: "Something went wrong processing the MongoDB request",
                  type: "error"
                });
              }

              if (!jMongoResponse.value)
                return res.status(401).send({
                  response: "Something went wrong updating the user",
                  type: "error"
                });

              let user = { ...jMongoResponse.value, ...fieldsToUpdate }

              const token = jwt.sign(
                { ...user }, config.secret,
                {
                  expiresIn: 86400, // expires in 24 hours
                }
              );

              return res.status(200).json({
                auth: true,
                token: token,
                response: "Updating successful",
                type: "success"
              });
            }
          ); // END UPDATE USER
        } catch (error) {
          if (error) {
            console.log(error);
            return res.status(500).json({
              response: "Something went wrong parsing the form",
              type: "error"
            });
          }
        } // END TRY CATCH 2 - UPDATING USER
      } // END LOOPING FIELDS

    }); // END PARSING FORM
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      response: "Something went wrong parsing the form",
      type: "error"
    });
  } // END TRY CATCH 1 - PARSING FORM
});

// ############################# UPDATE PROTECTED PROFILE - ONLY IMAGES **
router.patch("/profile/image", AuthHandler, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (!req.user) return res.status(401).send({ response: "The given user is not authorized", type: "error" });

  // TRY CATCH 1 - PARSING FORM
  try {
    const form = formidable({
      multiples: true,
    });
    // PARSING FORM
    form.parse(req, async (err, fields, files) => {

      let fieldsToUpdate = {};

      for (let [key, value] of Object.entries(files)) {
        // DETECTING FILE DETAILS
        await detect.fromFile(files[key].path, (err, result) => {
          if (err) {
            return res.status(500).json({ response: "Error in detecting file details", type: "error" });
          }
          if (!result) {
            return res.status(500).json({ response: "No image detected", type: "error" });
          }

          // CREATE UNIQUE FILE NAME WITH UUID FUNCTION
          const imgName = uuid() + "." + result.ext;

          if (!allowedImageTypes.includes(result.ext)) {
            return res.status(500).json({ response: "File type not allowed", type: "error" });
          }

          fieldsToUpdate[key] = imgName;

          // MOVING PROFILE IMAGE TO NEW PATH
          const currentPath = files[key].path;
          const newPath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            "images",
            key === "img" ? "profile" : "cover",
            imgName
          );

          // MOVE FILE
          fs.rename(currentPath, newPath, async (err) => {
            if (err) {
              return res.status(500).json({ response: "Error moving file", type: "error" });
            }
          })

          // TRY CATCH 2 - UPDATING USER
          try {
            // UPDATE USER
            usersCollection.findOneAndUpdate(
              {
                _id: new ObjectID(req.user._id),
                isActive: 1,
                status: 1,
              },
              {
                $set: fieldsToUpdate,
              },
              (err, jMongoResponse) => {
                console.log(jMongoResponse.value);
                if (err) {
                  console.log(err.errmsg);
                  return res.status(500).json({
                    response: "Something went wrong processing the MongoDB request",
                    type: "error"
                  });
                }

                if (!jMongoResponse.value)
                  return res.status(401).send({
                    response: "Something went wrong updating the user",
                    type: "error"
                  });

                let user = { ...jMongoResponse.value, ...fieldsToUpdate }

                const token = jwt.sign(
                  { ...user }, config.secret,
                  {
                    expiresIn: 86400, // expires in 24 hours
                  }
                );

                return res.status(200).json({
                  auth: true,
                  token: token,
                  data: imgName,
                  type: "success"
                });
              }
            ); // END UPDATE USER
          } catch (error) {
            if (error) {
              console.log(error);
              return res.status(500).json({
                response: "Something went wrong parsing the form",
                type: "error"
              });
            }
          } // END TRY CATCH 2 - UPDATING USER
        }) // END DETECTING FILE DETAILS
      }
    }); // END PARSING FORM
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      response: "Something went wrong parsing the form",
      type: "error"
    });
  } // END TRY CATCH 1 - PARSING FORM
});

// ############################# UPDATE PROTECTED PROFILE - TODO: TRYING TO COMBINE NOT WORKING
router.patch("/profileCombined", AuthHandler, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  // console.log(req.user);
  if (!req.user) return res.status(401).send({ response: "The given user is not authorized", type: "error" });

  // TRY CATCH 1 - PARSING FORM
  try {
    const form = formidable({
      multiples: true,
    });
    // PARSING FORM
    form.parse(req, async (err, fields, files) => {
      let fieldsToUpdate = {};

      console.log(!fields);
      if (fields) {
        for (let [key, value] of Object.entries(fields)) {
          value = escape(value);
          let str = key.substr(3);
          key = str.charAt(0).toLowerCase() + str.substr(1);
          fieldsToUpdate[key] = value;

          if (!fieldsToUpdate[key])
            return res.status(400).json({
              response: "Please fill out all the required fields",
              type: "error"
            });

          if (fieldsToUpdate[key].length < 2 || fieldsToUpdate[key].length > 50)
            return res.status(400).send({
              response: "Your name must be between 2 and 50 characters",
              type: "error"
            });
        }
      }

      if (files.img || files.cover) {

        for (let [key, value] of Object.entries(files)) {
          // DETECTING FILE DETAILS
          await detect.fromFile(files[key].path, (err, result) => {
            if (err) {
              return res.status(500).json({ response: "Error in detecting file details", type: "error" });
            }
            if (!result) {
              return res.status(500).json({ response: "No image detected", type: "error" });
            }

            // CREATE UNIQUE FILE NAME WITH UUID FUNCTION
            const imgName = uuid() + "." + result.ext;

            if (!allowedImageTypes.includes(result.ext)) {
              return res.status(500).json({ response: "File type not allowed", type: "error" });
            }

            fieldsToUpdate[key] = imgName;

            console.log(fieldsToUpdate);

            // MOVING PROFILE IMAGE TO NEW PATH
            const currentPath = files[key].path;
            const newPath = path.join(
              __dirname,
              "..",
              "..",
              "public",
              "images",
              key === "img" ? "profile" : "cover",
              imgName
            );

            // MOVE FILE
            fs.rename(currentPath, newPath, async (err) => {
              if (err) {
                return res.status(500).json({ response: "Error moving file", type: "error" });
              }
              console.log(currentPath, newPath);
            })
          }) // END DETECTING FILE DETAILS
        }
      }
    }); // END PARSING FORM
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      response: "Something went wrong parsing the form",
      type: "error"
    });
  } // END TRY CATCH 1 - PARSING FORM
});

// ############################# DELETE PROFILE IMAGE ** - TODO: HOW TO DO A DYNAMIC CONDITION
router.delete("/profile/image/:type", AuthHandler, async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (!req.user) return res.status(401).json({ response: "The given user is not authorized", type: "error" });

  let fieldToDelete = {};
  let condition = {};
  const type = req.params.type;

  const key = type === "profile" ? "img" : "cover";
  const value = type === "profile" ? "userThumbnail.svg" : "";
  fieldToDelete[key] = value;

  // TODO: HOW TO DO A DYNAMIC CONDITION? // TOOD: WHAT TO DO IF THE PROFILE IMAGE IS ALREADY DELETED?
  condition[key] = { $ne: value };
  console.log(condition);

  try {
    // CHANGE IMAGE TO DEFAULT THUMBNAIL OR EMPTY STRING
    await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectID(req.user._id),
        isActive: 1,
        status: 1,
      },
      {
        $set: fieldToDelete
      },
      (err, jMongoResponse) => {
        console.log(jMongoResponse);
        if (err) {
          console.log(err.errmsg);
          return res.status(500).json({
            response:
              "Something went wrong processing the MongoDB request",
            type: "error"
          });
        }

        if (!jMongoResponse.value)
          return res.status(401).json({
            response: "Something went wrong deleting the image here",
            type: "error"
          });

        return res.status(200).json({
          auth: true,
          response: "Deleting profile image successful",
          type: "success"
        });
      }
    ); // END CHANGE IMAGE TO DEFAULT THUMBNAIL OR EMPTY STRING
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      response: "Something went wrong deleting the image",
      type: "error"
    });
  }
});

// ############################# ALL USERS ** TODO: CHECK IF THE USERS HERE SHOULD BE FRIENDS INSTEAD MAYBE?
router.get("/users", AuthHandler, (req, res) => {
  if (!req.user._id) return res.status(401).send({ response: "The given user is not authorized", type: "error" });
  // TRY CATCH 1 - FINDING ALL ACTIVE USERS (BOTH LOGGED AND NOT LOGGED)
  try {
    usersCollection.find({}).toArray((err, ajUsers) => {
      if (err) {
        console.log(
          "Something went wrong processing the MongoDB request - Cannot read users"
        );
        return res.status("500").send([]);
      }
      return res.status(200).json({ data: ajUsers });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      response: "Something went wrong reading all users",
    });
  } // END TRY CATCH 1 - FINDING ALL ACTIVE USERS (BOTH LOGGED AND NOT LOGGED)
});

// ############################# SEARCH ALL USERS ** TODO: CHECK WHICH QUERY IS BETTER
router.get("/search", AuthHandler, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (!req.user._id) return res.status(401).json({ response: "The given user is not authorized", type: "error" });

  let term = req.query.term;
  let regexConst = new RegExp("^" + term, "i"); // i = caseinsensitive

  try {
    // usersCollection
    //   .find({
    //     $or: [
    //       {
    //         firstName: regexConst,
    //         isActive: 1,
    //       },
    //       {
    //         lastName: regexConst,
    //         isActive: 1,
    //       },
    //     ],
    //   })
    //   .toArray((err, ajUsers) => {
    //     if (err) {
    //       console.log(
    //         "Something went wrong processing the MongoDB request - Cannot read users"
    //       );
    //       return res.status("500").json([]);
    //     }
    //     return res.status(200).json(ajUsers);
    //   });

    // TODO: WHICH QUERY IS BETTER?
    usersCollection
      .find({
        $or: [{
          firstName: regexConst,
        },
        {
          lastName: regexConst,
        },
        ],
      }, (err, jMongoResponse) => {
        if (err) {
          console.log(err);
        }
        jMongoResponse.toArray((err, ajUsers) => {
          if (err) {
            console.log("database error - cannot read users");
            res.status("500").send([]);
            return;
          }
          return res.status(200).json({ response: ajUsers });
        });
      })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      response: "Something went wrong parsing searching for the users",
    });
  }
});

module.exports = router;
