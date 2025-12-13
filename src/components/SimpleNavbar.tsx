import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SimpleNavbar.css';

export interface SimpleNavbarProps {
  logo: string;
  logoAlt?: string;
  className?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({
  logo,
  logoAlt = 'Logo',
  className = '',
  buttonBgColor = '#111',
  buttonTextColor = '#fff'
}) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  // Close account menu when clicking outside
  useEffect(() => {
    if (!showAccountMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-menu-wrapper')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAccountMenu]);

  return (
    <>
      <nav className={`simple-navbar ${className}`}>
        <div className="simple-navbar-content">
          <Link 
            to="/" 
            className="navbar-logo" 
            aria-label="Home"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img src={logo} alt={logoAlt} />
          </Link>

          {/* Hamburger Menu Button */}
          <button 
            className="hamburger-menu"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`navbar-links-center ${showMobileMenu ? 'mobile-open' : ''}`}>
            <a 
              href="/#features" 
              className="nav-link"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
                setShowMobileMenu(false);
              }}
            >
              Features
            </a>
            <a 
              href="/#pricing" 
              className="nav-link"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }
                setShowMobileMenu(false);
              }}
            >
              Pricing
            </a>
            <Link to="/join" className="nav-link" onClick={() => setShowMobileMenu(false)}>
              Join
            </Link>
            <Link 
              to={currentUser ? "/dashboard" : "/login"} 
              className="nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
          </div>
          
          <div className={`navbar-links-right ${showMobileMenu ? 'mobile-open' : ''}`}>
            {currentUser ? (
              <div className="account-menu-wrapper">
                <button
                  className="account-button"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                  aria-label="Account Menu"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  Account
                </button>
                {showAccountMenu && (
                  <div className="account-dropdown">
                    <div className="account-dropdown-header">
                      {currentUser.photoURL && (
                        <img src={currentUser.photoURL} alt="User avatar" className="account-avatar" />
                      )}
                      <div className="account-info">
                        <div className="account-name">{currentUser.displayName || 'User'}</div>
                        <div className="account-email">{currentUser.email}</div>
                      </div>
                    </div>
                    <div className="account-dropdown-links">
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          navigate('/account');
                        }}
                        className="account-link"
                      >
                        Account
                      </button>
                      <button
                        onClick={async () => {
                          setShowAccountMenu(false);
                          await signOut();
                          navigate('/');
                        }}
                        className="signout-link"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="account-button"
                style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                aria-label="Login"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default SimpleNavbar;
