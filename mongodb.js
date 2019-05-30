const { MongoClient, ObjectID } = require('mongodb');

const connection_url = 'mongodb://127.0.0.1:27017';
const database_name = 'task-manager';

MongoClient.connect(connection_url, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log("unable to connect to database");
    }
    
    // open database
    const db = client.db(database_name);

    // db.collection('users').deleteMany({
    //     age: 26,
    // }).then((result) => {
    //     console.log(result);
    // }).catch((error) => {
    //     console.log(error);
    // });

     db.collection('tasks').deleteOne({
         description: 'Task 1'
     }).then((result) => {
         console.log(result);
     }).catch((error) => {
         console.log(error);
     });
});
