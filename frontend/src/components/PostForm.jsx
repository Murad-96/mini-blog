import { useState } from "react"

export default function PostForm (props) {
    const [postContent, setPostContent] = useState('I really enjoyed biking yesterday!')
    const [postTitle, setPostTitle] = useState('biking')

    return (
        <form onSubmit={(e) => {
                e.preventDefault();
                props.newPostFn(postTitle, postContent);
                }}>
            <label>
            Post title:
            <input type="text"
                    defaultValue="biking"
                    onChange={e => setPostTitle(e.target.value)}></input>
            </label>
            <label>
            Edit your post:
            <textarea
                name="postContent"
                defaultValue="I really enjoyed biking yesterday!"
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