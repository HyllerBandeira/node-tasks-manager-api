const express = require('express');

// Run DB configuration
require('./db/mongoose.js');

// Router
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

// Middlewares
const underMaintance = require('./middleware/under-maintance');

const app = express();


// Setting json body encode
app.use(express.json())

// Setting routes
app.use(userRouter);
app.use(taskRouter);

module.exports = app;