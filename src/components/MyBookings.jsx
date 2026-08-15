import React from 'react';
import { Ticket, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

function MyBookings({ 
  loadingHistory, 
  historyError, 
  upcomingBookings, 
  pastBookings 
}) {
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Ticket size={24} color="var(--color-primary)" />
        My Itinerary Portfolio
      </h2>

      {loadingHistory ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            border: '4px solid var(--glass-border)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Fetching your history...</p>
        </div>
      ) : historyError ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-accent)' }}>
          <AlertTriangle size={32} style={{ marginBottom: '12px' }} />
          <p>{historyError}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Upcoming Trips */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
              <CheckCircle size={18} />
              Upcoming Journeys ({upcomingBookings.length})
            </h3>
            
            {upcomingBookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No upcoming trips scheduled.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="glass-panel" style={{ padding: '24px 30px' }}>
                    {/* Top row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      borderBottom: '1px solid var(--glass-border)',
                      paddingBottom: '14px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PNR Code</span>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-secondary)' }}>{booking.pnr}</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Status</span>
                          <div>
                            <span className={`status-badge ${booking.status === 'initiated' ? 'boarding' : 'scheduled'}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fare Charged</span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{booking.totalCost}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Flight detail row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '20px',
                      background: 'rgba(0,0,0,0.15)',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Flight</span>
                        <h5 style={{ fontWeight: 800 }}>{booking.flightDetails?.flightNumber || 'DEL-101'}</h5>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Route</span>
                        <p style={{ fontWeight: 700 }}>
                          {booking.flightDetails?.departureAirportId} ➔ {booking.flightDetails?.arrivalAirportId}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gate</span>
                        <p style={{ fontWeight: 600 }}>{booking.flightDetails?.boardingGate || 'Gate A2'}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Departure Time</span>
                        <p style={{ fontWeight: 600 }}>
                          {new Date(booking.flightDetails?.departureTime).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Passengers list */}
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Boarding Passengers ({booking.passengers?.length || 0})
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                        {booking.passengers?.map((passenger) => (
                          <div key={passenger.id} className="glass-panel" style={{
                            padding: '12px 16px',
                            fontSize: '0.85rem',
                            background: 'rgba(255,255,255,0.01)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <p style={{ fontWeight: 700 }}>{passenger.firstName} {passenger.lastName}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket: {passenger.ticketNumber}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Seat {passenger.seatNumber}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {passenger.seatType}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Trips */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <Clock size={18} />
              Past & Cancelled Journeys ({pastBookings.length})
            </h3>
            
            {pastBookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No past or cancelled journeys.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="glass-panel" style={{ padding: '24px 30px', opacity: 0.7 }}>
                    {/* Top row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      borderBottom: '1px solid var(--glass-border)',
                      paddingBottom: '14px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PNR Code</span>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{booking.pnr}</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                          <div>
                            <span className={`status-badge ${booking.status || 'cancelled'}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cost</span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{booking.totalCost}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Flight details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                      <span>Flight: <strong>{booking.flightDetails?.flightNumber || 'DEL-101'}</strong></span>
                      <span>Route: <strong>{booking.flightDetails?.departureAirportId} ➔ {booking.flightDetails?.arrivalAirportId}</strong></span>
                      <span>Departed: {new Date(booking.flightDetails?.departureTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default MyBookings;
