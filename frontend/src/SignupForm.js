import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SignupForm.css';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isSuccess, setIsSuccess] = useState(false); // State to show/hide popup
  const [error, setError] = useState(''); // State to store error messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://signup-app-with-mern-stack.vercel.app/signup', formData);

      if (response.data.success) {
        setIsSuccess(true); // Show success popup
        setError(''); // Clear any previous error

        // Auto-close the popup after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred.');
    }
  };

  const closePopup = () => {
    setIsSuccess(false); // Close the popup
  };

  return (
    <div className="main">
      <input type="checkbox" id="chk" aria-hidden="true" />
      <div className="signup">
        <form onSubmit={handleSubmit}>
          <label htmlFor="chk" aria-hidden="true">Sign Up</label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit">Signup</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          <Link to="/login">Already have an account?</Link>
        </p>
      </div>

      {/* Popup Modal */}
      <div className={`popup ${isSuccess ? 'show' : ''}`}>
        <div className="popup-content">
          <div className="icon">✔</div>
          <h2>Signup Successful!</h2>
          <p>Your account has been created successfully. Please login to continue.</p>
          <button onClick={closePopup}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
