// ###################################### AUTHORIZE MIDDLEWARE FOR THE BE
const config = require("./config");
const AuthHandler = (req, res, next) => {
    const token = req.headers.authorization;
    console.log("authenticating", req.url);
    if (!token) return res.status(401).send({
        auth: false,
        response: 'No token provided.',
        type: "error"
    });

    jwt.verify(token.replace("Bearer ", ""), config.secret, function (err, decoded) {
        // console.log(decoded);
        if (err)
            return res.status(500).send({
                auth: false,
                response: 'Failed to authenticate token.',
                type: "error"
            });

        try {
            // FIND EXISTING USER
            usersCollection.findOne(
                {
                    _id: new ObjectID(decoded._id),
                },
                (err, jMongoResponse) => {
                    if (err) {
                        console.log(err.errmsg);
                        return res.status(500).json({
                            response: "Something went wrong processing the MongoDB request",
                            type: "error"
                        });
                    }

                    if (!jMongoResponse)
                        return res.status(401).json({ response: "The given here user is not authorized", type: "error" });
                    delete jMongoResponse.password;

                    // SAVE TO REQUEST FOR OTHER ROUTES
                    req.user = jMongoResponse;
                    return next();
                }
            ); // END EXISTING USER

        } catch (error) {
            if (error) {
                console.log(error);
                return res.status(500).json({
                    response: "Something went wrong reading the user",
                    type: "error"
                });
            }
        }
    });

}

module.exports = AuthHandler;