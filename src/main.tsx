import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, href } from 'react-router-dom';
import './index.css';
import Home from './pages/Home.tsx';
import Join from './pages/Join';
import Waitlist from './pages/Waitlist';
import About from './pages/About';
import Featured from './pages/Featured';
import CaseStudies from './pages/CaseStudies';
import logo from '../images/simantic_logo_3.svg';
import CardNav from './components/Navbar.tsx';

const items = [
  {
    label: "Company",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "About", href: "/about", ariaLabel: "About Simantic" },
      { label: "Join", href: "/join", ariaLabel: "Join the team" }
    ]
  },
  {
    label: "Projects", 
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Featured", href: "/featured", ariaLabel: "Featured Projects" },
      { label: "Case Studies", href: "/case-studies", ariaLabel: "Project Case Studies" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#271E37", 
    textColor: "#fff",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/simantic", ariaLabel: "LinkedIn" },
      { label: "Waitlist", href: "/waitlist", ariaLabel: "Join the waitlist" }
    ]
  }
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <CardNav
        logo={logo}
        logoAlt="Company Logo"
        items={items}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
      />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/featured" element={<Featured />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/join" element={<Join />} />
        <Route path="/waitlist" element={<Waitlist />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

