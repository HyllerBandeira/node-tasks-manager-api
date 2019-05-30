const mongoose = require('mongoose');

const connection_url = process.env.MONGODB_URL+process.env.MONGODB_DATABASE;
mongoose.connect(connection_url, { 
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
});
