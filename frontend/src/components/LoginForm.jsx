import { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser } from '../store/userSlice';
import styles from './LoginForm.css'

export default function LoginForm (props) {

    const dispatch = useDispatch();
    const { isLoggedIn, username } = useSelector((state) => state.user);
    
    const [email, setEmail] = useState('')
    const [password, setUserPassword] = useState('')
    const [userName, setUserName] = useState('')
    const [showRegister, setShowRegister] = useState(false)

    const loginOrRegister = async (email, password, username) => {

        if (!showRegister) { // login
            try {
                    const user = await props.loginFn(email, password);
                    console.log(`user in loginOrRegister: ${user}`)
                    // Dispatch login action with user data
                    dispatch(loginUser({ username: user.username }));
                } catch (error) {
                    console.error('Login failed:', error);
                }
        }
        else {
            props.registerFn(username, email, password);
            setShowRegister(false)
        }
        
    }

    return (
        <div className="loginForm">
            {!isLoggedIn ? (
            <form onSubmit={async (e) => {
                e.preventDefault();
                loginOrRegister(email, password, userName)
            }}>
                {showRegister && 
                <label>
                    Username: 
                    <input className="userName" type="text" onChange={(e) => setUserName(e.target.value)}></input>
                </label>}
                <br/>
                 <label>
                    Email:
                    <input className="email" type="text" onChange={(e)=>setEmail(e.target.value)}>
                    </input>
                </label>
                <br/>
                <label>
                    Password:
                    <input className="password" type="text" onChange={(e) => setUserPassword(e.target.value)}>
                    </input>
                </label>
                {<button type="submit">{!showRegister ? "Log in" : "Register"}</button>}
                <br/>
                {!showRegister && <button onClick={()=>setShowRegister(true)}>New user</button>}
            </form>) : (
                <div>
                    <p>Welcome, {username}!</p>
                    <button onClick={() => dispatch(logoutUser())}>
                        Log out
                    </button>
                </div>
            )}
            
        </div>
    )
}