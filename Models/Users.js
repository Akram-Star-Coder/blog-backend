const mongoose = require('mongoose');

const stringRequired = {
    type : String, 
    required : true
}

const schemaOfUsers = new mongoose.Schema({
    fullName : stringRequired, 
    password : stringRequired,
    email    : {
        type : String, 
        required : true,
        unique : true
    },
    OTP : {
        type : String, 
        default : "",
        required : false
    }
},
{
    timestamps : true
});


module.exports = mongoose.model('users', schemaOfUsers);