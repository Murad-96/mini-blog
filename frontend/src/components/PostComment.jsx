export default function PostComment (props) {
    return (
        <div className="comment">
            <p>{props.comment}</p>
            <p>- {props.author}</p>
        </div>
    )
}