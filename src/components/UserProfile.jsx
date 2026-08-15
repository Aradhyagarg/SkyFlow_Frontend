import React, { useState } from 'react';
import { User, Phone, Globe, ShieldCheck, Mail, Calendar, Save } from 'lucide-react';
import { authApi } from '../services/api';

function UserProfile({ userProfile, setUserProfile }) {
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [passportNumber, setPassportNumber] = useState(userProfile?.passportNumber || '');
  const [nationality, setNationality] = useState(userProfile?.nationality || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await authApi.updateProfile({
        fullName,
        phoneNumber,
        passportNumber,
        nationality
      });
      if (res.success) {
        setUserProfile(res.data);
        setSuccess('Profile updated successfully! Auto-fill is now ready for your next checkout.');
      } else {
        setError(res.error?.explanation || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.error?.explanation?.[0] || 'Auth Service is unreachable');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
      
      {/* Left Column: Account Details Info Card */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Status</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
            <div style={{
              background: userProfile?.isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              padding: '12px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: userProfile?.isVerified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)'
            }}>
              <ShieldCheck size={28} color={userProfile?.isVerified ? '#34d399' : 'var(--color-accent)'} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {userProfile?.isVerified ? 'Verified Profile' : 'Unverified Account'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {userProfile?.isVerified ? 'Email verified & active' : 'Please check verification status'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <Mail size={16} color="var(--color-secondary)" />
            <span style={{ color: 'var(--text-muted)' }}>Email:</span>
            <span style={{ fontWeight: 600 }}>{userProfile?.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <Calendar size={16} color="var(--color-primary)" />
            <span style={{ color: 'var(--text-muted)' }}>Member Since:</span>
            <span style={{ fontWeight: 600 }}>{formatDate(userProfile?.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <User size={16} color="var(--color-secondary)" />
            <span style={{ color: 'var(--text-muted)' }}>Account Tier:</span>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
              {userProfile?.role}
            </span>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(138, 92, 246, 0.05), rgba(6, 182, 212, 0.05))',
          border: '1px dashed var(--glass-border)',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: '1.5'
        }}>
          💡 **Why save your profile?** Keeping your travel profile updated will automatically pre-fill your name, nationality, and passport details on future checkouts, saving you time when booking flights!
        </div>
      </div>

      {/* Right Column: Edit Profile Details Form */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>
          Edit Travel Profile Details
        </h3>

        {error && (
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
            {error}
          </div>
        )}

        {success && (
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
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name (as in Passport)</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', paddingLeft: '45px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. +91 98765 43210" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ width: '100%', paddingLeft: '45px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Passport / National ID Number</label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter Document ID Number" 
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                style={{ width: '100%', paddingLeft: '45px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nationality</label>
            <div style={{ position: 'relative' }}>
              <Globe size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Indian" 
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                style={{ width: '100%', paddingLeft: '45px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px'
            }}
          >
            <Save size={18} />
            {loading ? 'Saving Changes...' : 'Save Profile details'}
          </button>

        </form>
      </div>

    </div>
  );
}

export default UserProfile;
