const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/inotebook"

const connetcToMongo = () =>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connect to mongo successfully");
    })
}

module.exports = connetcToMongo