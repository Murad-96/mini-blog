const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import the app setup
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.FRONTEND_ORIGIN = 'http://localhost:3000';

let mongoServer;
let app;
let Post;
let User;

// Auth middleware for testing
function authMiddleware(req, res, next) {
    let token;

    // 1. Try cookie
    if (req.cookies?.access_token) {
        token = req.cookies.access_token;
    }
    
    // 2. Fallback to Authorization header
    else {
        const authHeader = req.headers["authorization"]
        token = authHeader && authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "No token provided"});
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token"});
        req.user = user;
        next();
    });
}

// Set up the Express app with the same configuration as the main server
function createTestApp() {
    const testApp = express();
    
    testApp.use(express.json());
    testApp.use(cors({
        origin: process.env.FRONTEND_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"]
    }));
    testApp.use(cookieParser());

    // Define schemas
    const PostSchema = new mongoose.Schema({
        title: String,
        content: String,
        date: Date,
        comments: [
            {
                author: String, 
                text: String
            }
        ]
    });

    const UserSchema = new mongoose.Schema({
        username: String,
        email: String,
        password: String,
        posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
    });

    Post = mongoose.model("Post", PostSchema);
    User = mongoose.model("User", UserSchema);

    // Define routes
    testApp.post('/api/auth/register', async (req, res) => {
        try {
            const {username, email, password } = req.body;
            const existingUser = await User.findOne({ email })
            if (existingUser) return res.status(400).json({message: "User already exists."});
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username,
                email, 
                password: hashedPassword,
            });
            await newUser.save();
            res.status(201).json({message: "User registered successfully."});
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    });

    testApp.post('/api/login', async (req, res) => {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({message: "User not found."});
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            res.cookie("access_token", token, {
                httpOnly: true,
            });
            res.json({ user});
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    });

    testApp.get('/api/posts', async (req, res) => {
        const posts = await Post.find();
        res.json(posts);
    });

    testApp.post('/api/posts', authMiddleware, async (req, res) => {
        const post = new Post({
            title: req.body.title, 
            content: req.body.content,
            date: Date.now()
        });
        await post.save();
        res.status(201).json(post);
    });

    testApp.post('/api/posts/:id/comments', async(req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            post.comments = [...post.comments, {author: req.body.author, text: req.body.text}];
            await post.save();
            res.json(post.comments);
        } catch (e) {
            res.status(404).json({message: e.message});
        }
    });

    testApp.delete('/api/posts/:id', async (req, res) => {
        const deleteId = req.params.id;
        try {
            const post = await Post.findById(deleteId);
            await post.deleteOne();
            res.status(204).send();
        } catch (e) {
            res.status(404).json({message: e.message});
        }
    });

    return testApp;
}

// Test setup and teardown
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = createTestApp();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clear database before each test
    if (mongoose.models.Post) {
        await mongoose.models.Post.deleteMany({});
    }
    if (mongoose.models.User) {
        await mongoose.models.User.deleteMany({});
    }
});

describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User registered successfully.');
            
            // Verify user was created in database
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
        });

        it('should not register a user with existing email', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            // Create user first
            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Try to register same email again
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User already exists.');
        });

        it('should hash the password before storing', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);

            const user = await User.findOne({ email: userData.email });
            expect(user.password).not.toBe(userData.password);
            expect(user.password.length).toBeGreaterThan(50); // Bcrypt hash length
        });
    });

    describe('POST /api/login', () => {
        beforeEach(async () => {
            // Create a test user for login tests
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword
            });
            await user.save();
        });

        it('should login successfully with correct credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.user).toBeTruthy();
            expect(response.body.user.email).toBe(loginData.email);
            
            // Check if cookie is set
            expect(response.headers['set-cookie']).toBeTruthy();
            expect(response.headers['set-cookie'][0]).toContain('access_token');
        });

        it('should fail with incorrect email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/login')
                .send(loginData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User not found.');
        });

        it('should fail with incorrect password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/login')
                .send(loginData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid credentials.');
        });
    });
});

describe('Posts Endpoints', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
        // Create a test user and get auth token
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword
        });
        await testUser.save();

        authToken = jwt.sign(
            { id: testUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    });

    describe('GET /api/posts', () => {
        it('should return empty array when no posts exist', async () => {
            const response = await request(app)
                .get('/api/posts');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return all posts', async () => {
            // Create test posts
            const post1 = new Post({
                title: 'Test Post 1',
                content: 'Content 1',
                date: new Date()
            });
            const post2 = new Post({
                title: 'Test Post 2',
                content: 'Content 2',
                date: new Date()
            });
            await post1.save();
            await post2.save();

            const response = await request(app)
                .get('/api/posts');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].title).toBe('Test Post 1');
            expect(response.body[1].title).toBe('Test Post 2');
        });
    });

    describe('POST /api/posts', () => {
        it('should create a new post with valid auth token', async () => {
            const postData = {
                title: 'New Test Post',
                content: 'This is test content'
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            expect(response.status).toBe(201);
            expect(response.body.title).toBe(postData.title);
            expect(response.body.content).toBe(postData.content);
            expect(response.body.date).toBeTruthy();
            expect(response.body._id).toBeTruthy();

            // Verify post was saved to database
            const savedPost = await Post.findById(response.body._id);
            expect(savedPost).toBeTruthy();
            expect(savedPost.title).toBe(postData.title);
        });

        it('should fail without auth token', async () => {
            const postData = {
                title: 'New Test Post',
                content: 'This is test content'
            };

            const response = await request(app)
                .post('/api/posts')
                .send(postData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('No token provided');
        });

        it('should fail with invalid auth token', async () => {
            const postData = {
                title: 'New Test Post',
                content: 'This is test content'
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', 'Bearer invalid-token')
                .send(postData);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Invalid token');
        });

        it('should work with cookie authentication', async () => {
            const postData = {
                title: 'New Test Post',
                content: 'This is test content'
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Cookie', [`access_token=${authToken}`])
                .send(postData);

            expect(response.status).toBe(201);
            expect(response.body.title).toBe(postData.title);
        });
    });

    describe('DELETE /api/posts/:id', () => {
        let testPost;

        beforeEach(async () => {
            testPost = new Post({
                title: 'Test Post to Delete',
                content: 'This post will be deleted',
                date: new Date()
            });
            await testPost.save();
        });

        it('should delete an existing post', async () => {
            const response = await request(app)
                .delete(`/api/posts/${testPost._id}`);

            expect(response.status).toBe(204);

            // Verify post was deleted from database
            const deletedPost = await Post.findById(testPost._id);
            expect(deletedPost).toBeNull();
        });

        it('should return 404 for non-existent post', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .delete(`/api/posts/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBeTruthy();
        });

        it('should return 404 for invalid post ID format', async () => {
            const response = await request(app)
                .delete('/api/posts/invalid-id');

            expect(response.status).toBe(404);
            expect(response.body.message).toBeTruthy();
        });
    });
});

describe('Comments Endpoints', () => {
    let testPost;

    beforeEach(async () => {
        testPost = new Post({
            title: 'Test Post for Comments',
            content: 'This post will receive comments',
            date: new Date(),
            comments: []
        });
        await testPost.save();
    });

    describe('POST /api/posts/:id/comments', () => {
        it('should add a comment to an existing post', async () => {
            const commentData = {
                author: 'Test Author',
                text: 'This is a test comment'
            };

            const response = await request(app)
                .post(`/api/posts/${testPost._id}/comments`)
                .send(commentData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].author).toBe(commentData.author);
            expect(response.body[0].text).toBe(commentData.text);
            expect(response.body[0]._id).toBeTruthy();

            // Verify comment was saved to database
            const updatedPost = await Post.findById(testPost._id);
            expect(updatedPost.comments).toHaveLength(1);
            expect(updatedPost.comments[0].author).toBe(commentData.author);
            expect(updatedPost.comments[0].text).toBe(commentData.text);
        });

        it('should add multiple comments to a post', async () => {
            const comment1 = {
                author: 'Author 1',
                text: 'First comment'
            };
            const comment2 = {
                author: 'Author 2',
                text: 'Second comment'
            };

            // Add first comment
            await request(app)
                .post(`/api/posts/${testPost._id}/comments`)
                .send(comment1);

            // Add second comment
            const response = await request(app)
                .post(`/api/posts/${testPost._id}/comments`)
                .send(comment2);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].author).toBe(comment1.author);
            expect(response.body[1].author).toBe(comment2.author);
        });

        it('should return 404 for non-existent post', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const commentData = {
                author: 'Test Author',
                text: 'This comment will fail'
            };

            const response = await request(app)
                .post(`/api/posts/${nonExistentId}/comments`)
                .send(commentData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBeTruthy();
        });

        it('should return 404 for invalid post ID format', async () => {
            const commentData = {
                author: 'Test Author',
                text: 'This comment will fail'
            };

            const response = await request(app)
                .post('/api/posts/invalid-id/comments')
                .send(commentData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBeTruthy();
        });
    });
});

describe('Integration Tests', () => {
    it('should handle complete user flow: register, login, create post, add comment, delete post', async () => {
        // 1. Register user
        const userData = {
            username: 'integrationuser',
            email: 'integration@example.com',
            password: 'password123'
        };

        let response = await request(app)
            .post('/api/auth/register')
            .send(userData);
        expect(response.status).toBe(201);

        // 2. Login user
        response = await request(app)
            .post('/api/login')
            .send({
                email: userData.email,
                password: userData.password
            });
        expect(response.status).toBe(200);
        
        const cookies = response.headers['set-cookie'];

        // 3. Create post (using cookie auth)
        const postData = {
            title: 'Integration Test Post',
            content: 'This is an integration test post'
        };

        response = await request(app)
            .post('/api/posts')
            .set('Cookie', cookies)
            .send(postData);
        expect(response.status).toBe(201);
        
        const postId = response.body._id;

        // 4. Add comment to post
        const commentData = {
            author: 'Integration Commenter',
            text: 'This is an integration test comment'
        };

        response = await request(app)
            .post(`/api/posts/${postId}/comments`)
            .send(commentData);
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);

        // 5. Get all posts and verify our post is there
        response = await request(app)
            .get('/api/posts');
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe(postData.title);
        expect(response.body[0].comments).toHaveLength(1);

        // 6. Delete post
        response = await request(app)
            .delete(`/api/posts/${postId}`);
        expect(response.status).toBe(204);

        // 7. Verify post was deleted
        response = await request(app)
            .get('/api/posts');
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });
});
