const mongoose = require('mongoose');
const {Schema} = MongoClient;

const todoSchema = new Schema({
    text: String,
    isCompleted : {
        type: Boolean,
        default: false
    },
    createdDate : {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('todo', todoSchema)