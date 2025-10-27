import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, href } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import logo from '../images/simantic_logo_3.svg';
import CardNav from './components/Navbar.tsx';

const items = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Company", ariaLabel: "About Company" },
      { label: "Careers", ariaLabel: "About Careers" }
    ]
  },
  {
    label: "Projects", 
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Featured", ariaLabel: "Featured Projects" },
      { label: "Case Studies", ariaLabel: "Project Case Studies" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#271E37", 
    textColor: "#fff",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/simantic", ariaLabel: "LinkedIn" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#271E37", 
    textColor: "#fff",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/simantic", ariaLabel: "LinkedIn" }
    ]
  },
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
        <Route path="/join" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

