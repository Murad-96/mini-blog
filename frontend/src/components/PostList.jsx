import Post from "./Post"

export default function PostList (props) {

    const handleDelete = (id) => {
        props.deletePostFn(id)
    }

    // console.log(`posts from PostList: ${props.posts}`)
    return (
        <div>
            {props.posts.map(p => (
                <Post key={p._id} 
                    id={p._id} 
                    title={p.title} 
                    content={p.content} 
                    author={p.author}
                    date={p.date}
                    comments={p.comments}
                    addComment={props.addCommentFn}
                    postDelete={() => handleDelete(p._id)} />
             ))}
        </div>
        
    )
}