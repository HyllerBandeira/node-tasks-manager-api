const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const User = require('../src/models/user');

const {
    defaultUserData,
    defaultUserTwoData,
    defaultTaskData,
    defaultTaskTwoData,
    defaultTaskThreeData,
    setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

// Create Task
test('Should authenticated user create a task with valid information', async () => {
    let response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send({ description: 'Task 1' })
        .expect(201);
    
    let databaseTask = await Task.findById(response.body._id)
    // Assert that the given task has been created on database
    expect(databaseTask).not.toBeNull();

    // Assert that the given task isn't complete
    expect(databaseTask.completed).toBe(false);
});

test('Shouldn\'t authenticated user create his task with invalid information', async () => {
    let response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send({ 
            description: 'Task 3',
            invalidField: 'Invalid Value'
        })
        .expect(400);
});

test('Shouldn\'t nonauthenticated user create task', async () => {
    await request(app)
        .post('/tasks')
        .send({ description: 'Task 1' })
        expect(401);
});

// Read tasks
test('Should authenticated user fetch his tasks', async () => {
    let response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send()
        .expect(200);
    
    let databaseUser = await User.findById(defaultUserData._id);
    // Assert that user exists on database
    expect(databaseUser).not.toBeNull();
    await databaseUser.populate('tasks').execPopulate();
    // Assert that the renponse contains all user's task
    expect(databaseUser.tasks.length).toBe(response.body.length);
});

test('Should authenticated user read his task', async () => {
    let response = await request(app)
        .get(`/tasks/${defaultTaskData._id}`)
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send()
        .expect(200);
    
    let databaseTask = await Task.findById(response.body._id);
    // Assert that task exists on database
    expect(databaseTask).not.toBeNull();
    databaseTask.populate('owner').execPopulate();
    // Assert that task belongs to given user
    expect(databaseTask.owner._id).toEqual(defaultUserData._id);
});

test('Shouldn\'t authenticated user read tasks from another user', async () => {
    await request(app)
        .get(`/tasks/${defaultTaskData._id}`)
        .set('Authorization', `Bearer ${defaultUserTwoData.tokens[0].token}`)
        .send()
        .expect(404);
});

// Update Task
test('Should authenticated user update his task with valid information', async () => {
    let response = await request(app)
        .patch(`/tasks/${defaultTaskData._id}`)
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send({ description: 'Task 3' })
        .expect(200);
    
    let databaseTask = await Task.findById(response.body._id)
    // Assert that the given task has been created on database
    expect(databaseTask).not.toBeNull();

    // Assert that the given task isn't complete
    expect(databaseTask.completed).toBe(false);
});

test('Shouldn\'t authenticated user update his task with invalid information', async () => {
    let response = await request(app)
        .patch(`/tasks/${defaultTaskData._id}`)
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send({ 
            description: 'Task 3',
            invalidField: 'Invalid Value'
        })
        .expect(400);
});

test('authenticated user update another\'s user task', async () => {
    await request(app)
        .patch(`/tasks/${defaultTaskData._id}`)
        .set('Authorization', `Bearer ${defaultUserTwoData.tokens[0].token}`)
        .send({ description: 'Task 1' })
        expect(404);
});

test('Shouldn\'t nonauthenticated user update task', async () => {
    await request(app)
        .patch(`/tasks/${defaultTaskData._id}`)
        .send({ description: 'Task 1' })
        expect(401);
});

// Delete Task
test('Should authenticated user delete his tasks', async () => {
    await request(app)
        .delete(`/tasks/${defaultTaskData._id}`)
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send()
        .expect(200);

    let task = await Task.findById(defaultTaskData._id);
    // Assert that given task still on the database
    expect(task).toBeNull();
});

test('Shouldn\'t authenticated user delete tasks from another user', async () => {
    await request(app)
        .delete(`/tasks/${defaultTaskData._id}`)
        .set('Authorization', `Bearer ${defaultUserTwoData.tokens[0].token}`)
        .send()
        .expect(404);

    let task = await Task.findById(defaultTaskData._id);
    // Assert that given task still on the database
    expect(task).not.toBeNull();
});