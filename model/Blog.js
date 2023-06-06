const mongoose = require('mongoose')
const createDomPurify = require('dompurify')
const {JSDOM} = require('jsdom')
const marked = require('marked')
const dompurify = createDomPurify(new JSDOM().window)

// Blog Schema for operations related to blogs
const BlogSchema = new mongoose.Schema({
    blogId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    date_posted: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    marked: {
        type: String,
        required: true
    }
})

const Blog = new mongoose.model('Blog', BlogSchema)
module.exports = Blog