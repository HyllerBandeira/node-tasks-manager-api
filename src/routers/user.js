const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

// Email handler
const  { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account');

const router = express.Router();

// Multer instance to store files
const uploadAvatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        const isImage = file.originalname.match(/\.(png|jpg|jpeg)$/);

        if (isImage)
            callback(undefined, true);
        else
            callback(new Error('Avatar should be an image'))
    }
});

// Models
const User = require('../models/user');

// Middlewares
const auth = require('../middleware/auth')

// Create User
router.post('/users', async (req, res) => {
    let user = new User(req.body);

    try {
        await user.save();
        let authToken = await user.generateAuthToken();

        sendWelcomeEmail(user.email, user.name);
        
        res.status(201)
            .send({ user, authToken });
    } catch (e) {
        res.status(400)
            .send(e);
    }
});

// Read Users
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch(e) {
        res.status(500)
            .send();
    }
});

// Read current User
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// Update User
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        'name',
        'email',
        'password',
        'age'
    ];
    const isValid = updates.every((update) => allowedUpdates.includes(update)); 

    if (!isValid) {
        res.status(400)
            .send({error: 'Invalid Operation'})
    }
    try {
        let user = req.user;

        updates.forEach((update) => user[update] = req.body[update]);

        await user.save();
        return res.send(user);
    } catch(e) {
        res.status(400)
            .send(e);
    }
});

// Delete User
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendGoodbyeEmail(req.user.email, req.user.name);

        return res.send(req.user);
    } catch {
        res.status(500)
            .send();
    }
});

// Login user
router.post('/users/login', async (req, res) => {
    try {
        let user = await User.findByCredentials(req.body.email, req.body.password);
        let authToken = await user.generateAuthToken();

        res.send({ user, authToken });
    } catch(e) {
        res.status(400)
            .send(e);
    }
});

//Logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        const user = req.user;

        user.tokens = user.tokens.filter((token) => token.token !== req.token);
        await user.save();

        res.send();
    } catch(e) {
        res.status(500)
            .send();
    }
});

//Logout user
router.post('/users/logout/all-devices', auth, async (req, res) => {
    try {
        const user = req.user;

        user.tokens = [];
        await user.save();

        res.send();
    } catch(e) {
        console.log(e);
        res.status(500)
            .send();
    }
});

// Upload User Avatar
router.post('/users/me/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
    let user = req.user;
    try {
        const modifiedBuffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        
        // Set the avatar buffer on user instance
        user.avatar = modifiedBuffer;

        await user.save();
        return res.send();
    } catch(e) {
        res.status(400)
            .send(e);
    }
}, (error, req, res, next) => {
    res.status(400)
        .send({ error: error.message })
});

// Delete User Avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        let user = req.user;
        
        // Unset avatar buffer
        user.avatar = undefined;

        await user.save();
        return res.send();
    } catch(e) {
        res.status(400)
            .send(e);
    }
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user.avatar) {
            res.set('Content-Type', 'image/jpg');
            res.send(user.avatar);
        } else {
            throw new Error();
        }
    } catch (e) {
        res.status(404)
            .send();
    }
})

module.exports = router