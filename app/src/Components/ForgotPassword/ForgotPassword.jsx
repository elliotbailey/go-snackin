import { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8001/forgot-password', { email });
            if (response.status === 200) {
                setSuccessMessage(response.data.message);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.error || 'Password reset failed');
            } else {
                setError('Password reset failed');
            }
        }
    };

    return (
        <div className='container'>
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Forgot Password</h1>
                    {error && <p className="error">{error}</p>}
                    {successMessage && <p className="success">{successMessage}</p>}
                    <div className="input-box">
                        <input 
                            type="email" 
                            placeholder='Email' 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
