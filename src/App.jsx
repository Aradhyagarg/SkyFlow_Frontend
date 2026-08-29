import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import FlightSearch from './components/FlightSearch';
import SeatMap from './components/SeatMap';
import MyBookings from './components/MyBookings';
import AdminConsole from './components/AdminConsole';
import PaymentScreen from './components/PaymentScreen';
import UserProfile from './components/UserProfile';
import { 
  authApi, 
  airlineApi, 
  bookingApi 
} from './services/api';

function App() {
  // Session State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'customer');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || '');
  const [userProfile, setUserProfile] = useState(null);
  
  // Navigation
  const [activeTab, setActiveTab] = useState('flights'); // 'flights' | 'bookings' | 'admin' | 'auth' | 'profile' | 'reset-password'
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Password Reset State
  const [resetToken, setResetToken] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetConfirmPasswordVal, setResetConfirmPasswordVal] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Flight Search State
  const [flights, setFlights] = useState([]);
  const [srcCity, setSrcCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [flightsError, setFlightsError] = useState('');
  const [flightsWarning, setFlightsWarning] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Round Trip & Date States
  const [searchMode, setSearchMode] = useState('oneway'); // 'oneway' | 'roundtrip'
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnFlights, setReturnFlights] = useState([]);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  
  // Sequential Bookings States
  const [bookingsToPay, setBookingsToPay] = useState([]);
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);
  const [outboundSelectedSeats, setOutboundSelectedSeats] = useState([]);
  const [seatMapStep, setSeatMapStep] = useState(1); // 1 = outbound, 2 = return

  // Seat Selection State
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of seat objects
  const [passengersData, setPassengersData] = useState([]); // Array of passenger details
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [currentBooking, setCurrentBooking] = useState(null);
  const [paymentFlight, setPaymentFlight] = useState(null);

  // Booking History State
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // Admin Controls State
  const [adminFlights, setAdminFlights] = useState([]);
  const [updatingFlightId, setUpdatingFlightId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  // Parse resetToken on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenParam = queryParams.get('resetToken');
    if (tokenParam) {
      setResetToken(tokenParam);
      setActiveTab('reset-password');
      // Clean query params from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check login status on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        if (res.success) {
          setUserProfile(res.data);
          setUserEmail(res.data.email || '');
          if (res.data.role) {
            setUserRole(res.data.role);
            localStorage.setItem('role', res.data.role);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        setUserEmail(payload.email || '');
        fetchProfile();
      } catch (e) {
        console.error('Failed to parse token payload', e);
      }
    } else {
      setUserProfile(null);
      // Only set to auth if we are NOT on the reset-password view
      setActiveTab(prev => prev === 'reset-password' ? 'reset-password' : 'auth');
    }
  }, [token]);

  // Synchronize return date with departure date changes to maintain logical order
  useEffect(() => {
    if (searchMode === 'roundtrip' && departureDate && returnDate && returnDate < departureDate) {
      setReturnDate(departureDate);
    }
  }, [departureDate, returnDate, searchMode]);

  // Ensure selected return flight departs after the selected outbound flight
  useEffect(() => {
    if (selectedOutboundFlight && selectedReturnFlight) {
      const outboundTime = new Date(selectedOutboundFlight.departureTime);
      const returnTime = new Date(selectedReturnFlight.departureTime);
      if (returnTime <= outboundTime) {
        setSelectedReturnFlight(null);
      }
    }
  }, [selectedOutboundFlight, selectedReturnFlight]);

  // Fetch Flights helper
  const fetchFlights = async () => {
    // Prevent searches if source and destination are the same
    if (srcCity && destCity && srcCity.toUpperCase() === destCity.toUpperCase()) {
      setFlightsError('Departure and Arrival airports cannot be the same');
      setHasSearched(true);
      setFlights([]);
      setReturnFlights([]);
      return;
    }

    setLoadingFlights(true);
    setFlightsError('');
    setFlightsWarning('');
    setHasSearched(true);
    setFlights([]);
    setReturnFlights([]);
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);

    try {
      if (searchMode === 'oneway') {
        const params = {};
        if (srcCity && destCity && departureDate) {
          params.trips = `${srcCity.toUpperCase()}-${destCity.toUpperCase()}-${departureDate}`;
        } else {
          if (srcCity) params.departureAirportId = srcCity.toUpperCase();
          if (destCity) params.arrivalAirportId = destCity.toUpperCase();
        }
        const res = await airlineApi.getFlights(params);
        if (res.success) {
          if (res.data.length === 0 && departureDate && srcCity && destCity) {
            // Outbound fallback: Search DEL to BOM on all dates
            const fallbackRes = await airlineApi.getFlights({
              departureAirportId: srcCity.toUpperCase(),
              arrivalAirportId: destCity.toUpperCase()
            });
            if (fallbackRes.success && fallbackRes.data.length > 0) {
              setFlights(fallbackRes.data);
              setFlightsWarning(`No flights scheduled on ${new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Showing schedules for alternative available dates below:`);
            } else {
              setFlights([]);
            }
          } else {
            setFlights(res.data);
          }
        } else {
          setFlightsError(res.error?.explanation || 'Failed to fetch flights');
        }
      } else {
        // Round trip search
        if (!srcCity || !destCity || !departureDate || !returnDate) {
          setFlightsError('Please select departure airport, arrival airport, departure date, and return date for round trip');
          setLoadingFlights(false);
          return;
        }

        const outboundTrips = `${srcCity.toUpperCase()}-${destCity.toUpperCase()}-${departureDate}`;
        const returnTrips = `${destCity.toUpperCase()}-${srcCity.toUpperCase()}-${returnDate}`;

        let [outboundRes, returnRes] = await Promise.all([
          airlineApi.getFlights({ trips: outboundTrips }),
          airlineApi.getFlights({ trips: returnTrips })
        ]);

        if (outboundRes.success && returnRes.success) {
          let warningMsg = '';
          let finalOutbound = outboundRes.data;
          let finalReturn = returnRes.data;

          // Outbound fallback
          if (finalOutbound.length === 0) {
            const fallbackOut = await airlineApi.getFlights({
              departureAirportId: srcCity.toUpperCase(),
              arrivalAirportId: destCity.toUpperCase()
            });
            if (fallbackOut.success && fallbackOut.data.length > 0) {
              finalOutbound = fallbackOut.data;
              warningMsg += `No outbound flights on ${new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (showing alternative dates). `;
            }
          }

          // Determine the earliest departure time among outbound options
          let earliestOutboundTime = new Date(departureDate);
          if (finalOutbound.length > 0) {
            const times = finalOutbound.map(f => new Date(f.departureTime).getTime());
            earliestOutboundTime = new Date(Math.min(...times));
          }

          // Return fallback and filter chronologically relative to outbound options
          if (finalReturn.length === 0) {
            const fallbackRet = await airlineApi.getFlights({
              departureAirportId: destCity.toUpperCase(),
              arrivalAirportId: srcCity.toUpperCase()
            });
            if (fallbackRet.success && fallbackRet.data.length > 0) {
              finalReturn = fallbackRet.data.filter(f => new Date(f.departureTime) >= earliestOutboundTime);
              if (finalReturn.length > 0) {
                warningMsg += `No return flights on ${new Date(returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (showing alternative dates).`;
              } else {
                warningMsg += `No return flights available on or after outbound departure.`;
              }
            }
          } else {
            // Even if return flights were initially found, verify chronological validity
            const validReturns = finalReturn.filter(f => new Date(f.departureTime) >= earliestOutboundTime);
            if (validReturns.length === 0 && finalOutbound.length > 0) {
              const fallbackRet = await airlineApi.getFlights({
                departureAirportId: destCity.toUpperCase(),
                arrivalAirportId: srcCity.toUpperCase()
              });
              if (fallbackRet.success && fallbackRet.data.length > 0) {
                finalReturn = fallbackRet.data.filter(f => new Date(f.departureTime) >= earliestOutboundTime);
                warningMsg += `Showing return flights on alternative dates departing after outbound flight.`;
              } else {
                finalReturn = [];
              }
            } else {
              finalReturn = validReturns;
            }
          }

          setFlights(finalOutbound);
          setReturnFlights(finalReturn);
          if (warningMsg) {
            setFlightsWarning(warningMsg);
          }
        } else {
          setFlightsError('Failed to fetch round-trip itineraries');
        }
      }
    } catch (err) {
      setFlightsError(err.response?.data?.error?.explanation?.[0] || 'Airline Service is unreachable');
    } finally {
      setLoadingFlights(false);
    }
  };

  // Handle Login / Registration / Forgot Password
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    if (authMode === 'forgot') {
      if (!authEmail) {
        setAuthError('Email address is required');
        return;
      }
      try {
        const res = await authApi.forgotPassword(authEmail);
        if (res.success) {
          setAuthSuccess('Password reset link sent! Please check your email inbox for the reset link.');
          setAuthEmail('');
        } else {
          const exp = Array.isArray(res.error?.explanation) ? res.error?.explanation[0] : res.error?.explanation;
          setAuthError(exp || 'Failed to send reset link');
        }
      } catch (err) {
        const exp = Array.isArray(err.response?.data?.error?.explanation) 
          ? err.response?.data?.error?.explanation[0] 
          : err.response?.data?.error?.explanation;
        setAuthError(exp || 'No account registered with this email address');
      }
      return;
    }

    if (!authEmail || !authPassword) {
      setAuthError('Email and Password are required');
      return;
    }

    try {
      if (authMode === 'login') {
        const res = await authApi.signin(authEmail, authPassword);
        if (res.success) {
          const tokenStr = res.data.token;
          localStorage.setItem('token', tokenStr);
          
          const payloadBase64 = tokenStr.split('.')[1];
          const payload = JSON.parse(atob(payloadBase64));
          
          const roleVal = payload.role || (payload.email === 'admin@example.com' ? 'admin' : 'customer');
          localStorage.setItem('role', roleVal);
          localStorage.setItem('email', payload.email);

          setToken(tokenStr);
          setUserRole(roleVal);
          setUserEmail(payload.email);
          
          // Clear credentials
          setAuthEmail('');
          setAuthPassword('');
          setActiveTab('flights');
        } else {
          const exp = Array.isArray(res.error?.explanation) ? res.error?.explanation[0] : res.error?.explanation;
          setAuthError(exp || 'Authentication failed');
        }
      } else {
        const res = await authApi.signup(authEmail, authPassword);
        if (res.success) {
          setAuthSuccess('Registration successful! Please check your email inbox for the verification link to activate your account.');
          setAuthMode('login');
          setAuthPassword('');
        } else {
          const exp = Array.isArray(res.error?.explanation) ? res.error?.explanation[0] : res.error?.explanation;
          setAuthError(exp || 'Registration failed');
        }
      }
    } catch (err) {
      const exp = Array.isArray(err.response?.data?.error?.explanation) 
        ? err.response?.data?.error?.explanation[0] 
        : err.response?.data?.error?.explanation;
      setAuthError(exp || 'Authentication failed. Please check your credentials or try again.');
    }
  };

  // Logout helper
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setToken('');
    setUserRole('customer');
    setUserEmail('');
    
    // Explicitly wipe credentials form states to prevent lingering values
    setAuthEmail('');
    setAuthPassword('');
    setAuthError('');
    setAuthSuccess('');
    
    setActiveTab('auth');
    setBookingSuccessData(null);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetPasswordVal || !resetConfirmPasswordVal) {
      setResetError('All fields are required');
      return;
    }

    if (resetPasswordVal !== resetConfirmPasswordVal) {
      setResetError('Passwords do not match');
      return;
    }

    if (resetPasswordVal.length < 3 || resetPasswordVal.length > 50) {
      setResetError('Password must be between 3 and 50 characters');
      return;
    }

    setResetLoading(true);
    try {
      const res = await authApi.resetPassword(resetToken, resetPasswordVal);
      if (res.success) {
        setResetSuccess('Your password has been successfully updated! You can now log in.');
        setResetPasswordVal('');
        setResetConfirmPasswordVal('');
        setTimeout(() => {
          setActiveTab('auth');
          setAuthMode('login');
          setResetSuccess('');
          setResetError('');
        }, 3000);
      } else {
        setResetError(res.error?.explanation || 'Failed to reset password');
      }
    } catch (err) {
      setResetError(err.response?.data?.error?.explanation?.[0] || 'Verification token is invalid or has expired');
    } finally {
      setResetLoading(false);
    }
  };

  // Open Seat selector
  const handleSelectFlight = async (flight) => {
    if (!token) {
      setActiveTab('auth');
      return;
    }
    setSelectedFlight(flight);
    setSelectedSeats([]);
    setPassengersData([]);
    setBookingError('');
    setBookingSuccessData(null);

    try {
      const res = await bookingApi.getSeatMap(flight.id);
      if (res.success) {
        setSeats(res.data);
      } else {
        setBookingError('Failed to load seat map config');
      }
    } catch (err) {
      setBookingError('Booking Service seat map is offline');
    }
  };

  // Open Round Trip Seat Selector (starts with Outbound)
  const handleSelectRoundTripFlights = async (outbound, inbound) => {
    if (!token) {
      setActiveTab('auth');
      return;
    }
    
    setSelectedOutboundFlight(outbound);
    setSelectedReturnFlight(inbound);
    setSelectedFlight(outbound); // Seat Selector displays selectedFlight
    setSeatMapStep(1); // Set step to 1 (Outbound seats selection)
    setSelectedSeats([]);
    setPassengersData([]);
    setBookingError('');
    setBookingSuccessData(null);

    try {
      const res = await bookingApi.getSeatMap(outbound.id);
      if (res.success) {
        setSeats(res.data);
      } else {
        setBookingError('Failed to load outbound seat map config');
      }
    } catch (err) {
      setBookingError('Booking Service is offline');
    }
  };

  // Switch to Return Flight seat selection
  const handleNextSeatSelection = async () => {
    setBookingError('');
    setBookingLoading(true);

    // Validate inputs
    for (const p of passengersData) {
      if (!p.firstName || !p.lastName || !p.age) {
        setBookingError('Please fill out first name, last name, and age for all passengers');
        setBookingLoading(false);
        return;
      }
    }

    try {
      // Fetch seat map for the return flight
      const res = await bookingApi.getSeatMap(selectedReturnFlight.id);
      if (res.success) {
        // Save selected outbound seats
        setOutboundSelectedSeats(selectedSeats.map(s => s.seatNumber));
        // Switch selected flight to return
        setSelectedFlight(selectedReturnFlight);
        // Clear selected seats so user can select for the return flight
        setSelectedSeats([]);
        setSeats(res.data);
        setSeatMapStep(2);
      } else {
        setBookingError('Failed to load return seat map config');
      }
    } catch (err) {
      setBookingError('Booking Service return seat map is offline');
    } finally {
      setBookingLoading(false);
    }
  };

  // Go back to Outbound Flight seat selection from Return step
  const handleBackToOutboundSeats = async () => {
    setBookingError('');
    setBookingLoading(true);
    try {
      const res = await bookingApi.getSeatMap(selectedOutboundFlight.id);
      if (res.success) {
        setSelectedFlight(selectedOutboundFlight);
        setSeats(res.data);
        // Restore selected outbound seats
        const restoredSeats = res.data.filter(s => outboundSelectedSeats.includes(s.seatNumber));
        setSelectedSeats(restoredSeats);
        setSeatMapStep(1);
      } else {
        setBookingError('Failed to load outbound seat map');
      }
    } catch (err) {
      setBookingError('Booking Service is offline');
    } finally {
      setBookingLoading(false);
    }
  };

  // Toggle seat selection
  const handleToggleSeat = (seat) => {
    if (seat.isBooked) return;
    
    const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
    let newSelectedSeats = [];
    
    if (isSelected) {
      newSelectedSeats = selectedSeats.filter(s => s.seatNumber !== seat.seatNumber);
    } else {
      newSelectedSeats = [...selectedSeats, seat];
    }
    
    setSelectedSeats(newSelectedSeats);
    
    // Align passenger forms
    const newPassengersData = newSelectedSeats.map((s, idx) => {
      const existing = passengersData[idx];
      if (existing) return existing;

      // Auto-fill Passenger 1 from User Profile
      if (idx === 0 && userProfile) {
        const parts = (userProfile.fullName || '').split(' ');
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ') || '';

        return {
          firstName: first,
          lastName: last,
          age: '',
          gender: 'male',
          passportNumber: userProfile.passportNumber || '',
          seatNumber: s.seatNumber,
          hasExtraBaggage: false,
          hasMeal: false,
          hasInsurance: false
        };
      }

      return { 
        firstName: '', 
        lastName: '', 
        age: '', 
        gender: 'male', 
        passportNumber: '', 
        seatNumber: s.seatNumber,
        hasExtraBaggage: false,
        hasMeal: false,
        hasInsurance: false
      };
    });
    setPassengersData(newPassengersData);
  };

  // Handle passenger input changes
  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengersData];
    updated[index] = { ...updated[index], [field]: value };
    setPassengersData(updated);
  };

  // Calculate bill
  const getSubtotalBill = () => {
    if (!selectedFlight) return 0;
    return selectedSeats.reduce((acc, seat, idx) => {
      let price = selectedFlight.price;
      if (seat.type === 'premium-economy') price = Math.round(price * 1.4);
      else if (seat.type === 'business') price = Math.round(price * 2.0);
      else if (seat.type === 'first-class') price = Math.round(price * 3.0);
      
      const passenger = passengersData[idx];
      if (passenger) {
        if (passenger.hasExtraBaggage) price += 1000;
        if (passenger.hasMeal) price += 350;
        if (passenger.hasInsurance) price += 299;
      }
      return acc + price;
    }, 0);
  };

  // Checkout booking submit
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);

    // Validate inputs
    for (const p of passengersData) {
      if (!p.firstName || !p.lastName || !p.age) {
        setBookingError('Please fill out first name, last name, and age for all passengers');
        setBookingLoading(false);
        return;
      }
      const parsedAge = parseInt(p.age);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        setBookingError('Please enter a valid age between 1 and 120 for all passengers');
        setBookingLoading(false);
        return;
      }
    }

    try {
      if (searchMode === 'oneway' || !selectedReturnFlight) {
        // One way booking
        const payload = {
          flightId: selectedFlight.id,
          passengers: passengersData.map(p => ({
            firstName: p.firstName,
            lastName: p.lastName,
            age: parseInt(p.age),
            gender: p.gender,
            passportNumber: p.passportNumber || null,
            seatNumber: p.seatNumber,
            hasExtraBaggage: !!p.hasExtraBaggage,
            hasMeal: !!p.hasMeal,
            hasInsurance: !!p.hasInsurance
          }))
        };

        const res = await bookingApi.createBooking(payload);
        if (res.success) {
          setCurrentBooking(res.data);
          setPaymentFlight(selectedFlight);
          setSelectedFlight(null); // Close map
          setSelectedSeats([]);
        } else {
          setBookingError(res.error?.explanation || 'Failed to complete booking');
        }
      } else {
        // Round trip booking - create combined bookings
        // 1. Create outbound booking payload
        const outboundPayload = {
          flightId: selectedOutboundFlight.id,
          passengers: passengersData.map((p, idx) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            age: parseInt(p.age),
            gender: p.gender,
            passportNumber: p.passportNumber || null,
            seatNumber: outboundSelectedSeats[idx],
            hasExtraBaggage: !!p.hasExtraBaggage,
            hasMeal: !!p.hasMeal,
            hasInsurance: !!p.hasInsurance
          }))
        };

        // 2. Create return booking payload
        const returnPayload = {
          flightId: selectedReturnFlight.id,
          passengers: passengersData.map((p, idx) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            age: parseInt(p.age),
            gender: p.gender,
            passportNumber: p.passportNumber || null,
            seatNumber: selectedSeats[idx].seatNumber,
            hasExtraBaggage: !!p.hasExtraBaggage,
            hasMeal: !!p.hasMeal,
            hasInsurance: !!p.hasInsurance
          }))
        };

        const res = await bookingApi.createRoundTripBooking({
          outbound: outboundPayload,
          return: returnPayload
        });

        if (res.success) {
          const { outboundBooking, returnBooking, totalCost } = res.data;
          
          setCurrentBooking({
            id: outboundBooking.id,
            outboundBookingId: outboundBooking.id,
            returnBookingId: returnBooking.id,
            totalCost: totalCost,
            noOfSeats: outboundBooking.noOfSeats,
            isRoundTrip: true,
            outboundBooking,
            returnBooking
          });
          
          setPaymentFlight(selectedOutboundFlight);
          setSelectedFlight(null);
          setSelectedSeats([]);
        } else {
          setBookingError(res.error?.explanation || 'Failed to complete round-trip booking');
        }
      }
    } catch (err) {
      setBookingError(err.response?.data?.error?.explanation?.[0] || 'Seat is currently locked or booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  // Fetch booking history
  const fetchBookingHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const res = await bookingApi.getMyBookings();
      if (res.success) {
        setUpcomingBookings(res.data.upcoming || []);
        setPastBookings(res.data.past || []);
      } else {
        setHistoryError('Failed to fetch booking history');
      }
    } catch (err) {
      setHistoryError('Unable to load itineraries. Try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load history tab
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookingHistory();
    }
  }, [activeTab]);

  // Load Admin console
  const fetchAdminFlights = async () => {
    setAdminError('');
    try {
      const res = await airlineApi.getFlights();
      if (res.success) {
        setAdminFlights(res.data);
      }
    } catch (err) {
      setAdminError('Failed to fetch flight list');
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminFlights();
    }
  }, [activeTab]);

  // Update Status Admin action
  const handleUpdateStatus = async (flightId) => {
    setAdminError('');
    setAdminSuccess('');
    if (!selectedStatus) {
      setAdminError('Please choose a flight status');
      return;
    }
    try {
      const res = await airlineApi.updateFlightStatus(flightId, selectedStatus);
      if (res.success) {
        setAdminSuccess(`Flight status updated successfully to ${selectedStatus}!`);
        setUpdatingFlightId(null);
        setSelectedStatus('');
        fetchAdminFlights();
        fetchFlights();
      }
    } catch (err) {
      setAdminError(err.response?.data?.error?.explanation?.[0] || 'Unauthorized status change');
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Shared Navbar Header */}
      <Navbar 
        token={token} 
        userRole={userRole} 
        userEmail={userEmail} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout}
        setSelectedFlight={setSelectedFlight}
      />

      {/* Main Dashboard Router View */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        
        {activeTab === 'auth' && (
          <Auth 
            authMode={authMode}
            setAuthMode={setAuthMode}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authError={authError}
            setAuthError={setAuthError}
            authSuccess={authSuccess}
            setAuthSuccess={setAuthSuccess}
            handleAuth={handleAuth}
          />
        )}

        {activeTab === 'flights' && (
          currentBooking ? (
            <PaymentScreen 
              booking={currentBooking}
              flight={paymentFlight}
              returnFlight={currentBooking.isRoundTrip ? selectedReturnFlight : null}
              onPaymentSuccess={(updatedBooking) => {
                if (currentBooking.isRoundTrip) {
                  const outboundPnr = updatedBooking?.outbound?.pnr || currentBooking?.outboundPnr || currentBooking?.pnr || 'CONFIRMED';
                  const returnPnr = updatedBooking?.return?.pnr || currentBooking?.returnPnr || 'CONFIRMED';
                  setBookingSuccessData({
                    pnr: `${outboundPnr} / ${returnPnr}`,
                    totalCost: updatedBooking?.totalCost || currentBooking?.totalCost || 0
                  });
                } else {
                  setBookingSuccessData({
                    pnr: updatedBooking?.pnr || currentBooking?.pnr || 'CONFIRMED',
                    totalCost: updatedBooking?.totalCost || currentBooking?.totalCost || 0
                  });
                }
                setCurrentBooking(null);
                setPaymentFlight(null);
                fetchFlights(); // Refresh seat availability counts
              }}
              onCancel={() => {
                setCurrentBooking(null);
                setPaymentFlight(null);
              }}
            />
          ) : selectedFlight ? (
            <SeatMap 
              selectedFlight={selectedFlight}
              setSelectedFlight={setSelectedFlight}
              seats={seats}
              selectedSeats={selectedSeats}
              handleToggleSeat={handleToggleSeat}
              passengersData={passengersData}
              handlePassengerChange={handlePassengerChange}
              bookingLoading={bookingLoading}
              bookingError={bookingError}
              handleConfirmBooking={handleConfirmBooking}
              getSubtotalBill={getSubtotalBill}
              searchMode={searchMode}
              seatMapStep={seatMapStep}
              handleNextSeatSelection={handleNextSeatSelection}
              handleBackToOutboundSeats={handleBackToOutboundSeats}
            />
          ) : (
            <FlightSearch 
              bookingSuccessData={bookingSuccessData}
              setBookingSuccessData={setBookingSuccessData}
              setActiveTab={setActiveTab}
              flights={flights}
              loadingFlights={loadingFlights}
              flightsError={flightsError}
              flightsWarning={flightsWarning}
              fetchFlights={fetchFlights}
              srcCity={srcCity}
              setSrcCity={setSrcCity}
              destCity={destCity}
              setDestCity={setDestCity}
              handleSelectFlight={handleSelectFlight}
              hasSearched={hasSearched}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
              departureDate={departureDate}
              setDepartureDate={setDepartureDate}
              returnDate={returnDate}
              setReturnDate={setReturnDate}
              returnFlights={returnFlights}
              selectedOutboundFlight={selectedOutboundFlight}
              setSelectedOutboundFlight={setSelectedOutboundFlight}
              selectedReturnFlight={selectedReturnFlight}
              setSelectedReturnFlight={setSelectedReturnFlight}
              handleSelectRoundTripFlights={handleSelectRoundTripFlights}
            />
          )
        )}

        {activeTab === 'bookings' && (
          <MyBookings 
            loadingHistory={loadingHistory}
            historyError={historyError}
            upcomingBookings={upcomingBookings}
            pastBookings={pastBookings}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfile 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        )}

        {activeTab === 'admin' && userRole === 'admin' && (
          <AdminConsole 
            adminFlights={adminFlights}
            adminError={adminError}
            adminSuccess={adminSuccess}
            updatingFlightId={updatingFlightId}
            setUpdatingFlightId={setUpdatingFlightId}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            handleUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'reset-password' && (
          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Reset Password
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                  Please enter your new password below.
                </p>
              </div>

              {resetError && (
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
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {resetSuccess}
                </div>
              )}

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="Enter new password"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="Confirm new password"
                    value={resetConfirmPasswordVal}
                    onChange={(e) => setResetConfirmPasswordVal(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={resetLoading}
                  style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}
                >
                  {resetLoading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
