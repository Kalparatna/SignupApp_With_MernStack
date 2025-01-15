import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignupForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to show login success message
  const [isLoading, setIsLoading] = useState(false); // Loading state to disable submit button
  const navigate = useNavigate(); // To redirect to the homepage or dashboard

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading while the request is being processed
    try {
      const response = await axios.post('https://signup-app-with-mern-stack.vercel.app/login', formData);

      if (response.data.success) {
        // Store the JWT token in localStorage
        localStorage.setItem('token', response.data.token);
        setError('');
        setIsLoggedIn(true); // Set login success state to true

        // Redirect to dashboard or homepage after login success
        setTimeout(() => {
          navigate('/dashboard'); // Redirect to dashboard after a short delay
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="main">
      <div className="login">
        <form onSubmit={handleSubmit}>
          <label>Login</label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {isLoggedIn && (
          <div className="success-message">
            <p>Successfully logged in!</p>
          </div>
        )}
        <p>
          <Link to="/">Don't have an account?</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
