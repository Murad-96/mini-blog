import { useState } from 'react'
import PostComment from './PostComment'
import styles from './Post.css'
import { useSelector } from 'react-redux';

export default function Post (props) {

    const [comments, setComments] = useState(props.comments)
    const [commentText, setCommentText] = useState('')

    const { username, isLoggedIn } = useSelector((state) => state.user);

    const handleCreateComment = async () => {
        // call a comment creating fn
        const postComments = await props.addComment(props.id, commentText, username)
        setComments(postComments)
        setCommentText('')
    }

    const isMyPost = props.author == username

    return (
        <div className='post'>
            <h2>{props.title}</h2>
            <p>{props.content}</p>
            <p>{`posted on ${new Date(props.date).toLocaleDateString("en-GB")}  ${new Date(props.date).getHours()}:${new Date(props.date).getMinutes()} by ${props.author}`}</p>
            {isMyPost && <button type="submit" style={{marginRight: "5px"}} onClick={props.postDelete}>Delete</button>}   
            {isLoggedIn && <textarea value={commentText} onChange={e => setCommentText(e.target.value)}/>}
            {isLoggedIn && <button className='leaveComment' onClick={handleCreateComment}>Leave comment</button>}
            {comments.length > 0 && <p>Comments</p>}
            {comments.map(com => (<PostComment  key={com._id} id={com._id} comment={com.text} author={com.author} />)) }
        </div>
    )
}