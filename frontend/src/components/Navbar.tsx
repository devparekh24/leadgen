'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="logo-icon">⚡</span>
          <span className="logo-text text-gradient">SaaSquatch</span>
        </div>
        
        <ul className="navbar-links">
          <li>
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/pipeline" className={`nav-link ${pathname === '/pipeline' ? 'active' : ''}`}>
              Pipeline
            </Link>
          </li>
          <li>
            <Link href="/campaigns" className={`nav-link ${pathname === '/campaigns' ? 'active' : ''}`}>
              Campaigns
            </Link>
          </li>
          <li>
            <Link href="/integrations" className={`nav-link ${pathname === '/integrations' ? 'active' : ''}`}>
              Integrations
            </Link>
          </li>
          <li>
            <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
              Settings
            </Link>
          </li>
        </ul>

        <div className="navbar-actions">
          <div className="user-avatar">SA</div>
        </div>
      </div>
    </nav>
  );
}
