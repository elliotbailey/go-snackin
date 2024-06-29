import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8001/login', { email, password });
            if (response.status === 200) {
                // Handle successful login (e.g., redirect to homepage)
                navigate('/home');
            }
        } catch (error) {
            // Handle login error
            console.error('Login failed:', error);
        }
    };

    return (
        <div className='container'>
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>

                    <div className="input-box">
                        <input type="text" placeholder='Email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <FaUser className='icon' />
                    </div>

                    <div className="input-box">
                        <input type="password" placeholder='Password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <FaLock className='icon' />
                    </div>

                    <div className="remember-forgot">
                        <label><input type="checkbox" /> Remember me</label>
                        <a href="/">Forgot password?</a>
                    </div>

                    <button type="submit">Login</button>

                    <div className="register-link">
                        <p>Don't have an account? <Link to="/signup">Register</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
