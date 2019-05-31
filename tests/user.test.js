const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const {
    defaultUserData,
    defaultUserId,
    setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

// Singup test
test('Should singup a new user', async () => {
    let response = await request(app)
        .post('/users')
        .send({
            name: 'Hyller Bandeira Dutra',
            email: 'hyller.bandeira@gmail.com',
            password: '123456'
        })
        .expect(201);

    let databaseUser = await User.findById(response.body.user._id);
    // Assert that has user on database
    expect(databaseUser).not.toBeNull();
    
    // Assert that user information sended is the same on database
    expect(response.body).toMatchObject({
        user: {
            name: databaseUser.name,
            email: databaseUser.email
        }, 
        authToken: databaseUser.tokens[0].token
    });

    // Assert that password is encrypted
    expect(databaseUser.password).not.toBe('123456');
});

test('Shouldn\'t singup an existing user', async () => {
    await request(app)
        .post('/users')
        .send(defaultUserData)
        .expect(400);
});

test('Shouldn\'t singup an user without email', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Hyller Bandeira',
            password: '1234567'
        })
        .expect(400);
});

test('Shouldn\'t singup an user without password', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Hyller Bandeira',
            email: 'hyller.bandeira@gmail.com'
        })
        .expect(400);
});

// Login test
test('Should login existing user', async () => {
    let response = await request(app)
        .post('/users/login')
        .send({
            email: defaultUserData.email,
            password: defaultUserData.password
        })
        .expect(200);

    let databaseUser = await User.findById(response.body.user._id);
    // Assert that the sended user exist on database
    expect(databaseUser).not.toBeNull();

    // Assert that giver token belongs to database user
    expect(response.body.authToken).toBe(databaseUser.tokens[1].token);
});

test('Shouldn\'t login nonexisting user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'dummieemail@teste.com',
            password: defaultUserData.password
        })
        .expect(400);
});

test('Shouldn\'t login invalid password', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: defaultUserData.email,
            password: 'wrong'
        })
        .expect(400);
});

// Profiles test
test('Should get profile for authenticated user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Shouldn\'t get profile for nonauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Should Upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    const databaseUser = await User.findById(defaultUserId);
    // Assert if the stored value it's a buffer 
    expect(databaseUser.avatar).toEqual(expect.any(Buffer));
})

test('Shouldn\'t nonalthenticated user upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(401);
})

// Update User
test('Should authenticated user update valid information', async () => {
    let response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send({
            name: 'Hyller (updated)'
        })
        .expect(200);
        
    let databaseUser = await User.findById(defaultUserId);
    // Assert that only changed the name
    expect(databaseUser).toMatchObject({
        email: defaultUserData.email,
        name: 'Hyller (updated)'
    });
});

test('Shouldn\'t authenticated user update invalid information', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send({
            'location': 'invalid finrmation'
        })
        .expect(400);
});

test('Shouldn\'t nonauthenticated user update data', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            email: defaultUserData.email,
            name: 'Hyller (updated)'
        })
        .expect(401);
})

// Delete User Test
test('Should delete user', async () => {
    let response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${defaultUserData.tokens[0].token}`)
        .send()
        .expect(200);
    let databaseUser = await User.findById(defaultUserData._id);
    // Assert that user has been removed from database
    expect(databaseUser).toBeNull();
});

test('Shouldn\'t delete nonauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});