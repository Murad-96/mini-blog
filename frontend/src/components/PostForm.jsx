import { useState } from "react"
import { useSelector } from 'react-redux'
import styles from './PostForm.css'

export default function PostForm (props) {
    const [postContent, setPostContent] = useState('')
    const [postTitle, setPostTitle] = useState('')
    const { username, isLoggedIn } = useSelector((state) => state.user);

    return (
        <div>
            <h3>{isLoggedIn ? "Create a new post" : "Login to create a post"}</h3>
            {isLoggedIn && <form onSubmit={(e) => {
                    e.preventDefault();
                    props.newPostFn(postTitle, postContent, username);
                    }}>
                <label>
                Post title:
                <input className="postTitle" type="text"
                        onChange={e => setPostTitle(e.target.value)}></input>
                </label>
                <br/>
                <label>
                Edit your post below:
                <br/>
                <textarea
                    className="postContent"
                    name="postContent"
                    rows={4}
                    cols={40}
                    onChange={e => setPostContent(e.target.value)}
                />
                </label>
                <hr/>
                <button type="reset">Reset edits</button>
                <button type="submit">Publish post</button>
            </form>}
        </div>
    )
}