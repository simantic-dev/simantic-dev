import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PCBHoverEffect from '../components/PCBHoverEffect';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/invoice');
    } else {
      navigate('/login');
    }
  };

  const handleContactUs = () => {
    navigate('/enterprise-contact');
  };

  useEffect(() => {
    // Handle hash navigation when component mounts
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    // Intersection Observer for section fade animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
          } else {
            entry.target.classList.remove('section-visible');
          }
        });
      },
      {
        threshold: 0.2
      }
    );

    // Observe sections and dividers
    const sections = document.querySelectorAll('.home-section, .home-divider');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <main className='home'>
      <div className="home-content">
        <h1 className="silkscreen-regular">Simantic</h1>
        <h2 className="silkscreen-regular">Test hardware without hardware</h2>
      </div>
      <PCBHoverEffect />
      
      <div className="home-divider"></div>
      
      <section id="features" className="home-section">
        <h2 className="silkscreen-regular">Section 1</h2>
        <p>Content for section 1 goes here.</p>
      </section>
      
      <div className="home-divider"></div>
      
      {/* <section id="" className="home-section">
        <h2 className="silkscreen-regular">Section 2</h2>
        <p>Content for section 2 goes here.</p>
      </section>
      
      <div className="home-divider"></div> */}
      
      <section id="pricing" className="home-section pricing-section">
        <h2 className="silkscreen-regular">Pricing</h2>
        <div className="pricing-table">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">$0<span>/month</span></div>
            <p className="pricing-description">Perfect for getting started</p>
            <ul className="features">
              <li>Seamless GitHub integration</li>
              <li>Support for KiCad projects</li>
              <li>Firmware emulation on 50+ MCUs and SoCs</li>
              <li>Basic code and simulated digital signal analysis</li>
            </ul>
            <button className="pricing-button" onClick={handleGetStarted}>Get Started</button>
          </div>
          
          <div className="pricing-card featured">
            <h3>Pro</h3>
            <div className="price">$10<span>/month</span></div>
            <p className="pricing-description">Best for growing teams</p>
            <ul className="features">
              <li>Everything in Basic</li>
              <li>Support for Altium, Eagle, and other CAD software</li>
              <li>Simulated analog signal analysis</li>
              <li>Dedicated customer support</li>
            </ul>
            <button className="pricing-button" onClick={handleGetStarted}>Get Started</button>
          </div>
          
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <p className="pricing-description">For large organizations</p>
            <ul className="features">
              <li>Everything in Pro</li>
              <li>Custom integration into your organization's workflow</li>
              <li>SAML / Enterprise SSO</li>
              <li>Priority Support</li>
            </ul>
            <button className="pricing-button" onClick={handleContactUs}>Contact Us</button>
          </div>
        </div>
      </section>
      
      <footer className="home-footer">
        <a href="https://www.linkedin.com/company/simantic/" target="_blank" rel="noopener noreferrer" aria-label="Visit Simantic on LinkedIn">
          <img src="/linkedin.svg" alt="LinkedIn" className="linkedin-logo" />
        </a>
      </footer>
    </main>
  )
}
