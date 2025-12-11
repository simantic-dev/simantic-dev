import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
      </div>
    </div>
  );
};

export default Dashboard;
