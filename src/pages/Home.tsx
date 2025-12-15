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

    // Observe sections, dividers, and footer
    const sections = document.querySelectorAll('.home-section, .home-divider, .home-footer');
    sections.forEach((section) => observer.observe(section));

    // Architecture carousel rotation
    const architectureItems = document.querySelectorAll('.architecture-item');
    const totalItems = architectureItems.length;
    let currentIndex = 0;

    const updateCarousel = () => {
      architectureItems.forEach((item, index) => {
        const position = (index - currentIndex + totalItems) % totalItems;
        let dataPosition;
        
        if (position === 0) {
          dataPosition = '0'; // center
        } else if (position === 1) {
          dataPosition = '1'; // right
        } else if (position === totalItems - 1) {
          dataPosition = '-1'; // left
        } else {
          dataPosition = '2'; // hidden
        }
        
        item.setAttribute('data-position', dataPosition);
      });
    };

    // Initial setup
    updateCarousel();

    // Auto-rotate every 2 seconds
    const carouselInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalItems;
      updateCarousel();
    }, 2000);

    return () => {
      observer.disconnect();
      clearInterval(carouselInterval);
    };
  }, []);

  return (
    <main className='home'>
      <div className="home-content">
        <h1 className="silkscreen-regular">Simantic</h1>
        <h2 className="silkscreen-regular">Test hardware without hardware</h2>
      </div>
      <PCBHoverEffect />
      
      <div className="home-divider"></div>
      
      <section id="mission" className="home-section">
        <h2 className="silkscreen-regular">Our mission</h2>
        <div className="plus-jakarta-sans-regular">
          <p>At Simantic, our mission is to accelerate hardware development by providing engineers with a powerful simulation platform that lets you test and validate your designs without physical prototypes.</p>
          <p>Simulate everything for you to know what your board does. Everything from the firmware running on the MCU, to the physics defining the electronics.</p>
        </div>
      </section>
      
      <div className="home-divider"></div>
      
      <section id="features" className="home-section">
        <h2 className="silkscreen-regular">Features</h2>
        <div className="features-grid">
          <div className="feature-card plus-jakarta-sans-regular">
            <h3>Test PCBs with Emulated Firmware and Simulated Electronics</h3>
            <p>Run firmware source code on a virtual processor while simulating the physical behavior of your PCB. Catch bugs and validate designs before manufacturing, saving time and money on physical prototypes.</p>
          </div>
          
          <div className="feature-card plus-jakarta-sans-regular">
            <h3>Automated CI/CD Pipelines for Hardware Projects</h3>
            <div className="ci-cd-demo">
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-buttons">
                    <span className="terminal-button close"></span>
                    <span className="terminal-button minimize"></span>
                    <span className="terminal-button maximize"></span>
                  </div>
                  <div className="terminal-title">Terminal</div>
                </div>
                <div className="terminal-body">
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> git add .</span>
                  </div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> git commit -m "Update PCB layout"</span>
                  </div>
                  <div className="terminal-line terminal-output">[main 3f7a891] Update PCB layout</div>
                  <div className="terminal-line terminal-output"> 2 files changed, 45 insertions(+)</div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> git push origin main</span>
                  </div>
                  <div className="terminal-line terminal-output">Enumerating objects: 5, done.</div>
                  <div className="terminal-line terminal-output">Writing objects: 100% (3/3)</div>
                  <div className="terminal-line terminal-output">To github.com:user/pcb-project.git</div>
                  <div className="terminal-line terminal-output"> 3f7a891..7b2c4d5  main → main</div>
                </div>
              </div>
              
              <div className="github-actions-window">
                <div className="terminal-header">
                  <div className="terminal-buttons">
                    <span className="terminal-button close"></span>
                    <span className="terminal-button minimize"></span>
                    <span className="terminal-button maximize"></span>
                  </div>
                  <div className="terminal-title">GitHub Actions</div>
                </div>
                <div className="github-body">
                  <div className="github-workflow">
                    <div className="workflow-header">
                      <span className="workflow-name">Testing commit hash 3f7a891</span>
                    </div>
                    <div className="workflow-steps">
                      <div className="workflow-step completed">
                        <span className="step-icon">✓</span>
                        <span className="step-name">Checkout code</span>
                        <span className="step-time">2s</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">STM32F401 detected</span>
                      </div>
                      <div className="workflow-step completed">
                        <span className="step-icon">✓</span>
                        <span className="step-name">Static source code analysis</span>
                        <span className="step-time">8s</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">Checking MISRA compliance</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon warning">⚠</span>
                        <span className="substep-text">Unused variable 'sensorData' at line 42 of ./Core/src/imu.c</span>
                      </div>
                      <div className="workflow-step completed">
                        <span className="step-icon">✓</span>
                        <span className="step-name">Building PCB from KiCad project</span>
                        <span className="step-time">8s</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">Generating netlist</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">Synthesizing circuit from netlist</span>
                      </div>
                      <div className="workflow-step completed">
                        <span className="step-icon">✓</span>
                        <span className="step-name">Build firmware for STM32F401</span>
                        <span className="step-time">15s</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">arm-none-eabi-gcc -mcpu=cortex-m4 -mthumb -mfloat-abi=hard -O2</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">Build complete: firmware.elf (42.3 KB)</span>
                      </div>
                      <div className="workflow-step completed">
                        <span className="step-icon">✓</span>
                        <span className="step-name">Hardware emulation</span>
                        <span className="step-time">12s</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">Starting simulation: Setting Vin=3.3V</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">Loading firmware.elf to STM32F401</span>
                      </div>
                      <div className="workflow-substep">
                        <span className="substep-icon passed">✓</span>
                        <span className="substep-text">Checking UART inputs and outputs</span>
                      </div>
                      <div className="workflow-step completed">
                        <span className="step-icon">✓</span>
                        <span className="step-name">Signal integrity check</span>
                        <span className="step-time">6s</span>
                      </div>
                      <div className="workflow-step success">
                        <span className="step-icon">✓</span>
                        <span className="step-name">All checks passed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p>Integrate hardware testing into your development workflow with automated regression testing on every commit. Detect issues early and maintain design quality throughout your project lifecycle.</p>
          </div>
          
          <div className="feature-card plus-jakarta-sans-regular">
            <h3>Support for 100+ MCUs, SoCs, and FPGAs</h3>
            <div className="architecture-carousel">
              <div className="architecture-track">
                <span className="architecture-item" data-index="0">ARM Cortex-M</span>
                <span className="architecture-item" data-index="1">ARM Cortex-A</span>
                <span className="architecture-item" data-index="2">ARM Cortex-R</span>
                <span className="architecture-item" data-index="3">RISC-V</span>
                <span className="architecture-item" data-index="4">x86</span>
                <span className="architecture-item" data-index="5">SPARC</span>
                <span className="architecture-item" data-index="6">PowerPC</span>
                <span className="architecture-item" data-index="7">MIPS</span>
                <span className="architecture-item" data-index="8">Xtensa</span>
              </div>
            </div>
            <p>Emulate a wide range of processor architectures and hardware platforms. From embedded microcontrollers to complex SoCs and FPGAs, test your designs across multiple target devices without needing physical hardware.</p>
          </div>
        </div>
      </section>
      
      <div className="home-divider"></div>
      
      <section id="pricing" className="home-section pricing-section">
        <h2 className="silkscreen-regular">Pricing</h2>
        <div className="pricing-table">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">$0<span>/month</span></div>
            <p className="pricing-description plus-jakarta-sans-regular">Best for individuals getting started</p>
            <ul className="features plus-jakarta-sans-regular">
              <li>Seamless GitHub integration</li>
              <li>Support for KiCad projects</li>
              <li>Firmware emulation on 100+ MCUs and SoCs</li>
              <li>Logic analyzers on simulated signals</li>
            </ul>
            <button className="pricing-button" onClick={handleGetStarted}>Get Started</button>
          </div>
          
          <div className="pricing-card featured">
            <h3>Pro</h3>
            <div className="price">$30<span>/month</span></div>
            <p className="pricing-description plus-jakarta-sans-regular">Best for professionals and teams</p>
            <ul className="features plus-jakarta-sans-regular">
              <li>Everything in Basic</li>
              <li>Support for Altium, Eagle, and other CAD software</li>
              <li>FPGA logic emulation</li>
              <li>Signal integrity testing and analysis</li>
              <li>Dedicated customer support</li>
            </ul>
            <button className="pricing-button" onClick={handleGetStarted}>Get Started</button>
          </div>
          
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <p className="pricing-description plus-jakarta-sans-regular">For large organizations</p>
            <ul className="features plus-jakarta-sans-regular">
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
