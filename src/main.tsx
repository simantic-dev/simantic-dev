import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, href } from 'react-router-dom';
import './index.css';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
import CaseStudies from './pages/CaseStudies.tsx';
import Join from './pages/Join';
import PitchDeck from './pages/PitchDeck';
import Login from './pages/Login';
import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import Invoice from './pages/Invoice';
import EnterpriseContact from './pages/EnterpriseContact';
import logo from '../images/simantic_logo_3.svg';
import SimpleNavbar from './components/SimpleNavbar.tsx';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <AuthProvider>
        <SimpleNavbar
          logo={logo}
          logoAlt="Company Logo"
          buttonBgColor="#111"
          buttonTextColor="#fff"
        />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/join" element={<Join />} />
          <Route path="/pitchdeck" element={<PitchDeck />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/invoice" element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          } />
          <Route path="/enterprise-contact" element={<EnterpriseContact />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

