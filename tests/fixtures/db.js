const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

// Dummies Users
const defaultUserId = new  mongoose.Types.ObjectId();
const defaultUserData = {
    _id: defaultUserId,
    name: 'Hyller (teste)',
    email: 'hyller.bandeira@teste.com',
    password: '1234567',
    tokens: [{
        token: jwt.sign({ _id: defaultUserId }, process.env.JWT_SECRET)
    }]
};

const defaultUserTwoId = new  mongoose.Types.ObjectId();
const defaultUserTwoData = {
    _id: defaultUserTwoId,
    name: 'Hyller 2 (teste)',
    email: 'hyller.bandeira2@teste.com',
    password: '1234567',
    tokens: [{
        token: jwt.sign({ _id: defaultUserTwoId }, process.env.JWT_SECRET)
    }]
};

// Dummies tasks
const defaultTaskData = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task One',
    completed: false,
    owner: defaultUserData._id
}

const defaultTaskTwoData = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task Two',
    completed: true,
    owner: defaultUserData._id
}

const defaultTaskThreeData = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task Three',
    completed: true,
    owner: defaultUserTwoData._id
}

const setupDatabase = async () => {
    await User.deleteMany({});

    await new User(defaultUserData).save();
    await new User(defaultUserTwoData).save();

    await Task.deleteMany({});

    await new Task(defaultTaskData).save();
    await new Task(defaultTaskTwoData).save();
    await new Task(defaultTaskThreeData).save();

};

module.exports = {
    defaultUserData,
    defaultUserId,
    defaultUserTwoData,
    defaultUserTwoId,
    defaultTaskData,
    defaultTaskTwoData,
    defaultTaskThreeData,
    setupDatabase
};