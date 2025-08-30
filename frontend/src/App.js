import logo from './logo.svg';
import './App.css';
import PostList from './components/PostList';
import Header from './components/Header';
import PostForm from './components/PostForm';
import { useEffect, useState } from 'react';

function App() {
  const [posts, setPosts] = useState([]);

  const url = 'http://localhost:3001/api'

  const getPosts = async () => {
    const response = await fetch(url + '/posts');
    const blogPosts = await response.json(); // This does not synchronously give you the parsed JSON. It returns a Promise because parsing the body might take time (streaming, decoding, parsing JSON text).
    console.log(`blogPosts from GET: ${blogPosts}`);
    setPosts(blogPosts);
  }

  const createPost = async (title, content) => {
    try {
      console.log(`Attempting to create a post about: ${title}`)
      const response = await fetch(url + '/posts', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
      <PostForm newPostFn={createPost}/>
      <PostList posts={posts} deletePostFn={deletePost}/>
    </div>
  );
}

export default App;
