const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express();
const port = 3001;

app.use(express.json())
app.use(cors())

const uri = process.env.MONGO_URI
mongoose.connect(uri)
.then(()=>console.log("✅ Connected to MongoDB with Mongoose!"))
.catch((err) => console.error('MongoDB connection error:', err));


const PostSchema = new mongoose.Schema ({
    title: String,
    // author:
    content: String,
    date: Date
})

const Post = mongoose.model("Post", PostSchema);

app.get('/api/posts', async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
})

app.post('/api/posts', async (req, res) => {
    const post = new Post({
        title: req.body.title, 
        content: req.body.content,
        date: Date.now()
    })
    await post.save()
    res.status(201).json(post); // set response status to 200, sets the Content-Type header to application/json and attach task in the body.
})

app.delete('/api/posts/:id', async (req, res) => {
    const deleteId = req.params.id;
    console.log(`deleting post id ${deleteId}`)
    try {
        const post = await Post.findById(deleteId)
        await post.deleteOne();
    } catch (e) {
        res.status(404).json({message: e.message})
    }
    res.status(204).send()
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})