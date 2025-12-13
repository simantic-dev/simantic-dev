import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWaitlistStatus } from '../hooks/useWaitlistStatus';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { isAccepted, loading } = useWaitlistStatus(currentUser?.uid);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  // Waitlist screen
  if (!isAccepted) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card waitlist-card">
          <div className="waitlist-content">
            <h1>Thank You for Joining the Waitlist</h1>
            <p className="waitlist-message">
              We'll let you know when you are in.
            </p>
            {currentUser?.photoURL && (
              <img 
                src={currentUser.photoURL} 
                alt="User avatar" 
                className="user-avatar"
              />
            )}
            <div className="user-details">
              <h2>{currentUser?.displayName || 'User'}</h2>
              <p className="user-email">{currentUser?.email}</p>
            </div>
            <div className="dashboard-actions">
              <button onClick={handleSignOut} className="signout-button">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Actual dashboard for accepted users
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome to Your Dashboard</h1>
        <div className="user-info">
          {currentUser?.photoURL && (
            <img 
              src={currentUser.photoURL} 
              alt="User avatar" 
              className="user-avatar"
            />
          )}
          <div className="user-details">
            <h2>{currentUser?.displayName || 'User'}</h2>
            <p className="user-email">{currentUser?.email}</p>
            <p className="user-id">UID: {currentUser?.uid}</p>
          </div>
        </div>
        
        <div className="dashboard-actions">
          <button onClick={handleSignOut} className="signout-button">
            Sign Out
          </button>
        </div>

        {/* Add your actual dashboard content here */}
        <div className="dashboard-content">
          <h2>Dashboard Content</h2>
          <p>This is where your main dashboard features will go.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
