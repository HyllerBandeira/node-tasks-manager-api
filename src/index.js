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

// Under maintance
app.use(underMaintance);

// Setting json body encode
app.use(express.json())

// Setting routes
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server up on port ' + port);
});

const multer = require('multer');
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb)  {
        const isPdf = file.originalname.endsWith('.pdf');
        const isWordDocument = file.originalname.match('\.(doc|docx)$');

        if (isWordDocument) {
            cb(undefined, true);
        } else {
            cb(new Error('This isn\'t a Word file'));
        }
        // cb(new Error('Dummie error')); // Error
        // cb(undefined, true); // Aprove
        // cb(undefined, false); // Silent reject
    }
});

app.post('/upload-test', upload.single('upload'), (req, res) => {
    res.send();
}, (error, req, res, next) => {
    res.status(400)
        .send({ error: error.message })
});