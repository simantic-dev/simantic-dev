import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GithubAuthProvider, GoogleAuthProvider, linkWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import './Login.css';

const Login: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGithubSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const provider = new GithubAuthProvider();
      
      // Optional: Request additional scopes
      provider.addScope('user:email');
      
      const result = await signInWithPopup(auth, provider);
      
      // You can access GitHub access token here if needed
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      console.log('Successfully signed in:', result.user);
      console.log('GitHub token:', token);
      
      // Redirect to home or dashboard after successful login
      navigate('/');
    } catch (err: any) {
      console.error('Error signing in with GitHub:', err);
      
      // Handle specific error cases
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Another sign-in popup is already open.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Try signing in with the other provider first, then link your accounts in Account Settings.');
      } else {
        setError(err.message || 'Failed to sign in with GitHub. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      
      // Optional: Request additional scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // You can access Google access token here if needed
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      console.log('Successfully signed in:', result.user);
      console.log('Google token:', token);
      
      // Redirect to home or dashboard after successful login
      navigate('/');
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      
      // Handle specific error cases
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Another sign-in popup is already open.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Try signing in with the other provider first, then link your accounts in Account Settings.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to Simantic</h1>
          <p>Sign in to continue</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="signin-buttons">
          <button
            className="google-signin-button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FaGoogle className="provider-icon" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <button
            className="github-signin-button"
            onClick={handleGithubSignIn}
            disabled={loading}
          >
            <FaGithub className="provider-icon" />
            {loading ? 'Signing in...' : 'Sign in with GitHub'}
          </button>
        </div>

        <div className="login-footer">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
