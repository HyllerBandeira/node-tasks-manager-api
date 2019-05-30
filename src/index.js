const express = require('express');

// Run DB configuration
require('./db/mongoose.js');

// Router
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

// Middlewares
const underMaintance = require('./middleware/under-maintance');

const app = express();

// Get port from Heroku or set 3000 locally
const port = process.env.PORT;  

// Setting json body encode
app.use(express.json())

// Setting routes
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server up on port ' + port);
});
