const mongoose = require('mongoose');

const connection_url = process.env.MONGODB_URL;
mongoose.connect(connection_url, { 
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
});
