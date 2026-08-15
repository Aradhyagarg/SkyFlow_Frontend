import React from 'react';
import { AlertTriangle } from 'lucide-react';

function SeatMap({ 
  selectedFlight, 
  setSelectedFlight, 
  seats, 
  selectedSeats, 
  handleToggleSeat, 
  passengersData, 
  handlePassengerChange, 
  bookingLoading, 
  bookingError, 
  handleConfirmBooking, 
  getSubtotalBill,
  // Round trip props
  searchMode,
  seatMapStep,
  handleNextSeatSelection,
  handleBackToOutboundSeats
}) {
  const getSeatInfo = (seat) => {
    const basePrice = selectedFlight.price;
    let price = basePrice;
    let label = 'Economy Class';
    if (seat.type === 'premium-economy') {
      price = Math.round(basePrice * 1.4);
      label = 'Premium Economy';
    } else if (seat.type === 'business') {
      price = Math.round(basePrice * 2.0);
      label = 'Business Class';
    } else if (seat.type === 'first-class') {
      price = Math.round(basePrice * 3.0);
      label = 'First Class';
    }
    return { price, label };
  };

  // Group seats by row, and insert aisle in the middle of each row (A, B, C, Aisle, D, E, F)
  const getStructuredGrid = () => {
    const rows = {};
    seats.forEach(seat => {
      if (!rows[seat.row]) {
        rows[seat.row] = [];
      }
      rows[seat.row].push(seat);
    });

    const grid = [];
    const sortedRowNumbers = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedRowNumbers.forEach(rowNum => {
      const rowSeats = rows[rowNum];
      rowSeats.sort((a, b) => a.col.localeCompare(b.col));

      const colA = rowSeats.find(s => s.col === 'A');
      const colB = rowSeats.find(s => s.col === 'B');
      const colC = rowSeats.find(s => s.col === 'C');
      const colD = rowSeats.find(s => s.col === 'D');
      const colE = rowSeats.find(s => s.col === 'E');
      const colF = rowSeats.find(s => s.col === 'F');

      if (colA) grid.push(colA); else grid.push({ isBlank: true, row: rowNum, col: 'A' });
      if (colB) grid.push(colB); else grid.push({ isBlank: true, row: rowNum, col: 'B' });
      if (colC) grid.push(colC); else grid.push({ isBlank: true, row: rowNum, col: 'C' });
      
      // Middle Aisle labeled with the Row Number
      grid.push({ isAisle: true, row: rowNum, label: rowNum });
      
      if (colD) grid.push(colD); else grid.push({ isBlank: true, row: rowNum, col: 'D' });
      if (colE) grid.push(colE); else grid.push({ isBlank: true, row: rowNum, col: 'E' });
      if (colF) grid.push(colF); else grid.push({ isBlank: true, row: rowNum, col: 'F' });
    });

    return grid;
  };

  const isLocked = searchMode === 'roundtrip' && seatMapStep === 2;

  return (
    <div className="glass-panel" style={{ padding: '30px' }}>
      {/* Back button */}
      {isLocked ? (
        <button onClick={handleBackToOutboundSeats} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '24px' }}>
          ← Back to Outbound Seats
        </button>
      ) : (
        <button onClick={() => setSelectedFlight(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '24px' }}>
          ← Back to Search
        </button>
      )}

      {/* Round Trip Steps Header */}
      {searchMode === 'roundtrip' && (
        <div style={{
          background: 'rgba(138, 92, 246, 0.1)',
          border: '1px solid rgba(138, 92, 246, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: 'var(--color-primary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          {seatMapStep === 1 
            ? 'Step 1 of 2: Select seats and enter passenger details for your OUTBOUND flight.' 
            : 'Step 2 of 2: Select seats for your RETURN flight. Passenger details are locked.'
          }
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {searchMode === 'roundtrip' ? (seatMapStep === 1 ? 'Outbound Flight' : 'Return Flight') : 'Flight Details'}
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            {selectedFlight.flightNumber} ({selectedFlight.departureAirportId} ➔ {selectedFlight.arrivalAirportId})
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base Price</span>
          <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-secondary)', marginTop: '4px' }}>₹{selectedFlight.price}</h4>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px'
      }}>
        {/* Left Column: Visual Seat Map */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
            Airplane Seat Configuration
          </h4>
          
          {/* Legend */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(138, 92, 246, 0.15)', border: '1px solid rgba(138, 92, 246, 0.3)' }}></div>
              <span>Economy (1.0x)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}></div>
              <span>Premium Eco (1.4x)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)' }}></div>
              <span>Business (2.0x)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)' }}></div>
              <span>First (3.0x)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #10b981, #059669)' }}></div>
              <span>Selected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)' }}></div>
              <span>Occupied</span>
            </div>
          </div>

          {bookingError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--color-accent)',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {bookingError}
            </div>
          )}

          {/* Seat Grid wrapped in airplane cabin fuselage */}
          <div className="cabin-fuselage">
            <div className="seat-map-grid">
              {getStructuredGrid().map((seat, index) => {
                if (seat.isAisle) {
                  return (
                    <div key={`aisle-${seat.row}-${index}`} className="seat-cell aisle" style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {seat.label}
                    </div>
                  );
                }
  
                if (seat.isBlank) {
                  return (
                    <div key={`blank-${seat.row}-${seat.col}-${index}`} className="seat-cell vacant" style={{ opacity: 0, pointerEvents: 'none' }}></div>
                  );
                }
  
                const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
                const { price, label } = getSeatInfo(seat);
                const tooltipText = seat.isBooked 
                  ? "Seat Occupied" 
                  : `Seat ${seat.seatNumber} (${label}) — ₹${price.toLocaleString()}`;
  
                return (
                  <div 
                    key={seat.id}
                    onClick={() => handleToggleSeat(seat)}
                    className={`seat-cell ${seat.isBooked ? 'booked' : 'vacant'} ${seat.type} ${isSelected ? 'selected' : ''}`}
                    data-tooltip={tooltipText}
                  >
                    {seat.seatNumber}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Form */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>
            Selected Seats & Passengers Details ({selectedSeats.length})
          </h4>

          {selectedSeats.length === 0 ? (
            <div style={{
              height: '200px',
              border: '2px dashed var(--glass-border)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              Select one or more seats on the grid to begin checkout
            </div>
          ) : (
            <form onSubmit={searchMode === 'roundtrip' && seatMapStep === 1 ? (e) => { e.preventDefault(); handleNextSeatSelection(); } : handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                {passengersData.map((passenger, idx) => (
                  <div key={passenger.seatNumber} className="glass-panel" style={{
                    padding: '20px',
                    background: 'rgba(0,0,0,0.15)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        Passenger {idx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'var(--glass-bg)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        Seat {passenger.seatNumber} ({selectedSeats[idx]?.type})
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>First Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          required
                          value={passenger.firstName}
                          onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)}
                          disabled={isLocked}
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Last Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          required
                          value={passenger.lastName}
                          onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)}
                          disabled={isLocked}
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Age</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          required
                          min="1"
                          max="120"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                          disabled={isLocked}
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Gender</label>
                        <select 
                          className="form-input"
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                          disabled={isLocked}
                          style={{ padding: '8px 12px', fontSize: '0.85rem', background: '#0a0b10' }}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Passport / ID Number (Optional)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={passenger.passportNumber}
                        onChange={(e) => handlePassengerChange(idx, 'passportNumber', e.target.value)}
                        disabled={isLocked}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* In-Flight Add-Ons selection */}
                    <div style={{ marginTop: '16px', borderTop: '1px dashed var(--glass-border)', paddingTop: '14px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                        In-Flight Add-Ons (Ancillaries)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={passenger.hasExtraBaggage || false}
                            onChange={(e) => handlePassengerChange(idx, 'hasExtraBaggage', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>Add Extra Baggage (+15kg) (+₹1,000)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={passenger.hasMeal || false}
                            onChange={(e) => handlePassengerChange(idx, 'hasMeal', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>Add Gourmet Meal (+₹350)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={passenger.hasInsurance || false}
                            onChange={(e) => handlePassengerChange(idx, 'hasInsurance', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>Add Travel Insurance (+₹299)</span>
                        </label>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Bill details */}
              <div className="glass-panel" style={{
                padding: '20px',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Passenger Count</span>
                  <span>{selectedSeats.length} travelers</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                  <span>Total Billing</span>
                  <span style={{ color: 'var(--color-secondary)' }}>₹{getSubtotalBill()}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={bookingLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '50px'
                }}
              >
                {bookingLoading ? 'Processing...' : (
                  searchMode === 'roundtrip' && seatMapStep === 1 
                    ? 'Next: Select Return Seats ➔' 
                    : 'Confirm Bookings & Pay'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeatMap;
