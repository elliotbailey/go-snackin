import './Signup.css';
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateEmail(email)) {
            setError('Invalid email format');
            return;
        }
        if (!validatePassword(password)) {
            if (password.length < 8){
                setError('Password must be at least 8 characters long');
            }
            else {
            setError('Password must include at least one uppercase letter, one number, and one special character');
            }
            return;
        }
        try {
            const response = await axios.post('http://localhost:8001/signup', { email, password });
            if (response.data.message === 'User created successfully') {
                login();
                localStorage.setItem('email', email);
                navigate('/user-details');
            } else {
                setError(response.data.error || 'Signup failed');
            }
        } catch (error) {
            setError(error.response.data.error || 'Signup failed');
        }
    };

    return (
        <div className='signcontainer'>
            <div className='mainBox'>
                <div className='signwrapper'>
                    <form onSubmit={handleSubmit}>
                        <h1>Sign Up</h1>
                        {error && <p className="error">{error}</p>}
                        <div className="signinput-box">
                            <input placeholder='Email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <MdEmail className='signicon' />
                        </div>
                        <div className="signinput-box">
                            <input type="password" placeholder='Password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <FaLock className='signicon' />
                        </div>
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
