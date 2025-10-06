import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './AuthProvider';

const OrganizationSignup = ({ onSwitchToLogin }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: org details, 2: admin user
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('adminPassword');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful organization creation
      const mockOrganization = {
        id: Date.now(),
        name: data.organizationName,
        plan: data.plan || 'free',
        domain: data.organizationName.toLowerCase().replace(/\s+/g, '-')
      };
      
      const mockAdminUser = {
        id: Date.now(),
        email: data.adminEmail,
        name: data.adminName,
        role: 'admin'
      };
      
      login(mockAdminUser, mockOrganization);
    } catch {
      setError('Failed to create organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card large">
        <h2>Create Organization</h2>
        <p className="auth-subtitle">Set up your team workspace</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  {...register('organizationName', {
                    required: 'Organization name is required',
                    minLength: {
                      value: 2,
                      message: 'Organization name must be at least 2 characters'
                    }
                  })}
                  className={errors.organizationName ? 'error' : ''}
                />
                {errors.organizationName && <span className="field-error">{errors.organizationName.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="plan">Plan</label>
                <select
                  id="plan"
                  {...register('plan', { required: 'Please select a plan' })}
                  className={errors.plan ? 'error' : ''}
                >
                  <option value="">Select a plan</option>
                  <option value="free">Free (Up to 5 users)</option>
                  <option value="pro">Pro (Up to 50 users)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </select>
                {errors.plan && <span className="field-error">{errors.plan.message}</span>}
              </div>

              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="auth-button primary"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Admin Account</h3>
              
              <div className="form-group">
                <label htmlFor="adminName">Admin Name</label>
                <input
                  type="text"
                  id="adminName"
                  {...register('adminName', {
                    required: 'Admin name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  className={errors.adminName ? 'error' : ''}
                />
                {errors.adminName && <span className="field-error">{errors.adminName.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adminEmail">Admin Email</label>
                <input
                  type="email"
                  id="adminEmail"
                  {...register('adminEmail', {
                    required: 'Admin email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={errors.adminEmail ? 'error' : ''}
                />
                {errors.adminEmail && <span className="field-error">{errors.adminEmail.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adminPassword">Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  {...register('adminPassword', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className={errors.adminPassword ? 'error' : ''}
                />
                {errors.adminPassword && <span className="field-error">{errors.adminPassword.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmAdminPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmAdminPassword"
                  {...register('confirmAdminPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === password || 'Passwords do not match'
                  })}
                  className={errors.confirmAdminPassword ? 'error' : ''}
                />
                {errors.confirmAdminPassword && <span className="field-error">{errors.confirmAdminPassword.message}</span>}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="auth-button secondary"
                >
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="auth-button primary">
                  {isLoading ? 'Creating organization...' : 'Create Organization'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-links">
          <p>
            Already have an account? 
            <button onClick={onSwitchToLogin} className="link-button">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignup;