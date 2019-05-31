const app = require('./app');

// Get port from Heroku or set 3000 locally
const port = process.env.PORT;  
app.listen(port, () => {
    console.log('Server up on port ' + port);
});
