const jwt = require('jsonwebtoken');
const User = require('../models/user');

const jwtSecret = process.env.JWT_SECRET;

const auth = async (req, res, nxt) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findOne({ 
            _id: decoded._id,
             'tokens.token': token
        });

        if (!user) {
            throw new Error;
        }

        req.token = token;
        req.user = user;
        return nxt();

    } catch (e) {
        res.status(401)
            .send("Authorization failed. Please autenticate");
    }
}

module.exports = auth