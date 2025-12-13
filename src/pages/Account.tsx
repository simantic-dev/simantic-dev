import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { linkWithPopup, unlink, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import './Account.css';

const Account: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [linkError, setLinkError] = useState<string>('');
  const [linkSuccess, setLinkSuccess] = useState<string>('');
  const [linkingProvider, setLinkingProvider] = useState<string>('');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLinkProvider = async (providerId: string) => {
    if (!currentUser) return;
    
    try {
      setLinkError('');
      setLinkSuccess('');
      setLinkingProvider(providerId);
      
      let provider;
      let providerName;
      
      if (providerId === 'google.com') {
        provider = new GoogleAuthProvider();
        providerName = 'Google';
      } else if (providerId === 'github.com') {
        provider = new GithubAuthProvider();
        providerName = 'GitHub';
      } else {
        return;
      }
      
      await linkWithPopup(currentUser, provider);
      setLinkSuccess(`Successfully linked ${providerName} account!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setLinkSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error linking provider:', error);
      
      if (error.code === 'auth/provider-already-linked') {
        setLinkError('This provider is already linked to your account.');
      } else if (error.code === 'auth/credential-already-in-use') {
        setLinkError('This account is already linked to another user.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLinkError('Sign-in popup was closed. Please try again.');
      } else {
        setLinkError(error.message || 'Failed to link account. Please try again.');
      }
    } finally {
      setLinkingProvider('');
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    if (!currentUser) return;
    
    // Prevent unlinking if it's the only provider
    if (currentUser.providerData.length <= 1) {
      setLinkError('Cannot unlink the only sign-in method. Please link another provider first.');
      return;
    }
    
    try {
      setLinkError('');
      setLinkSuccess('');
      
      await unlink(currentUser, providerId);
      
      const providerName = providerId === 'google.com' ? 'Google' : 'GitHub';
      setLinkSuccess(`Successfully unlinked ${providerName} account!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setLinkSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error unlinking provider:', error);
      setLinkError(error.message || 'Failed to unlink account. Please try again.');
    }
  };

  const isProviderLinked = (providerId: string) => {
    return currentUser?.providerData.some(provider => provider.providerId === providerId);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="account-container">
      <div className="account-content">
        <h1 className="account-title">Account Settings</h1>
        
        <div className="account-section">
          <h2 className="section-title">Profile Information</h2>
          <div className="account-card">
            <div className="profile-header">
              {currentUser.photoURL && (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="profile-avatar-large"
                />
              )}
              <div className="profile-details">
                <div className="detail-group">
                  <label>Display Name</label>
                  <p>{currentUser.displayName || 'Not set'}</p>
                </div>
                <div className="detail-group">
                  <label>Email</label>
                  <p>{currentUser.email || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h2 className="section-title">Account Details</h2>
          <div className="account-card">
            <div className="detail-row">
              <span className="detail-label">User ID</span>
              <span className="detail-value monospace">{currentUser.uid}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email Verified</span>
              <span className={`detail-badge ${currentUser.emailVerified ? 'verified' : 'unverified'}`}>
                {currentUser.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Linked Providers</span>
              <span className="detail-value">
                {currentUser.providerData.map(provider => {
                  if (provider.providerId === 'google.com') return 'Google';
                  if (provider.providerId === 'github.com') return 'GitHub';
                  return provider.providerId;
                }).join(', ')}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Account Created</span>
              <span className="detail-value">
                {currentUser.metadata.creationTime 
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Sign In</span>
              <span className="detail-value">
                {currentUser.metadata.lastSignInTime
                  ? new Date(currentUser.metadata.lastSignInTime).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h2 className="section-title">Linked Accounts</h2>
          <div className="account-card">
            {linkError && (
              <div className="message-box error-message">
                {linkError}
              </div>
            )}
            {linkSuccess && (
              <div className="message-box success-message">
                {linkSuccess}
              </div>
            )}
            
            <div className="providers-list">
              {/* Google Provider */}
              <div className="provider-item">
                <div className="provider-info">
                  <FaGoogle className="provider-icon google-icon" />
                  <div>
                    <h3>Google</h3>
                    <p className="provider-status">
                      {isProviderLinked('google.com') ? 'Linked' : 'Not linked'}
                    </p>
                  </div>
                </div>
                {isProviderLinked('google.com') ? (
                  <button 
                    onClick={() => handleUnlinkProvider('google.com')}
                    className="unlink-button"
                    disabled={linkingProvider !== ''}
                  >
                    Unlink
                  </button>
                ) : (
                  <button 
                    onClick={() => handleLinkProvider('google.com')}
                    className="link-button"
                    disabled={linkingProvider !== ''}
                  >
                    {linkingProvider === 'google.com' ? 'Linking...' : 'Link'}
                  </button>
                )}
              </div>

              {/* GitHub Provider */}
              <div className="provider-item">
                <div className="provider-info">
                  <FaGithub className="provider-icon github-icon" />
                  <div>
                    <h3>GitHub</h3>
                    <p className="provider-status">
                      {isProviderLinked('github.com') ? 'Linked' : 'Not linked'}
                    </p>
                  </div>
                </div>
                {isProviderLinked('github.com') ? (
                  <button 
                    onClick={() => handleUnlinkProvider('github.com')}
                    className="unlink-button"
                    disabled={linkingProvider !== ''}
                  >
                    Unlink
                  </button>
                ) : (
                  <button 
                    onClick={() => handleLinkProvider('github.com')}
                    className="link-button"
                    disabled={linkingProvider !== ''}
                  >
                    {linkingProvider === 'github.com' ? 'Linking...' : 'Link'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h2 className="section-title">Actions</h2>
          <div className="account-card">
            <button onClick={handleSignOut} className="signout-button-large">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
