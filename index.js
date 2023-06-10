const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const Blog = require('./model/Blog')
const User = require('./model/User')
const extras = require('./extras')
const { v4: uuidv4 } = require('uuid')
const createDomPurify = require('dompurify')
const {JSDOM} = require('jsdom')
const {marked} = require('marked')
const dompurify = createDomPurify(new JSDOM().window)
const flash = require('connect-flash')
const session = require('express-session')
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
app.use(session({
    secret:'flashblog',
    saveUninitialized: true,
    resave: true
}))
app.use(flash())

// for unauthenticated users
// rendering index page for unauthenticated users
app.get('/unAuth', async (req, res) => {
    await Blog.find({}).limit(10).then((msg) => {
        const message = 'success'
        const blogs = msg
        res.render('./unauth/index', { blogs, message })
    }).catch((err) => {
        message = "Nothing to show"
        res.render('index', { message })
    })
})

// rendering search for unauthenticated users
app.get('/unauth-search', async (req, res) => {
    const { q } = req.query
    await Blog.find({ text: { $regex: `(?i)${q}*` } }).then((msg) => {
        res.render('./unauth/search', { msg, q })
    }).catch((err) => {
        console.log(err)
    })
})

// rendering view page for unauthenticated users
app.get('/unauth-view/:blogId', async (req, res) => {
    const { blogId } = req.params
    await Blog.find({ blogId: blogId }).then((msg) => {
        const blog = msg[0]
        const message = 'success'
        res.render('./unauth/viewBlog', { blog, message })
    }).catch((err) => {
        const message = 'danger'
        console.log(err)
        res.render('viewBlog', { message: message })
    })
})

// for authenticated users
// rendering the index
app.get('/', async (req, res) => {
    if (req.cookies['userData']) {
        await Blog.find({}).limit(10).then((msg) => {
            const message = 'success'
            const blogs = msg
            res.render('index', { blogs, message })
        }).catch((err) => {
            message = "Nothing to show"
            res.render('index', { message })
        })
    } else {
        res.redirect('/unAuth')
    }
})

// rendering login page
app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('message'), type: req.flash('type')})
})

// logging in user
app.post('/login', async (req, res) => {
    const { username, password } = req.body
    let algo = 'sha256'
    let key = password
    let hash = crypto.createHash(algo).update(key).digest('hex')
    await User.find({ $and: [{ username: username }, { password: hash }] }).then((msg) => {
        if (msg.length > 0) {
            const userData = {
                username: msg[0].username,
                userId: msg[0].userId
            }

            res.cookie('userData', userData)
            res.redirect('/')
        } else {
            req.flash('message', 'Invalid username or password!')
            req.flash('type', 'danger')
            res.redirect('/login')
        }
    }).catch((err) => {
        console.log("error")
    })
})

// rendering registeration page
app.get('/register', (req, res) => {
    res.render('register', {message: req.flash('message'), type: req.flash('type')})
})

// registering the user
app.post('/register', async (req, res) => {
    const { name, username, email, password1 } = req.body
    // encrypting password
    let algo = 'sha256'
    let key = password1
    let hash = crypto.createHash(algo).update(key).digest('hex')

    // inserting the user in databse
    await User.create({
        userId: uuidv4(),
        name: name,
        username: username,
        email: email,
        password: hash,
        join_date: extras.getCurrentDateAndTime()
    }).then((msg) => {
        // success
        req.flash('message', 'Registration successfull! Please login to continue.')
        req.flash('type', 'success')
        res.redirect('/login')
    }).catch((err) => {
        // error
        const message = "Registration unsuccessfull! Please try again."
        const type = 'danger'
        req.redirect('/register')
    })
})

// rendering page for adding new blog
app.get('/new-blog', (req, res) => {
    if (req.cookies['userData']) {
        res.render('newBlog', {message: req.flash('message'), type: req.flash('type')})
    } else {
        res.redirect('/error')
    }
})

// Adding new blog to database
app.post('/new-blog', async (req, res) => {
    if (req.cookies['userData']) {
        const { title, category, text } = req.body
        const userData = req.cookies['userData']
        const markedHtml = dompurify.sanitize(marked.parse(text))
        await Blog.create({
            blogId: uuidv4(),
            title: title,
            category: category,
            text: text,
            marked: markedHtml,
            user: userData.username,
            date_posted: extras.getCurrentDateAndTime()
        })
        .then((msg) => {
            req.flash('message', 'Blog added successfully')
            req.flash('type', 'success')
            res.redirect('/new-blog')
        }).catch((err) => {
            req.flash('message', 'Oops! Something went wrong...')
            req.flash('type', 'danger')
            res.redirect('/new-blog')
        })
    } else {
        res.redirect('/error')
    }
})

// viewing full blog
app.get('/view-blog/:blogId', async (req, res) => {
    if (req.cookies['userData']) {
        const { blogId } = req.params
        await Blog.find({ blogId: blogId }).then((msg) => {
            const blog = msg[0]
            const message = 'success'
            res.render('viewBlog', { blog, message })
        }).catch((err) => {
            const message = 'danger'
            res.render('viewBlog', { message: message })
        })
    } else {
        res.redirect('/error')
    }
})

// showing user profile
app.get('/profile', async (req, res) => {
    if (req.cookies['userData']) {
        const userData = req.cookies['userData']
        await User.find({ username: userData.username }).then((msg) => {
            const message = 'success'
            res.render('profile', { user: msg[0], message: message })
        }).catch((err) => {
            const message = 'error'
            res.render('profile', { message: message })
        })
    } else {
        res.redirect('/error')
    }
})

// showing all blogs of logged in user
app.get('/all-blogs', async (req, res) => {
    if (req.cookies['userData']) {
        const userData = req.cookies['userData']
        await Blog.find({ user: userData.username }).then((msg) => {
            res.render('allBlogs', { blogs: msg, message: req.flash('message'), type: req.flash('type')})
        }).catch((err) => {
            console.log(err)
        })
    } else {
        res.redirect('/error')
    }
})

app.get('/edit/:blogId', async (req,res)=>{
    if(req.cookies['userData']){
        const {blogId} = req.params
        await Blog.find({ blogId: blogId }).then((msg) => {
            res.render('edit', { blog: msg[0]})
        }).catch((err) => {
            console.log(err)
        })
    }else{
        res.redirect('/error')
    }
})

app.post('/edit/:blogId', async (req,res)=>{
    if(req.cookies['userData']){
        const {id, title, category, text} = req.body
        const markedHtml = dompurify.sanitize(marked.parse(text))
        await Blog.updateOne({blogId: id}, {$set: {title: title, category: category, text: text, marked: markedHtml}}).then((msg)=>{
            req.flash('message', 'Blog updated Successfully!')
            req.flash('type', 'success')
            res.redirect('/all-blogs')
        }).catch((err)=>{
            req.flash('message', 'Oops! something went wrong...')
            req.flash('type', 'danger')
            res.redirect('/edit/:blogId')
        })
    }else{
        res.redirect('/error')
    }
})

app.post('/delete/:blogId', async (req,res)=>{
    const {blogId} = req.params
    await Blog.deleteOne({blogId: blogId}).then((msg)=>{
        req.flash('message', 'Blog deleted successfully!')
        req.flash('type', 'success')
        res.redirect('/all-blogs')
    }).catch((err)=>{
        req.flash('message', 'Oops! Something went wrong...')
        req.flash('type', 'danger')
        res.redirect('/all-blogs')
    })
})

// rendering change password page
app.get('/change-password', (req, res) => {
    if (req.cookies['userData']) {
        res.render('changePassword', {message: req.flash('message'), type: req.flash('type')})
    } else {
        res.redirect('/error')
    }
})

// changing password
app.post('/change-password', async (req, res) => {
    if (req.cookies['userData']) {
        const user = req.cookies['userData']
        const { password1 } = req.body
        let algo = 'sha256'
        let key = password1
        let hash = crypto.createHash(algo).update(key).digest('hex')
        console.log(user)
        await User.updateOne({ userId: user.userId }, { $set: { password: hash } }).then((msg) => {
            req.flash('message', 'Password changed successfully!')
            req.flash('type', 'success')
            res.redirect('/change-password')
        }).catch((err) => {
            req.flash('message', 'Oops! Something went wrong...')
            req.flash('type', 'danger')
            res.redirect('/change-password')
        })
    } else {
        res.redirect('/error')
    }
})

// showing results for search
app.get('/result', async (req, res) => {
    if (req.cookies['userData']) {
        const { q } = req.query
        await Blog.find({ text: { $regex: `(?i)${q}*` } }).then((msg) => {
            res.render('searchResults', { msg, q })
        }).catch((err) => {
            console.log(err)
        })
    } else {
        res.redirect('/error')
    }
})

// logging user out
app.get('/logout', (req, res) => {
    if (req.cookies['userData']) {
        res.clearCookie('userData')
        res.render('logout')
    } else {
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