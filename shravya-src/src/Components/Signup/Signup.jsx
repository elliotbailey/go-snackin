import './Signup.css';
import { FaUser, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';


function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();


    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8001/signup', { username, email, password });
            if (response.data.message === 'User created successfully') {
                // Assuming 'User created successfully' is returned by your server upon successful signup
                login();
                localStorage.setItem('username', username);
                navigate('/user-details');

            } else {
                console.error('Signup failed:', response.data.error);
            }
        } catch (error) {
            console.error('Signup failed:', error);
        }
    };
    

    return (
        <div className='signcontainer'>
            <div className='mainBox'>
                <div className='signwrapper'>
                    <form onSubmit={handleSubmit}>
                        <h1>Sign Up</h1>

                        <div className="signinput-box">
                            <input placeholder='Username' name='username' value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <FaUser className='signicon' />
                        </div>

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
