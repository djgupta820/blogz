const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const app = express()

/* ------------------------#    Extra functions used      #------------------------------ */
// Creating function to get date and time
function getCurrentDateAndTime() {
    const date = new Date()
    let d = date.getDay()
    let m = date.getMonth()
    let h = date.getHours()
    let mint = date.getMinutes()
    let s = date.getSeconds()

    if (d <= 9) {
        d = '0' + d
    }
    if (m <= 9) {
        m = '0' + m
    }
    if (h <= 9) {
        h = '0' + h
    }
    if (mint <= 9) {
        mint = '0' + mint
    }
    if (s <= 9) {
        s = '0' + s
    }
    let dt = d + '-' + m + '-' + date.getFullYear() + ' ' + h + ':' + mint + ':' + s
    return dt
}

/*-------------------------------------------------------------------------------------- */

/* ------------------------#    Database Configurations    #----------------------------- */
// connection to database
mongoose.connect('mongodb://127.0.0.1:27017/blogz').then((msg) => {
    console.log('Connected to database: Blogz')
}).catch((err) => {
    console.log('Error connecting to database: Blogz')
})

// User Schema for operations related to users
const UserSchema = new mongoose.Schema({
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

// Blog Schema for operations related to blogs
const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    text: {
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
})

// Model for both collections 
const User = new mongoose.model('User', UserSchema)
const Blog = new mongoose.model('Blog', BlogSchema)
/*--------------------------------------------------------------------------------------- */

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// rendering the index
app.get('/', (req, res) => {
    res.render('index')
    // if(req.cookies['userId']){
    //     res.render('index')
    // }else{
    //     res.redirect('/error')
    // }

})

// rendering login page
app.get('/login', (req, res) => {
    const message = ''
    const type = ''
    res.render('login', { message: message, type: type })
})

app.post('/login', (req, res) => {
    const { username, password } = req.body
    User.find({ $and: [{ username: username }, { password: password }] }).then((msg) => {
        if (msg.length > 0) {
            const userId = msg[0].id
            res.cookie('userId', userId)
            res.redirect('/')
        } else {
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

// registering the user
app.post('/register', (req, res) => {

    const { name, username, email, password1 } = req.body

    // encrypting password
    let algo = 'sha256'
    let key = password1
    let hash = crypto.createHash(algo).update(key).digest('hex')

    // inserting the user in databse
    User.create({
        name: name,
        username: username,
        email: email,
        password: hash,
        join_date: getCurrentDateAndTime()
    }).then((msg) => {
        // success
        const message = "Registration successfull! Please login to continue."
        const type = 'success'
        res.redirect('/login')
        res.render('login', { message: message, type: type })
        console.log('created')
    }).catch((err) => {
        // error
        const message = "Registration unsuccessfull! Please try again."
        const type = 'danger'
        res.render('login', { message: message, type: type })
        console.log("error")
    })
})

app.get('/new-blog', (req, res) => {
    res.render('newBlog')
})

// Adding new blog to database
app.post('/new-blog', (req, res) => {
    const { title, category, text } = req.body
    Blog.create({
        title: title,
        category: category,
        text: text,
        user: "testuser",
        date_posted: getCurrentDateAndTime()
    }).then((msg)=>{
        res.redirect('/new-blog')
        console.log('blog added')
    }).catch((err)=>{
        res.redirect('/new-blog')
        console.log('error adding blog to db')
    })
})

app.get('/profile', (req, res) => {
    res.render('profile')
})

app.get('/logout', (req, res) => {
    res.clearCookie('userId')
    res.render('logout')
})

app.get('/error', (req, res) => {
    res.render('error')
})

app.listen('5000', (req, res) => {
    console.log('server running at http://localhost:5000')
})