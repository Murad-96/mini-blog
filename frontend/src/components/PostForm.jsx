import { useState } from "react"
import { useSelector } from 'react-redux'

export default function PostForm (props) {
    const [postContent, setPostContent] = useState('')
    const [postTitle, setPostTitle] = useState('')
    const username = useSelector(state => state.user.username)

    return (
        <div>
            <h3>Create a new post</h3>
            <form onSubmit={(e) => {
                    e.preventDefault();
                    props.newPostFn(postTitle, postContent, username);
                    }}>
                <label>
                Post title:
                <input type="text"
                        onChange={e => setPostTitle(e.target.value)}></input>
                </label>
                <br/>
                <label>
                Edit your post:
                <textarea
                    name="postContent"
                    rows={4}
                    cols={40}
                    onChange={e => setPostContent(e.target.value)}
                />
                </label>
                <hr/>
                <button type="reset">Reset edits</button>
                <button type="submit">Save post</button>
            </form>
        </div>
    )
}