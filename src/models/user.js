const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task')

const jwtSecret = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(password) {
            if (validator.contains(password.toLowerCase(), 'password')) {
                throw new Error('Password can not contain "password"');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    avatar: {
        type: Buffer,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
}, {
    timestamps: true,
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    let token = jwt.sign({ _id: user._id.toString() }, jwtSecret, { expiresIn: '7 days' });
    
    // Storing token to the database
    user.tokens = user.tokens.concat({ token });
    await user.save();

    // Return last token
    return token;
};

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    
    return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
    // chech if has email
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Credential not found");
    }

    // Compare the password
    if (await bcrypt.compare(password, user.password)) {
        return user;
    }

    throw new Error("Credential not found");
};

// Action triggerd before save a user
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

userSchema.pre('remove', async function(next) {
    const user = this;

    await Task.deleteMany({owner: user._id});
    
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User