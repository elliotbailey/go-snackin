import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // State to manage "Remember me" checkbox
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        // Check localStorage for remembered email and password
        const storedEmail = localStorage.getItem('rememberedEmail');
        const storedPassword = localStorage.getItem('rememberedPassword');
        if (storedEmail) {
            setEmail(storedEmail);
            setPassword(storedPassword || '');
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8001/login', { email, password });
            if (response.status === 200) {
                login(email); // Pass logged-in email to the login function
                navigate('/home');
                if (rememberMe) {
                    // Save email and password to localStorage if "Remember me" is checked
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    // Clear remembered email and password from localStorage if "Remember me" is unchecked
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.error || 'Login failed');
            } else {
                setError('Login failed');
            }
        }
    };

    const handleRememberMeChange = () => {
        setRememberMe(!rememberMe);
        if (!rememberMe) {
            // Clear remembered email and password if "Remember me" is unchecked
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
        }
    };

    return (
        <div className='container'>
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    {error && <p className="error">{error}</p>}
                    <div className="input-box">
                        <input 
                            type="text" 
                            placeholder='Email' 
                            name='email' 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <FaUser className='icon' />
                    </div>
                    <div className="input-box">
                        <input 
                            type="password" 
                            placeholder='Password' 
                            name='password' 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <FaLock className='icon' />
                    </div>
                    <div className="remember-forgot">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={handleRememberMeChange} 
                            /> 
                            Remember me
                        </label>
                        <Link to="/forgot-password">Forgot password?</Link>
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
