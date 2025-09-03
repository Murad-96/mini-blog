import { useState } from "react";

export default function LoginForm (props) {

    function isTokenStored() {
        const t = localStorage.getItem("token");
        console.log(`token in login form: ${t}`)
        return t && t.length > 0;
    }

    const [isLoggedIn, setLoggedIn] = useState(isTokenStored())
    const [email, setEmail] = useState('')
    const [password, setUserPassword] = useState('')

    return (
        <div>
            {!isLoggedIn ? (
            <form onSubmit={(e) => {
                e.preventDefault();
                props.loginFn(email, password);
                setLoggedIn(isTokenStored())
            }}>
                 <label>
                    Email:
                    <input type="text" onChange={(e)=>setEmail(e.target.value)}>
                    </input>
                </label>
                <br/>
                <label>
                    Password:
                    <input type="text" onChange={(e) => setUserPassword(e.target.value)}>
                    </input>
                </label>
                <button type="submit">Log in</button>
            </form>) : (
                <button>
                    Log out
                </button>
            )}
        </div>
    )
}