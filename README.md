# Mini-Blog Web Application

A full-stack blog application built with React and Node.js that allows users to create posts, leave comments, and manage their content through a modern web interface.

![Mini-Blog Screenshot](https://github.com/Murad-96/mini-blog/blob/main/screenshot.png)

## 🌐 Live Demo

- **Frontend**: [https://mini-blog-xi-eight.vercel.app/](https://mini-blog-xi-eight.vercel.app/)
- **Backend API**: [https://mini-blog-u2l2.onrender.com](https://mini-blog-u2l2.onrender.com)

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login system with JWT tokens
- **Post Management**: Create, view, and delete blog posts
- **Comment System**: Add comments to any post
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Dynamic content updates without page refresh

### Security Features
- **Password Hashing**: BCrypt encryption for secure password storage
- **JWT Authentication**: Token-based authentication with HTTP-only cookies
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Server-side validation for all user inputs

### User Experience
- **Intuitive Interface**: Clean, modern UI design
- **State Management**: Redux Toolkit for efficient state handling
- **Error Handling**: Comprehensive error messages and validation
- **Login Persistence**: User sessions persist across browser sessions

## 🏗️ Architecture

### Frontend (React)
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # App header
│   │   ├── LoginForm.jsx    # Authentication form
│   │   ├── PostForm.jsx     # Create new posts
│   │   ├── PostList.jsx     # Display all posts
│   │   ├── Post.jsx         # Individual post component
│   │   ├── PostComment.jsx  # Comment display
│   │   └── UserInfo.jsx     # User profile info
│   ├── store/               # Redux state management
│   │   ├── store.js         # Redux store configuration
│   │   └── userSlice.js     # User authentication state
│   ├── App.js               # Main application component
│   └── index.js             # React app entry point
```

### Backend (Node.js/Express)
```
backend/
├── server.js                # Main server file with all routes
├── server.test.js           # Comprehensive test suite
├── jest.config.js           # Jest testing configuration
└── package.json             # Dependencies and scripts
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,     // Display name
  email: String,        // Unique identifier for login
  password: String,     // BCrypt hashed password
  posts: [ObjectId]     // References to user's posts
}
```

### Post Model
```javascript
{
  title: String,        // Post title
  author: String,       // Author username
  content: String,      // Post content/body
  date: Date,          // Creation timestamp
  comments: [{         // Embedded comments
    author: String,    // Comment author username
    text: String       // Comment content
  }]
}
```

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Posts Endpoints

#### Get All Posts
```http
GET /api/posts
```

#### Create New Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "content": "string"
}
```

#### Delete Post
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Comments Endpoints

#### Add Comment to Post
```http
POST /api/posts/:id/comments
Content-Type: application/json

{
  "author": "string",
  "text": "string"
}
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local instance or MongoDB Atlas)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-blog
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with the following variables:
   # MONGO_URI=mongodb://localhost:27017/miniblog
   # JWT_SECRET=your-secret-key
   # FRONTEND_ORIGIN=http://localhost:3000
   
   npm start
   ```
   Backend will run on `http://localhost:3001`

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on `http://localhost:3000`

### Environment Variables

Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_ORIGIN=http://localhost:3000
```

## 🧪 Testing

The application includes a comprehensive test suite for the backend API.

### Running Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
```

### Test Coverage
- **Authentication**: Registration, login, JWT validation
- **Posts**: CRUD operations with authentication
- **Comments**: Adding comments to posts
- **Error Handling**: Invalid inputs, unauthorized access
- **Integration**: Complete user workflows

Tests use MongoDB Memory Server for isolated testing without requiring a database connection.

## 📦 Technology Stack

### Frontend
- **React 19.1.1**: UI library
- **Redux Toolkit**: State management
- **React Redux**: React-Redux bindings
- **CSS3**: Styling

### Backend
- **Node.js**: Runtime environment
- **Express 5.1.0**: Web framework
- **MongoDB**: Database
- **Mongoose 8.18.0**: ODM for MongoDB
- **JWT**: Authentication tokens
- **BCrypt**: Password hashing
- **CORS**: Cross-origin resource sharing

### Development & Testing
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory database for testing

## 🚢 Deployment

### Frontend (Vercel)
The frontend is deployed on Vercel with automatic deployments from the main branch.

### Backend (Render)
The backend is deployed on Render with the following configuration:
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**: Set MONGO_URI, JWT_SECRET, and FRONTEND_ORIGIN

## 🔧 Development Notes

### Authentication Flow
1. User registers/logs in through the frontend
2. Backend validates credentials and returns JWT token
3. Token is stored in both localStorage and HTTP-only cookies
4. Subsequent requests include token in Authorization header or cookies
5. Backend middleware validates token for protected routes

### State Management
- Redux Toolkit manages user authentication state
- Local component state handles posts and UI interactions
- User login status persists across browser sessions

### Security Considerations
- Passwords are hashed using BCrypt with salt rounds
- JWT tokens have 1-hour expiration
- CORS is configured to only allow requests from the frontend domain
- Authentication middleware validates tokens on protected routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section below
2. Review the test suite for usage examples
3. Open an issue on GitHub

## 🔍 Troubleshooting

### Common Issues

**"Failed to fetch posts"**
- Ensure the backend server is running
- Check that CORS is properly configured
- Verify the API URL in the frontend

**"Login failed"**
- Verify user credentials
- Check that JWT_SECRET is set in backend environment
- Ensure MongoDB connection is established

**"Post creation failed"**
- Confirm user is logged in
- Check authentication token validity
- Verify required fields are provided

### Development Tips
- Use browser developer tools to inspect network requests
- Check server logs for detailed error messages
- Ensure all environment variables are properly set
- Verify MongoDB connection string format
