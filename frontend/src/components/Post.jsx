import { useState } from 'react'
import PostComment from './PostComment'
import styles from './Post.css'

export default function Post (props) {

    const [comments, setComments] = useState(props.comments)
    const [commentText, setCommentText] = useState('')

    const handleCreateComment = async () => {
        // call a comment creating fn
        const postComments = await props.addComment(props.id, commentText)
        // setComments
        setComments(postComments)
        setCommentText('')
    }

    return (
        <div className='post'>
            <h2>{props.title}</h2>
            <p>{props.content}</p>
            <button type="submit" onClick={props.postDelete}>Delete</button>   
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)}/>
            <button onClick={handleCreateComment}>Leave comment</button>
            {comments.map(com => (<PostComment  key={com._id} id={com._id} comment={com.text} author={com.author} />)) }
        </div>
    )
}