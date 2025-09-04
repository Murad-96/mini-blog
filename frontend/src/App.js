import logo from './logo.svg';
import './App.css';
import PostList from './components/PostList';
import Header from './components/Header';
import PostForm from './components/PostForm';
import UserInfo from './components/UserInfo';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { syncLoginStatus } from './store/userSlice';
import LoginForm from './components/LoginForm';

function App() {
  const [posts, setPosts] = useState([]);
  const dispatch = useDispatch();

  // const url = 'http://localhost:3001/api'
  const url = 'https://mini-blog-u2l2.onrender.com/api'

  const login = async (email, password) => {
    try {
      const response = await fetch(url + '/login', {
      method: "POST",
      credentials: "include", // "Please include credentials (cookies, authorization headers, TLS client certificates) when making this request, and also save any credentials that the server sends back in the response."
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email, password})
      })
      if (!response.ok) {
        throw new Error("Login failed");
      }
      const data = await response.json();
      const token = data.token;
      console.log(`token received from login: ${token}, storing..`)
      localStorage.setItem("token", token); // store JWT in localstorage (if server returns it)
      console.log("Stored token:", data.token);
      return data.user;
    } catch (e) {
      console.log(e.message)
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await fetch (url + '/auth/register', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username, email, password})
      });
      if (!response.ok) {
        throw new Error("Registration failed")
      }
      const data = await response.json();
      console.log(`registration response: ${data}`)
    }
    catch (e) {
      console.log(e)
    }
  }

  const getPosts = async () => {
    try {
      const response = await fetch(url + '/posts');
      const blogPosts = await response.json(); // This does not synchronously give you the parsed JSON. It returns a Promise because parsing the body might take time (streaming, decoding, parsing JSON text).
      console.log(`blogPosts from GET: ${blogPosts}`);
      setPosts(blogPosts);
    } catch (e) {
      console.log(e)
    }
    
  }

  const createPost = async (title, content, username) => {
    try {
      console.log(`Attempting to create a post by ${username} about ${title}`)
      const token = localStorage.getItem("token"); // if JWT is stored in the localStorage
      console.log(`token sent with createPost: ${token}`)
      const response = await fetch(url + '/posts', {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json", // 👈 required so the browser sends cookies cross-origin (if using cookies)
        //"Authorization": `Bearer ${token}`, // send the token with authorization header (if using localStorage)      // 👈 required so the browser sends cookies cross-origin (if using cookies)
      },
      body: JSON.stringify({ title: title, content: content, author: username || "anonymous" })
    })
    if (!response.ok) {
      console.log('Failed to create a post.')
    }
    const newPost = await response.json();
    setPosts([...posts, newPost]);
  }
    catch (e) {
      console.log(e)
    }
  }

  const createComment = async (postId, comment, author) => {
    try {
      console.log(`Attempting to add comment ${comment} by ${author} for comment ${postId}`);
      const token = localStorage.getItem("token");
      const response = await fetch(url + `/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          //"Credentials": "include",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({author: author, text: comment})
      })
      if (!response.ok) {
        console.log('Failed to post a comment.')
      }
      const comments = await response.json();
      console.log(`comments from api call: ${comments}`)
      return comments
    } catch (e) {
      console.log(e)
    }
  }

  const deletePost = async (id) => {
    try {
      console.log(`Attempting to delete post id ${id}`)
      const response = await fetch(url + `/posts/${id}`, {method: "DELETE"})
      if (!response.ok) {
        console.log("Failed to delete post.")
      }
      setPosts(posts.filter(post => post._id != id)); // upon successful deletion update state
    } catch (e) {
      console.log(e)
    }
  }
    

  useEffect (() => {
    // fetch blog posts
    getPosts()
    // Sync login status from localStorage on app initialization
    dispatch(syncLoginStatus())
  }, [dispatch])
  
 
  return (
    <div>
      <Header/>
      <LoginForm loginFn={login} registerFn={register}/>
      <UserInfo/>
      <PostForm newPostFn={createPost}/>
      <PostList posts={posts} deletePostFn={deletePost} addCommentFn={createComment}/>
    </div>
  );
}

export default App;
