import logo from './logo.svg';
import './App.css';
import PostList from './components/PostList';
import Header from './components/Header';
import PostForm from './components/PostForm';
import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';

function App() {
  const [posts, setPosts] = useState([]);

  const url = 'http://localhost:3001/api'

  const login = async (email, password) => {
    const response = await fetch(url + '/login', {
      method: "POST",
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
    localStorage.setItem("token", token); // store JWT in localstorage (if server returns it)
    console.log("Stored token:", data.token);
    return data.user;
  }

  const register = async (username, email, passoword) => {
    try {
      const response = await fetch (url + '/login', {
      method: "POST",
      body: JSON.stringify({username, email, passoword})
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
    const response = await fetch(url + '/posts');
    const blogPosts = await response.json(); // This does not synchronously give you the parsed JSON. It returns a Promise because parsing the body might take time (streaming, decoding, parsing JSON text).
    console.log(`blogPosts from GET: ${blogPosts}`);
    setPosts(blogPosts);
  }

  const createPost = async (title, content) => {
    try {
      console.log(`Attempting to create a post about: ${title}`)
      const token = localStorage.getItem("token"); // if JWT is stored in the localStorage
      const response = await fetch(url + '/posts', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // send the token with authorization header (if using localStorage)
        //"Credentials": "include"            // 👈 required so the browser sends cookies cross-origin (if using cookies)
      },
      body: JSON.stringify({ title: title, content: content, author: "default" })
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

  const createComment = async (postId, comment) => {
    try {
      console.log(`Attempting to add comment ${comment} for comment ${postId}`);
      const response = await fetch(url + `/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({author: 'defaultAuthor', text: comment})
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
  }, [])
  
 
  return (
    <div>
      <Header/>
      <LoginForm loginFn={login}/>
      <PostForm newPostFn={createPost}/>
      <PostList posts={posts} deletePostFn={deletePost} addCommentFn={createComment}/>
    </div>
  );
}

export default App;
