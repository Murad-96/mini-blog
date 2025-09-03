export default function PostComment (props) {
    return (
        <div className="comment" style={{color: "grey"}}>
            <p>{props.comment}</p>
            <p>- {props.author}</p>
        </div>
    )
}