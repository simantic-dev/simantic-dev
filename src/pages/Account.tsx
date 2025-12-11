import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
              <span className="detail-label">Provider</span>
              <span className="detail-value">
                {currentUser.providerData[0]?.providerId === 'github.com' ? 'GitHub' : 'Unknown'}
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
