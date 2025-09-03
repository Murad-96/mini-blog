const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require('dotenv').config()

const app = express();
const port = 3001;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://mini-blog-xi-eight.vercel.app"

app.use(express.json())
app.use(cors({
    origin: "https://mini-blog-xi-eight.vercel.app",
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "Credentials"]
}))
app.use(cookieParser()) // for parsing cookies

const uri = process.env.MONGO_URI
mongoose.connect(uri)
.then(()=>console.log("✅ Connected to MongoDB with Mongoose!"))
.catch((err) => console.error('MongoDB connection error:', err));

function authMiddleware(req, res, next) {
    let token;

    // 1. Try cookie
    if (req.cookies?.access_token) {
        token = req.cookies.access_token;
        console.log(`token from cookies: ${token}`);
    }
    
    // 2. Fallback to Authorization header
    else {
        const authHeader = req.headers["authorization"]
        console.log(`authHeader: ${authHeader}`)
        token = authHeader && authHeader.split(" ")[1]
        console.log(`token: ${token}`)
        if (!token) return res.status(401).json({ message: "No token provided"});
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token"});

        req.user = user; // attach decoded user to request
        next();
    });
}

const PostSchema = new mongoose.Schema ({
    title: String,
    author: String,
    content: String,
    date: Date,
    comments: [ // treated as subdocument by Mongoose - automatically creates an _id field.
        {
            author: String, 
            text: String
        }
    ]
})

const UserSchema = new mongoose.Schema ({
    username: String,
    email: String,
    password: String,
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
})

const Post = mongoose.model("Post", PostSchema);

const User = mongoose.model("User", UserSchema);

app.post('/api/auth/register', async (req, res) => {
    try {
        const {username, email, password } = req.body;
        console.log(`attempting registration for ${req.body}`)
        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({message: "User already exists."});
        console.log(`password: ${password}`)
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User (
            {
                username,
                email, 
                password: hashedPassword,
            }
        )
        await newUser.save()
        res.status(201).json({message: "User registered successfully."})
    } catch (e) {
        res.status(500).json({message: e.message})
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({message: "User not found."});
        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });
        const token = jwt.sign(
            { id: user._id },   // 1) payload (claims)
            process.env.JWT_SECRET,              // 2) signing key (HMAC secret)
            { expiresIn: "1h" }                  // 3) token lifetime
        );
        res.cookie("access_token", token, { // adds Set-Cookie header
            httpOnly: true,
        })
        res.json({token, user}) // include JWT token in the response too.
    }   catch (err) {
        res.status(500).json({message: err.message})
    }
})

app.get('/api/posts', async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
})

// only authenticated users can create posts
app.post('/api/posts', authMiddleware, async (req, res) => {
    try {
        console.log(`creating a post by ${req.body.author}`)
        const user = await User.findOne({ username: req.body.author })
        if (!user) {
            throw new Error("User not found")
        }
        const post = new Post({
        title: req.body.title, 
        content: req.body.content,
        author: req.body.author,
        date: Date.now()
        });
        await post.save();
        user.posts.push(post);
        await user.save();
        res.status(201).json(post); // set response status to 200, sets the Content-Type header to application/json and attach post in the body.
    } catch (e) {
        res.status(404).json({message: e.message});
    }
})

app.post('/api/posts/:id/comments', authMiddleware, async(req, res) => {
    try {
        console.log(`adding comment ${req.body.text} by ${req.body.author} for post ${req.params.id}`);
        const post = await Post.findById(req.params.id);
        post.comments = [...post.comments, {author: req.body.author, text: req.body.text}];
        await post.save();
        console.log(`comment created successfully!`)
        res.json(post.comments);
    } catch (e) {
        res.status(404).json({message: e.message});
    }
})

app.delete('/api/posts/:id', async (req, res) => {
    const deleteId = req.params.id;
    console.log(`deleting post id ${deleteId}`)
    try {
        const post = await Post.findById(deleteId)
        const user = await User.findOne({ username: post.author })
        if (!user.posts.includes(deleteId)) {
            throw new Error("User does not have this post")
        }
        user.posts = user.posts.filter(post => post._id.toString() !== deleteId)
        await user.save();
        await post.deleteOne();
    } catch (e) {
        res.status(404).json({message: e.message})
    }
    res.status(204).send()
})

// Start the server
app.listen(port, () => {
    console.log(FRONTEND_ORIGIN)
    console.log(`Server is running on http://localhost:${port}`);
})