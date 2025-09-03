import { useState } from "react"

export default function PostForm (props) {
    const [postContent, setPostContent] = useState('')
    const [postTitle, setPostTitle] = useState('')

    return (
        <form onSubmit={(e) => {
                e.preventDefault();
                props.newPostFn(postTitle, postContent);
                }}>
            <label>
            Post title:
            <input type="text"
                    onChange={e => setPostTitle(e.target.value)}></input>
            </label>
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
        
    )
}