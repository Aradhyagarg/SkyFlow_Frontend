import React, { useState } from 'react';
import { CreditCard, Smartphone, Landmark, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { bookingApi } from '../services/api';

function PaymentScreen({ 
  booking, 
  flight, 
  returnFlight,
  onPaymentSuccess, 
  onCancel 
}) {
  const [payMethod, setPayMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states pre-filled for test mode
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/30');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('Rishi Garg');
  
  const [upiId, setUpiId] = useState('rishi.garg0802@okaxis');
  const [selectedBank, setSelectedBank] = useState('sbi');

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (payMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        setError('Please fill in all credit card details');
        setLoading(false);
        return;
      }
    } else if (payMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. user@bank)');
        setLoading(false);
        return;
      }
    }

    try {
      const methodLabel = payMethod === 'card' ? 'Card' : payMethod === 'upi' ? 'UPI' : 'Net Banking';
      const idempotencyKey = generateUUID();
      let res;

      if (booking.isRoundTrip) {
        const payload = {
          outboundBookingId: booking.outboundBookingId,
          returnBookingId: booking.returnBookingId,
          totalCost: booking.totalCost,
          paymentMethod: methodLabel
        };
        res = await bookingApi.makeRoundTripPayment(payload, idempotencyKey);
      } else {
        const payload = {
          bookingId: booking.id,
          totalCost: booking.totalCost,
          paymentMethod: methodLabel
        };
        res = await bookingApi.makePayment(payload, idempotencyKey);
      }

      if (res.success) {
        onPaymentSuccess(res.data);
      } else {
        setError(res.message || 'Payment was declined by the gateway');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error?.explanation?.[0] || 'Payment gateway connection timed out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', marginTop: '20px' }}>
      
      {/* Checkout Options Column */}
      <div className="glass-panel" style={{ padding: '40px' }}>
        
        {/* Round Trip combined indicator */}
        {booking.isRoundTrip && (
          <div style={{
            background: 'rgba(13, 148, 136, 0.1)',
            border: '1px solid rgba(13, 148, 136, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#2dd4bf',
            fontSize: '0.85rem',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: 700
          }}>
            Combined Round-Trip Checkout (Outbound & Return Legs)
          </div>
        )}

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Secure Checkout
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px' }}>
          Select a payment option below. All transactions are encrypted.
        </p>

        {/* Test Mode Banner */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#60a5fa',
          fontSize: '0.85rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldCheck size={18} />
          <span><strong>Test Mode Enabled:</strong> You can use the pre-filled dummy credentials to complete the checkout.</span>
        </div>

        {/* Payment Type Selector tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '30px'
        }}>
          <button 
            type="button"
            onClick={() => { setPayMethod('card'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: payMethod === 'card' ? 'var(--color-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CreditCard size={18} />
            Card
          </button>
          <button 
            type="button"
            onClick={() => { setPayMethod('upi'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: payMethod === 'upi' ? 'var(--color-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Smartphone size={18} />
            UPI
          </button>
          <button 
            type="button"
            onClick={() => { setPayMethod('netbanking'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: payMethod === 'netbanking' ? 'var(--color-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Landmark size={18} />
            Net Banking
          </button>
        </div>

        {/* Dynamic Payment option form */}
        <form onSubmit={handlePaymentSubmit}>
          
          {payMethod === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. Rishi Garg"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength="19"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV Code</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    maxLength="3"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {payMethod === 'upi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">UPI ID Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. rishi@okaxis"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  A verification request will be sent to this virtual payment address.
                </span>
              </div>
            </div>
          )}

          {payMethod === 'netbanking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Select Your Bank</label>
                <select 
                  className="form-input" 
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', color: '#fff', border: '1px solid var(--glass-border)', padding: '12px' }}
                >
                  <option value="sbi">State Bank of India (SBI)</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--color-accent)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '35px' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{
                flex: 1,
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing Pay...
                </>
              ) : (
                `Pay ₹${booking.totalCost.toLocaleString()}`
              )}
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-secondary" 
              disabled={loading}
              style={{ height: '48px', padding: '0 24px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Flight Detail Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Booking Details Summary */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            Fare Summary
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {booking.isRoundTrip 
                  ? `Combined Round-Trip Fare (${booking.noOfSeats} Seats × 2)` 
                  : `Ticket Base Cost (${booking.noOfSeats} Seats)`
                }
              </span>
              <span>₹{booking.totalCost.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Convenience Fee</span>
              <span style={{ color: '#10b981' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Taxes & GST</span>
              <span style={{ color: '#10b981' }}>INCLUDED</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              borderTop: '1px dashed var(--glass-border)', 
              paddingTop: '14px',
              fontSize: '1.1rem',
              fontWeight: 800
            }}>
              <span>Total Cost</span>
              <span style={{ color: 'var(--color-secondary)' }}>₹{booking.totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Outbound Flight Details Summary */}
        {flight && (
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              {booking.isRoundTrip ? 'Outbound Leg Details' : 'Itinerary Details'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Flight Number:</span>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{flight.flightNumber}</p>
              </div>
              <div style={{ display: 'flex', gap: '30px', marginTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>From:</span>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{flight.departureAirportId}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>To:</span>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{flight.arrivalAirportId}</p>
                </div>
              </div>
              <div style={{ marginTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Departure Schedule:</span>
                <p style={{ fontWeight: 600, marginTop: '2px' }}>
                  {new Date(flight.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Return Flight Details Summary */}
        {booking.isRoundTrip && returnFlight && (
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              Return Leg Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Flight Number:</span>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{returnFlight.flightNumber}</p>
              </div>
              <div style={{ display: 'flex', gap: '30px', marginTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>From:</span>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{returnFlight.departureAirportId}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>To:</span>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{returnFlight.arrivalAirportId}</p>
                </div>
              </div>
              <div style={{ marginTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Departure Schedule:</span>
                <p style={{ fontWeight: 600, marginTop: '2px' }}>
                  {new Date(returnFlight.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default PaymentScreen;
