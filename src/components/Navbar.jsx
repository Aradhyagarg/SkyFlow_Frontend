import React from 'react';
import { Plane, LogOut } from 'lucide-react';

function Navbar({ token, userRole, userEmail, activeTab, setActiveTab, handleLogout, setSelectedFlight }) {
  return (
    <header className="glass-panel" style={{
      margin: '20px',
      padding: '16px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          padding: '10px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Plane size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, tracking: '0.5px' }}>
            SkyFlow <span style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Aero</span>
          </h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      {token && (
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn-secondary ${activeTab === 'flights' ? 'btn-primary' : ''}`}
            onClick={() => { setActiveTab('flights'); setSelectedFlight(null); }}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Search Flights
          </button>
          <button 
            className={`btn-secondary ${activeTab === 'bookings' ? 'btn-primary' : ''}`}
            onClick={() => { setActiveTab('bookings'); }}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            My Trips
          </button>
          <button 
            className={`btn-secondary ${activeTab === 'profile' ? 'btn-primary' : ''}`}
            onClick={() => { setActiveTab('profile'); }}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            My Profile
          </button>
          {userRole === 'admin' && (
            <button 
              className={`btn-secondary ${activeTab === 'admin' ? 'btn-primary' : ''}`}
              onClick={() => { setActiveTab('admin'); }}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Admin Control
            </button>
          )}
        </nav>
      )}

      {/* User Info / State */}
      <div>
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{userEmail}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {userRole}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-secondary" style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'rgba(244, 63, 94, 0.3)',
              color: 'var(--color-accent)'
            }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => setActiveTab('auth')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Login / Signup
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
