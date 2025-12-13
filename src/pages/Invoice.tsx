import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWaitlistStatus } from '../hooks/useWaitlistStatus';
import './Invoice.css';

const Invoice: React.FC = () => {
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

  const handleContactSales = () => {
    navigate('/enterprise-contact');
  };

  if (loading) {
    return (
      <div className="invoice-container">
        <div className="invoice-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  // Waitlist screen for users not yet accepted
  if (!isAccepted) {
    return (
      <div className="invoice-container">
        <div className="invoice-card waitlist-card">
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
            <div className="invoice-actions">
              <button onClick={handleSignOut} className="signout-button">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invoice page for accepted users
  return (
    <div className="invoice-container">
      <div className="invoice-card">
        <h1>Subscription & Billing</h1>
        
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
          </div>
        </div>

        <div className="invoice-content">
          <div className="current-plan">
            <h2>Current Plan</h2>
            <div className="plan-details">
              <div className="plan-name">Basic (Free)</div>
              <p className="plan-description">You're currently on the free plan.</p>
            </div>
          </div>

          <div className="available-plans">
            <h2>Available Plans</h2>
            <div className="plans-grid">
              <div className="plan-card">
                <h3>Pro</h3>
                <div className="price">$10<span>/month</span></div>
                <ul className="features">
                  <li>Everything in Basic</li>
                  <li>Support for Altium, Eagle, and other CAD software</li>
                  <li>Simulated analog signal analysis</li>
                  <li>Dedicated customer support</li>
                </ul>
                <button className="upgrade-button">Upgrade to Pro</button>
              </div>
              
              <div className="plan-card">
                <h3>Enterprise</h3>
                <div className="price">Custom</div>
                <ul className="features">
                  <li>Everything in Pro</li>
                  <li>Custom integration into your organization's workflow</li>
                  <li>SAML / Enterprise SSO</li>
                  <li>Priority Support</li>
                </ul>
                <button className="upgrade-button" onClick={handleContactSales}>Contact Sales</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
