import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Wallet,
  Calendar,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Profile = () => {
  const { user, refreshUser, logout } = useAuth();

  // Profile update form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Balance reset state
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', isError: false });
    setProfileLoading(true);

    try {
      const res = await userAPI.updateProfile({ name, email });
      if (res.data.success) {
        setProfileMsg({ text: 'Profile updated successfully!', isError: false });
        await refreshUser();
      }
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile',
        isError: true
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', isError: false });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', isError: true });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters', isError: true });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await userAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (res.data.success) {
        setPasswordMsg({ text: 'Password updated successfully!', isError: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update password',
        isError: true
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetBalance = async () => {
    if (!window.confirm('Reset virtual trading balance back to initial ₹10,00,000?')) {
      return;
    }
    setResetLoading(true);
    try {
      const res = await userAPI.resetBalance();
      if (res.data.success) {
        setResetMsg('Virtual balance has been reset to ₹10,00,000.00!');
        await refreshUser();
        setTimeout(() => setResetMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to reset virtual balance');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Account Settings & Security
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '2px' }}>
          Manage your account credentials and simulated trading preferences.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <User size={18} color="var(--primary)" />
              <span>Personal Details</span>
            </div>
          </div>

          {profileMsg.text && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: profileMsg.isError ? 'var(--loss-light)' : 'var(--gain-light)',
              border: `1px solid ${profileMsg.isError ? 'var(--loss-border)' : 'var(--gain-border)'}`,
              borderRadius: 'var(--radius-md)',
              color: profileMsg.isError ? 'var(--loss-dark)' : 'var(--gain-dark)',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {profileMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Member Since</label>
              <div style={{
                padding: '12px 14px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={18} color="var(--primary)" />
              <span>Change Password</span>
            </div>
          </div>

          {passwordMsg.text && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: passwordMsg.isError ? 'var(--loss-light)' : 'var(--gain-light)',
              border: `1px solid ${passwordMsg.isError ? 'var(--loss-border)' : 'var(--gain-border)'}`,
              borderRadius: 'var(--radius-md)',
              color: passwordMsg.isError ? 'var(--loss-dark)' : 'var(--gain-dark)',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {passwordMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (min 6 characters)</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Virtual Trading Simulator Settings Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-title">
              <Wallet size={18} color="#059669" />
              <span>Virtual Portfolio Maintenance</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Current Balance: ₹{Number(user?.virtualBalance || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '560px' }}>
                Need a fresh start to test new trading strategies? You can reset your simulated virtual balance back to ₹10,00,000 at any time.
              </p>
              {resetMsg && (
                <div style={{ color: 'var(--gain-dark)', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
                  ✓ {resetMsg}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleResetBalance}
                disabled={resetLoading}
                className="btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
              >
                <RefreshCw size={16} />
                <span>Reset to ₹10,00,000</span>
              </button>

              <button
                onClick={logout}
                className="btn-sell"
                style={{ padding: '10px 20px', fontWeight: 700 }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
