const mongoose = require('mongoose');

const stringRequired = {
    type : String, 
    required : true
}

const schemaOfUsers = new mongoose.Schema({
    title : stringRequired, 
    content : stringRequired,
    userId : stringRequired, 
    image : stringRequired
},
{
    timestamps : true
});


module.exports = mongoose.model('posts', schemaOfUsers);