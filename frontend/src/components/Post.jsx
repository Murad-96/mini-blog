export default function Post (props) {
    return (
        <div>
            <h2>{props.title}</h2>
            <p>{props.content}</p>
            <button type="submit" onClick={props.postDelete}>Delete</button>   
        </div>
    )
}