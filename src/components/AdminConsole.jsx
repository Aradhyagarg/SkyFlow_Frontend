import React from 'react';
import { Settings, AlertTriangle, CheckCircle } from 'lucide-react';

function AdminConsole({ 
  adminFlights, 
  adminError, 
  adminSuccess, 
  updatingFlightId, 
  setUpdatingFlightId, 
  selectedStatus, 
  setSelectedStatus, 
  handleUpdateStatus 
}) {
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={24} color="var(--color-primary)" />
        Airline Administrative Console
      </h2>

      {adminError && (
        <div className="glass-panel" style={{
          background: 'rgba(244, 63, 94, 0.1)',
          borderColor: 'var(--color-accent)',
          color: 'var(--color-accent)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={20} />
          {adminError}
        </div>
      )}

      {adminSuccess && (
        <div className="glass-panel" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10b981',
          color: '#34d399',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle size={20} />
          {adminSuccess}
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Flight Number</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Route</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Departure Time</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Remaining Seats</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Current Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Update Status Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminFlights.map((flight) => (
                <tr key={flight.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition-smooth)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>{flight.flightNumber}</td>
                  <td style={{ padding: '16px 24px' }}>{flight.departureAirportId} ➔ {flight.arrivalAirportId}</td>
                  <td style={{ padding: '16px 24px' }}>{new Date(flight.departureTime).toLocaleString()}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{flight.totalSeats} seats</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`status-badge ${flight.status || 'scheduled'}`}>
                      {flight.status || 'scheduled'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {updatingFlightId === flight.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select 
                          className="form-input"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#0a0b10' }}
                        >
                          <option value="">-- select status --</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="delayed">Delayed</option>
                          <option value="boarding">Boarding</option>
                          <option value="departed">Departed</option>
                          <option value="landed">Landed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button onClick={() => handleUpdateStatus(flight.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Save
                        </button>
                        <button onClick={() => setUpdatingFlightId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setUpdatingFlightId(flight.id); setSelectedStatus(flight.status || 'scheduled'); }}
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Settings size={14} />
                        Change Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminConsole;
