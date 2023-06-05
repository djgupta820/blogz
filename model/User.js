const mongoose = require('mongoose')
// User Schema for operations related to users
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    join_date: {
        type: String,
        required: true
    }
})

const User = new mongoose.model('User', UserSchema)

module.exports = User