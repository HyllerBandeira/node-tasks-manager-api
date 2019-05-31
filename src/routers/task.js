const express = require('express');

// Models
const Task = require('../models/task')

// Middlewares
const auth = require('../middleware/auth');

const router = express.Router();

// Create Task
router.post('/tasks', auth, async (req, res) => {
    let fields = Object.keys(req.body);
    const allowedFields = [
        "description",
        "completed"
    ];
    let isValid = fields.every((field) => allowedFields.includes(field));

    if (!isValid) {
        return res.status(400)
            .send({ error: "Invalid arguments"});
    }

    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201)
            .send(task);
    } catch(e) {
        res.status(400)
            send(e);
    }
});

// Read Tasks
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const sortByRule = req.query.sortBy.split(':');
        sort[sortByRule[0]] = sortByRule[1].toLowerCase() === 'asc'? 1: -1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch(e) {
        res.status(500)
            .send(e);    
    }
});

// Read Task
router.get('/tasks/:id', auth, async (req, res) => {
    let _id = req.params.id;
    try {
        let task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404)
                .send('Task not found');
        }
        return res.send(task)
    } catch(e) {
        res.status(500)
            .send();
    }
});

// Update Task
router.patch('/tasks/:id', auth, async (req, res) => {
    let updates = Object.keys(req.body);
    const allowedUpdates = [
        "description",
        "completed"
    ];
    let isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
        return res.status(400)
            .send({ error: "Invalid arguments"});
    }

    try {
        let _id = req.params.id;

        // Look for task to update
        let task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404)
                .send("Task not found");
        }
        
        // Set changes
        updates.forEach((update) => task[update] = req.body[update]);

        // Save changes
        await task.save();

        return res.send(task);
    } catch(e) {
        res.status(400)
            .send(e);
    }
});

// Delete Task
router.delete('/tasks/:id', auth, async (req, res) => {
    let _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({
            _id,
            owner: req.user._id
        });
        
        if (!task) {
            return res.status(404)
                .send("Task not found");
        }

        return res.send(task);
    } catch {
        res.status(500)
            .send();
    }
});

module.exports = router;