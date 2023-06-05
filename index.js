const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const Blog = require('./model/Blog')
const User = require('./model/User')
const extras = require('./extras')
const { v4: uuidv4 } = require('uuid')
const app = express()

/* ------------------------#    Database Configurations    #----------------------------- */
// connection to database
mongoose.connect('mongodb://127.0.0.1:27017/blogz').then((msg) => {
    console.log('Connected to database: Blogz')
}).catch((err) => {
    console.log('Error connecting to database: Blogz', err)
})
/*--------------------------------------------------------------------------------------- */

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// rendering the index
app.get('/', (req, res) => {
    if(req.cookies['userData']){
        Blog.find({}).limit(10).then((msg) => {
            const message = 'success'
            const blogs = msg
            res.render('index', { blogs, message})
        }).catch((err) => {
            message = "Nothing to show"
            res.render('index', { message })
        })        
    }else{
        res.redirect('/error')
    }
})

// rendering login page
app.get('/login', (req, res) => {
    const message = ''
    const type = ''
    const cookie = true
    res.render('login', { message: message, type: type, cookie: cookie})
})

// logging in user
app.post('/login', (req, res) => {
    const { username, password } = req.body
    let algo = 'sha256'
    let key = password
    let hash = crypto.createHash(algo).update(key).digest('hex')
    User.find({ $and: [{ username: username }, { password: hash }] }).then((msg) => {
        if (msg.length > 0) {
            const userData = {
                username: msg[0].username,
                userId: msg[0].userId
            }

            res.cookie('userData', userData)
            res.redirect('/')
        } else {
            res.redirect('/login')
            console.log('user not found')
        }
    }).catch((err) => {
        console.log("error")
    })
})

// rendering registeration page
app.get('/register', (req, res) => {
    res.render('register')
})

// console.log(crypto.createHash('sha256').update('ravan123').digest('hex'))
// registering the user
app.post('/register', (req, res) => {

    const { name, username, email, password1 } = req.body

    // encrypting password
    let algo = 'sha256'
    let key = password1
    let hash = crypto.createHash(algo).update(key).digest('hex')

    // inserting the user in databse
    User.create({
        userId: uuidv4(),
        name: name,
        username: username,
        email: email,
        password: hash,
        join_date: extras.getCurrentDateAndTime()
    }).then((msg) => {
        // success
        const message = "Registration successfull! Please login to continue."
        const type = 'success'
        res.redirect('/login')
        res.render('login', { message: message, type: type })
    }).catch((err) => {
        // error
        const message = "Registration unsuccessfull! Please try again."
        const type = 'danger'
        res.render('login', { message: message, type: type })
        console.log(err)
    })
})

// rendering page for adding new blog
app.get('/new-blog', (req, res) => {
    if(req.cookies['userData']){
        res.render('newBlog')
    }else{
        res.redirect('/error')
    }
})

// Adding new blog to database
app.post('/new-blog', (req, res) => {
    if(req.cookies['userData']){
        const { title, category, text } = req.body
        const userData = req.cookies['userData']
        Blog.create({
            blogId: uuidv4(),
            title: title,
            category: category,
            text: text,
            user: userData.username,
            date_posted: extras.getCurrentDateAndTime()
        }).then((msg) => {
            res.redirect('/')
        }).catch((err) => {
            res.redirect('/new-blog')
        })
    }else{
        res.redirect('/error')
    }
})

// viewing full blog
app.get('/view-blog/:blogId', (req, res) => {
    if(req.cookies['userData']){
        const { blogId } = req.params
        Blog.find({ blogId: blogId }).then((msg) => {
            const blog = msg[0]
            const message = 'success'
            res.render('viewBlog', { blog, message})
        }).catch((err) => {
            const message = 'danger'
            console.log(err)
            res.render('viewBlog', { message: message})
        })
    }else{
        res.redirect('/error')
    }
})

// showing user profile
app.get('/profile', (req, res) => {
    if(req.cookies['userData']){
        const userData = req.cookies['userData']
        User.find({ username: userData.username }).then((msg) => {
            const message = 'success'
            res.render('profile', { user: msg[0], message: message })
        }).catch((err) => {
            const message = 'error'
            res.render('profile', { message: message })
        })
    }else{
        res.redirect('/error')
    }
})

// showing all blogs of logged in user
app.get('/all-blogs', (req, res) => {
    if(req.cookies['userData']){
        const userData = req.cookies['userData']
        Blog.find({ user: userData.username }).then((msg) => {
            res.render('allBlogs', { blogs: msg })
        }).catch((err) => {
            console.log(err)
        })
    }else{
        res.redirect('/error')
    }
})

// rendering change password page
app.get('/change-password', (req, res) => {
    if(req.cookies['userData']){
        res.render('changePassword')
    }else{
        res.redirect('/error')
    }
})

// changing password
app.post('/change-password', (req, res) => {
    if(req.cookies['userData']){
        const user = req.cookies['userData']
        const {password} = req.body
        let algo = 'sha256'
        let key = password
        let hash = crypto.createHash(algo).update(key).digest('hex')
        User.updateOne({ userId: user.userId }, {$set: {password: hash}}).then((msg) => {
            res.redirect('/profile')
        }).cathc((err)=>{
            console.log(err)
        })
    }else{
        res.redirect('/error')
    }
})

// showing results for search
app.get('/result', (req,res)=>{
    if(req.cookies['userData']){
        const {q} = req.query
        Blog.find({text: {$regex: `(?i)${q}*`}}).then((msg)=>{
            res.render('searchResults', {msg, q})
        }).catch((err)=>{
            console.log(err)
        })
    }else{
        res.redirect('/error')
    }
})

// logging user out
app.get('/logout', (req, res) => {
    if(req.cookies['userData']){
        res.clearCookie('userData')
        res.render('logout')
    }else{
        res.redirect('/error')
    }
})

// showing error
app.get('/error', (req, res) => {
    res.render('error')
})

app.listen('5000', (req, res) => {
    console.log('server running at http://localhost:5000')
})  