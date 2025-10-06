import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './AuthProvider';

const Login = ({ onSwitchToRegister, onSwitchToOrgSignup }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser = {
        id: Date.now(),
        email: data.email,
        name: data.email.split('@')[0],
        role: 'member'
      };
      
      const mockOrganization = {
        id: 1,
        name: 'Demo Organization',
        plan: 'free'
      };
      
      login(mockUser, mockOrganization);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-subtitle">Welcome back to TaskFlow</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={isLoading} className="auth-button primary">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? 
            <button onClick={onSwitchToRegister} className="link-button">
              Sign up
            </button>
          </p>
          <p>
            Need to create an organization? 
            <button onClick={onSwitchToOrgSignup} className="link-button">
              Create Organization
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;