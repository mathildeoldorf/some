// POST CHAT
// SEEN
// DELETE
// UPDATE CHAT MESSAGE

const AuthHandler = require("../AuthHandler.js");
const { ObjectID } = require("mongodb");

// GET ALL CHATMESSAGES

router.get("/messages/:contactID", AuthHandler, (req, res) => {
    if (!req.user || req.user.status === 0 || req.user.isActive === 0) return res.status(401).send("The given user is not authorized");
    const user = req.user;
    const { contactID } = req.params;

    let contact = user.contacts.find(
        (contact) => contact.contactID.toString() === contactID
    );

    console.log(contact);

    return res.status(200).send({
        type: "success",
        messages: contact.chat,
    });
});

module.exports = router;