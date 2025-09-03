import { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser } from '../store/userSlice';

export default function LoginForm (props) {

    const dispatch = useDispatch();
    const { isLoggedIn, username } = useSelector((state) => state.user);
    
    const [email, setEmail] = useState('')
    const [password, setUserPassword] = useState('')
    const [userName, setUserName] = useState('')
    const [showRegister, setShowRegister] = useState(false)

    return (
        <div>
            {!isLoggedIn ? (
            <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                    const user = await props.loginFn(email, password);
                    // Dispatch login action with user data
                    dispatch(loginUser({ username: user.username }));
                } catch (error) {
                    console.error('Login failed:', error);
                }
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
                <div>
                    <p>Welcome, {username}!</p>
                    <button onClick={() => dispatch(logoutUser())}>
                        Log out
                    </button>
                </div>
            )}
            <button onClick={()=>setShowRegister(true)}>New user</button>
            {showRegister && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    props.registerFn(userName, email, password);
                }}>
                    <label>
                        username: 
                        <input type="text" onChange={(e) => setUserName(e.target.value)}></input>
                    </label>
                    <br/>
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
                    <button type="submit">Register</button>
                </form>
            )}
            <br/>
        </div>
    )
}