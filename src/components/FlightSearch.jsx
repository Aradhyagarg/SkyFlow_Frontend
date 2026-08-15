import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Plane, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const AIRPORTS = [
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' },
  { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' }
];

function FlightSearch({ 
  bookingSuccessData, 
  setBookingSuccessData, 
  setActiveTab,
  flights, 
  loadingFlights, 
  flightsError, 
  flightsWarning,
  fetchFlights, 
  srcCity, 
  setSrcCity, 
  destCity, 
  setDestCity, 
  handleSelectFlight,
  hasSearched,
  // Round trip props
  searchMode,
  setSearchMode,
  departureDate,
  setDepartureDate,
  returnDate,
  setReturnDate,
  returnFlights,
  selectedOutboundFlight,
  setSelectedOutboundFlight,
  selectedReturnFlight,
  setSelectedReturnFlight,
  handleSelectRoundTripFlights
}) {
  const [sortBy, setSortBy] = useState('price_asc');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedCarriers, setSelectedCarriers] = useState([]);

  // Get display string helper
  const getAirportDisplay = (code) => {
    const found = AIRPORTS.find(a => a.code === code);
    return found ? `${found.city} (${found.code})` : code || '';
  };

  // Autocomplete Input States
  const [srcSearch, setSrcSearch] = useState(getAirportDisplay(srcCity));
  const [destSearch, setDestSearch] = useState(getAirportDisplay(destCity));
  const [showSrcSuggestions, setShowSrcSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Synchronize internal search text with parent state changes (e.g., reset)
  useEffect(() => {
    setSrcSearch(getAirportDisplay(srcCity));
  }, [srcCity]);

  useEffect(() => {
    setDestSearch(getAirportDisplay(destCity));
  }, [destCity]);

  // Filter lists based on input text query
  const filteredSrcAirports = useMemo(() => {
    let list = AIRPORTS;
    if (destCity) {
      list = list.filter(a => a.code !== destCity);
    }
    if (!srcSearch) return list;
    // Don't show options list if it's already an exact match
    const isCompleted = list.some(a => `${a.city} (${a.code})` === srcSearch);
    if (isCompleted) return [];

    const query = srcSearch.toLowerCase();
    return list.filter(a => 
      a.city.toLowerCase().includes(query) || 
      a.code.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query)
    );
  }, [srcSearch, destCity]);

  const filteredDestAirports = useMemo(() => {
    let list = AIRPORTS;
    if (srcCity) {
      list = list.filter(a => a.code !== srcCity);
    }
    if (!destSearch) return list;
    const isCompleted = list.some(a => `${a.city} (${a.code})` === destSearch);
    if (isCompleted) return [];

    const query = destSearch.toLowerCase();
    return list.filter(a => 
      a.city.toLowerCase().includes(query) || 
      a.code.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query)
    );
  }, [destSearch, srcCity]);

  const getCarrierDetails = (flightNumber) => {
    const code = flightNumber.split('-')[0];
    const carriers = {
      '6E': { name: 'IndiGo', color: '#1a56db', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
      'AI': { name: 'Air India', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
      'UK': { name: 'Vistara', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.3)' },
      'QP': { name: 'Akasa Air', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' },
      'SG': { name: 'SpiceJet', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' }
    };
    return carriers[code] || { name: 'Domestic Carrier', color: '#9ca3af', bg: 'rgba(255,255,255,0.05)', border: 'var(--glass-border)' };
  };

  // Filter & Sort outbound flights
  const filteredOutboundFlights = useMemo(() => {
    let result = [...flights];

    // Filter by Price
    result = result.filter(f => f.price <= maxPrice);

    // Filter by Carrier
    if (selectedCarriers.length > 0) {
      result = result.filter(f => {
        const code = f.flightNumber.split('-')[0];
        return selectedCarriers.includes(code);
      });
    }

    // Filter by selected return flight departure time to maintain logical order
    if (selectedReturnFlight) {
      const returnTime = new Date(selectedReturnFlight.departureTime);
      result = result.filter(f => new Date(f.departureTime) < returnTime);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'time_asc') return new Date(a.departureTime) - new Date(b.departureTime);
      if (sortBy === 'time_desc') return new Date(b.departureTime) - new Date(a.departureTime);
      return 0;
    });

    return result;
  }, [flights, sortBy, maxPrice, selectedCarriers, selectedReturnFlight]);

  // Filter & Sort return flights
  const filteredReturnFlights = useMemo(() => {
    let result = [...returnFlights];

    // Filter by Price
    result = result.filter(f => f.price <= maxPrice);

    // Filter by Carrier
    if (selectedCarriers.length > 0) {
      result = result.filter(f => {
        const code = f.flightNumber.split('-')[0];
        return selectedCarriers.includes(code);
      });
    }

    // Filter by selected outbound flight departure time to maintain logical order
    if (selectedOutboundFlight) {
      const outboundTime = new Date(selectedOutboundFlight.departureTime);
      result = result.filter(f => new Date(f.departureTime) > outboundTime);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'time_asc') return new Date(a.departureTime) - new Date(b.departureTime);
      if (sortBy === 'time_desc') return new Date(b.departureTime) - new Date(a.departureTime);
      return 0;
    });

    return result;
  }, [returnFlights, sortBy, maxPrice, selectedCarriers, selectedOutboundFlight]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: searchMode === 'roundtrip' && (selectedOutboundFlight || selectedReturnFlight) ? '90px' : 0 }}>
      {/* Success Popup after checkout */}
      {bookingSuccessData && (
        <div className="glass-panel" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.15))',
          borderColor: '#10b981',
          padding: '30px',
          borderRadius: '16px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#10b981',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
          }}>
            <CheckCircle size={32} color="#fff" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>Booking Confirmed!</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px 0' }}>
            Your ticket itinerary has been successfully created.
          </p>
          <div style={{
            display: 'inline-flex',
            gap: '40px',
            background: 'rgba(0,0,0,0.3)',
            padding: '16px 40px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '20px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>PNR Number(s)</span>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
                {bookingSuccessData.pnr}
              </h4>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Billed</span>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-secondary)', marginTop: '4px' }}>
                ₹{bookingSuccessData.totalCost}
              </h4>
            </div>
          </div>
          <div>
            <button onClick={() => setActiveTab('bookings')} className="btn-primary" style={{ padding: '10px 20px' }}>
              View My Trips
            </button>
            <button onClick={() => setBookingSuccessData(null)} className="btn-secondary" style={{ marginLeft: '12px', padding: '10px 20px' }}>
              Book Another Flight
            </button>
          </div>
        </div>
      )}

      {/* Flight Search Form */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px', overflow: 'visible', position: 'relative', zIndex: 20 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} color="var(--color-primary)" />
          Search Scheduled Flights
        </h3>

        {/* One-Way / Round-Trip radio selectors */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>
            <input 
              type="radio" 
              name="searchMode" 
              checked={searchMode === 'oneway'}
              onChange={() => setSearchMode('oneway')}
              style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            One Way
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>
            <input 
              type="radio" 
              name="searchMode" 
              checked={searchMode === 'roundtrip'}
              onChange={() => setSearchMode('roundtrip')}
              style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            Round Trip
          </label>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          alignItems: 'end'
        }}>
          {/* Departure Airport Autocomplete Search */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
            <label className="form-label">Departure Airport</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)', zIndex: 10 }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Type departure (e.g. Delhi, DEL)..." 
                value={srcSearch}
                onChange={(e) => {
                  setSrcSearch(e.target.value);
                  setSrcCity(''); // Invalidate code until explicitly selected
                  setShowSrcSuggestions(true);
                }}
                onFocus={() => setShowSrcSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSrcSuggestions(false), 200);
                }}
                style={{ width: '100%', paddingLeft: '45px' }}
              />
            </div>

            {/* Departure Suggestions List */}
            {showSrcSuggestions && filteredSrcAirports.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '75px',
                left: 0,
                right: 0,
                background: '#121420',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                zIndex: 100,
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}>
                {filteredSrcAirports.map(airport => (
                  <div 
                    key={airport.code}
                    onClick={() => {
                      setSrcCity(airport.code);
                      setSrcSearch(`${airport.city} (${airport.code})`);
                      setShowSrcSuggestions(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(138, 92, 246, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                      {airport.city} ({airport.code})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {airport.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Arrival Airport Autocomplete Search */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
            <label className="form-label">Arrival Airport</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)', zIndex: 10 }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Type destination (e.g. Mumbai, BOM)..." 
                value={destSearch}
                onChange={(e) => {
                  setDestSearch(e.target.value);
                  setDestCity(''); // Invalidate code until explicitly selected
                  setShowDestSuggestions(true);
                }}
                onFocus={() => setShowDestSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowDestSuggestions(false), 200);
                }}
                style={{ width: '100%', paddingLeft: '45px' }}
              />
            </div>

            {/* Arrival Suggestions List */}
            {showDestSuggestions && filteredDestAirports.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '75px',
                left: 0,
                right: 0,
                background: '#121420',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                zIndex: 100,
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}>
                {filteredDestAirports.map(airport => (
                  <div 
                    key={airport.code}
                    onClick={() => {
                      setDestCity(airport.code);
                      setDestSearch(`${airport.city} (${airport.code})`);
                      setShowDestSuggestions(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(138, 92, 246, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                      {airport.city} ({airport.code})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {airport.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Departure Date Custom Picker */}
          <CustomDatePicker 
            value={departureDate}
            onChange={(val) => setDepartureDate(val)}
            label="Departure Date"
            placeholder="Select departure date"
            minDate={new Date().toISOString().split('T')[0]}
          />

          {/* Return Date Custom Picker */}
          {searchMode === 'roundtrip' && (
            <CustomDatePicker 
              value={returnDate}
              onChange={(val) => setReturnDate(val)}
              label="Return Date"
              placeholder="Select return date"
              minDate={departureDate || new Date().toISOString().split('T')[0]}
            />
          )}

          <button onClick={fetchFlights} className="btn-primary" style={{
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Search size={18} />
            Search Itineraries
          </button>
        </div>
      </div>

      {/* Flight Search Results Panel */}
      <div>
        {flightsWarning && (
          <div className="glass-panel animate-fade-in" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            padding: '16px 20px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '24px',
            fontWeight: 600,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} />
            <span>{flightsWarning}</span>
          </div>
        )}

        {!hasSearched ? (
          <div className="glass-panel animate-fade-in" style={{
            padding: '50px 40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.03))'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              border: '1px solid var(--glass-border)'
            }}>
              <Plane size={28} color="var(--color-primary)" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Where are you flying next?
            </h4>
            <p style={{ fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto', lineHeight: '1.5' }}>
              Select search criteria above to search domestic itineraries and reserve seats.
            </p>
          </div>
        ) : loadingFlights ? (
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
            <p style={{ color: 'var(--text-muted)' }}>Searching flights...</p>
          </div>
        ) : flightsError ? (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-accent)' }}>
            <AlertTriangle size={32} style={{ marginBottom: '12px' }} />
            <p>{flightsError}</p>
          </div>
        ) : (flights.length === 0 && returnFlights.length === 0) ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Plane size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No flights found matching search criteria.</p>
          </div>
        ) : (
          /* Search Results Layout */
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            alignItems: 'start'
          }}>
            {/* 1. Filters Sidebar */}
            <div className="glass-panel" style={{
              padding: '24px',
              width: '280px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Filters & Sorting</span>
                <span onClick={() => { setSortBy('price_asc'); setMaxPrice(10000); setSelectedCarriers([]); }} style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 500 }}>Reset All</span>
              </h4>

              {/* Sort selector */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '8px', display: 'block' }}>Sort By</label>
                <select 
                  className="form-input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', background: '#0a0b10', color: '#fff', cursor: 'pointer' }}
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="time_asc">Time: Earliest First</option>
                  <option value="time_desc">Time: Latest First</option>
                </select>
              </div>

              {/* Price filter range */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <span>Max Fare</span>
                  <span style={{ color: 'var(--color-secondary)' }}>₹{maxPrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min="3000"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>₹3,000</span>
                  <span>₹10,000</span>
                </div>
              </div>

              {/* Carrier filter checkboxes */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '10px', display: 'block' }}>Airlines</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  {[
                    { code: '6E', name: 'IndiGo' },
                    { code: 'AI', name: 'Air India' },
                    { code: 'UK', name: 'Vistara' },
                    { code: 'QP', name: 'Akasa Air' },
                    { code: 'SG', name: 'SpiceJet' }
                  ].map(airline => (
                    <label key={airline.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={selectedCarriers.includes(airline.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCarriers([...selectedCarriers, airline.code]);
                          } else {
                            setSelectedCarriers(selectedCarriers.filter(c => c !== airline.code));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{airline.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Results List (Single Column for One Way, Two Columns for Round Trip) */}
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '30px', minWidth: '320px' }}>
              
              {/* Outbound Flights List */}
              <div style={{ flex: 1, minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {searchMode === 'roundtrip' && (
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plane size={18} color="var(--color-primary)" />
                    1. Outbound Flights ({srcCity || 'Departure'} ➔ {destCity || 'Arrival'})
                  </h4>
                )}
                {filteredOutboundFlights.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Plane size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>
                      {selectedReturnFlight && flights.length > 0
                        ? 'No outbound flights available before selected return flight departure time.'
                        : 'No outbound flights match filters.'
                      }
                    </p>
                  </div>
                ) : (
                  filteredOutboundFlights.map((flight) => {
                    const details = getCarrierDetails(flight.flightNumber);
                    const isOutboundSelected = selectedOutboundFlight?.id === flight.id;
                    return (
                      <div key={flight.id} className="glass-panel animate-fade-in" style={{
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        borderColor: isOutboundSelected ? 'var(--color-primary)' : 'var(--glass-border)',
                        background: isOutboundSelected ? 'rgba(138, 92, 246, 0.05)' : 'var(--glass-bg)'
                      }}>
                        {/* Header: Carrier and Route */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              background: details.bg,
                              color: details.color,
                              border: details.border,
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800
                            }}>
                              {details.name}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{flight.flightNumber}</span>
                          </div>
                          <span className={`status-badge ${flight.status || 'scheduled'}`} style={{ margin: 0 }}>
                            {flight.status || 'scheduled'}
                          </span>
                        </div>

                        {/* Route Airports */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{flight.departureAirportId}</span>
                          <ChevronRight size={16} color="var(--color-primary)" />
                          <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{flight.arrivalAirportId}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            {flight.airplaneDetail?.modelNumber || 'Boeing 737'}
                          </span>
                        </div>

                        {/* Times & Price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Departure</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                              {new Date(flight.departureTime).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Arrival</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                              {new Date(flight.arrivalTime).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Fare</span>
                            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-secondary)' }}>₹{flight.price}</span>
                          </div>
                        </div>

                        {/* Footer details + Button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: flight.totalSeats > 0 ? '#10b981' : 'var(--color-accent)' }}>
                            {flight.totalSeats} seats left
                          </span>
                          {searchMode === 'roundtrip' ? (
                            <button 
                              onClick={() => setSelectedOutboundFlight(isOutboundSelected ? null : flight)}
                              disabled={flight.totalSeats === 0 || flight.status === 'cancelled'}
                              className={isOutboundSelected ? "btn-secondary" : "btn-primary"}
                              style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                opacity: (flight.totalSeats === 0 || flight.status === 'cancelled') ? 0.5 : 1,
                                cursor: (flight.totalSeats === 0 || flight.status === 'cancelled') ? 'not-allowed' : 'pointer',
                                border: isOutboundSelected ? '1px solid var(--color-primary)' : 'none',
                                color: isOutboundSelected ? 'var(--color-primary)' : '#fff'
                              }}
                            >
                              {isOutboundSelected ? 'Selected ✓' : 'Select Outbound'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleSelectFlight(flight)}
                              disabled={flight.totalSeats === 0 || flight.status === 'cancelled'}
                              className="btn-primary"
                              style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                opacity: (flight.totalSeats === 0 || flight.status === 'cancelled') ? 0.5 : 1,
                                cursor: (flight.totalSeats === 0 || flight.status === 'cancelled') ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Book Seats
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Return Flights List (only visible in Round Trip) */}
              {searchMode === 'roundtrip' && (
                <div style={{ flex: 1, minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plane size={18} color="var(--color-secondary)" style={{ transform: 'rotate(180deg)' }} />
                    2. Return Flights ({destCity || 'Arrival'} ➔ {srcCity || 'Departure'})
                  </h4>
                  {filteredReturnFlights.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Plane size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p>
                        {selectedOutboundFlight && returnFlights.length > 0
                          ? 'No return flights available after selected outbound flight departure time.'
                          : 'No return flights match filters.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredReturnFlights.map((flight) => {
                      const details = getCarrierDetails(flight.flightNumber);
                      const isReturnSelected = selectedReturnFlight?.id === flight.id;
                      return (
                        <div key={flight.id} className="glass-panel animate-fade-in" style={{
                          padding: '20px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          borderColor: isReturnSelected ? 'var(--color-secondary)' : 'var(--glass-border)',
                          background: isReturnSelected ? 'rgba(5, 150, 105, 0.05)' : 'var(--glass-bg)'
                        }}>
                          {/* Header: Carrier and Route */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                background: details.bg,
                                color: details.color,
                                border: details.border,
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 800
                              }}>
                                {details.name}
                              </div>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{flight.flightNumber}</span>
                            </div>
                            <span className={`status-badge ${flight.status || 'scheduled'}`} style={{ margin: 0 }}>
                              {flight.status || 'scheduled'}
                            </span>
                          </div>

                          {/* Route Airports */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{flight.departureAirportId}</span>
                            <ChevronRight size={16} color="var(--color-primary)" />
                            <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{flight.arrivalAirportId}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                              {flight.airplaneDetail?.modelNumber || 'Boeing 737'}
                            </span>
                          </div>

                          {/* Times & Price */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Departure</span>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                                {new Date(flight.departureTime).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Arrival</span>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                                {new Date(flight.arrivalTime).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Fare</span>
                              <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-secondary)' }}>₹{flight.price}</span>
                            </div>
                          </div>

                          {/* Footer details + Button */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                            <span style={{ fontSize: '0.8rem', color: flight.totalSeats > 0 ? '#10b981' : 'var(--color-accent)' }}>
                              {flight.totalSeats} seats left
                            </span>
                            <button 
                              onClick={() => setSelectedReturnFlight(isReturnSelected ? null : flight)}
                              disabled={flight.totalSeats === 0 || flight.status === 'cancelled'}
                              className={isReturnSelected ? "btn-secondary" : "btn-primary"}
                              style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                opacity: (flight.totalSeats === 0 || flight.status === 'cancelled') ? 0.5 : 1,
                                cursor: (flight.totalSeats === 0 || flight.status === 'cancelled') ? 'not-allowed' : 'pointer',
                                border: isReturnSelected ? '1px solid var(--color-secondary)' : 'none',
                                color: isReturnSelected ? 'var(--color-secondary)' : '#fff'
                              }}
                            >
                              {isReturnSelected ? 'Selected ✓' : 'Select Return'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Round Trip Sticky Summary Bar */}
      {searchMode === 'roundtrip' && (selectedOutboundFlight || selectedReturnFlight) && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 11, 16, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--glass-border)',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            {selectedOutboundFlight && (
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Outbound</span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                  {selectedOutboundFlight.flightNumber} ({selectedOutboundFlight.departureAirportId} ➔ {selectedOutboundFlight.arrivalAirportId})
                </span>
                <span style={{ color: 'var(--color-secondary)', marginLeft: '8px', fontSize: '0.85rem' }}>₹{selectedOutboundFlight.price}</span>
              </div>
            )}
            {selectedReturnFlight && (
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Return</span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                  {selectedReturnFlight.flightNumber} ({selectedReturnFlight.departureAirportId} ➔ {selectedReturnFlight.arrivalAirportId})
                </span>
                <span style={{ color: 'var(--color-secondary)', marginLeft: '8px', fontSize: '0.85rem' }}>₹{selectedReturnFlight.price}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Combined Base Fare</span>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-secondary)' }}>
                ₹{((selectedOutboundFlight?.price || 0) + (selectedReturnFlight?.price || 0)).toLocaleString()}
              </h4>
            </div>
            <button
              onClick={() => handleSelectRoundTripFlights(selectedOutboundFlight, selectedReturnFlight)}
              disabled={!selectedOutboundFlight || !selectedReturnFlight}
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: 700,
                opacity: (!selectedOutboundFlight || !selectedReturnFlight) ? 0.5 : 1,
                cursor: (!selectedOutboundFlight || !selectedReturnFlight) ? 'not-allowed' : 'pointer'
              }}
            >
              Select Seats ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;
