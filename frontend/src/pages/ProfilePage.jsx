import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth.js";
import { getMeAPI, updateProfileAPI } from '../api/auth.api.js';
import { User, Mail, Calendar, MapPin, Droplet, Users, FileText, X, Edit2, Save, XCircle, Clock, AlertCircle } from 'lucide-react';
import profileImage from '/assets/profile.jpg';

const ProfilePage = ({ show, onClose, onShowToast }) => {
  const navigate = useNavigate();

  // Replaced: onAuthStateChanged(auth, ...) → useAuth() from AuthContext (JWT)
  const { user: authUser, updateUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEditPrompt, setShowEditPrompt] = useState(false);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall = window.matchMedia('(max-width: 480px)').matches;

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };
    checkTheme();
  }, [show]);

  // Replaced: onAuthStateChanged + getDoc(doc(db, 'users', user.uid)) → getMeAPI() from MongoDB
  useEffect(() => {
    if (!show) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        if (authUser) {
          // Fetch fresh profile from MongoDB
          const res = await getMeAPI();
          const profile = res.data?.user || res.data;

          const data = {
            name: profile.name || '',
            email: profile.email || '',
            dob: profile.dateOfBirth || '',
            gender: profile.gender || '',
            bloodGroup: profile.medicalProfile?.bloodGroup || '',
            city: profile.phone || '',
            existingConditions: profile.medicalProfile?.existingConditions || ''
          };

          setUserData(data);
          setEditedData(data);

          if (!data.name || data.name.trim() === '') {
            setShowEditPrompt(true);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to authUser context data if API fails
        if (authUser) {
          const fallback = {
            name: authUser.name || '',
            email: authUser.email || '',
            dob: '',
            gender: authUser.gender || '',
            bloodGroup: '',
            city: '',
            existingConditions: ''
          };
          setUserData(fallback);
          setEditedData(fallback);
          setShowEditPrompt(!fallback.name);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [show, authUser]);

  // Inject animations
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'profile-animations';
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById('profile-animations');
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInitials = (name) => {
    if (!name || name.trim() === '') return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowEditPrompt(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
  };

  // Replaced: updateDoc(doc(db, 'users', auth.currentUser.uid), editedData)
  //           → updateProfileAPI() to MongoDB via PUT /api/auth/profile
  const handleSave = async () => {
    if (!editedData.name || editedData.name.trim() === '') {
      if (onShowToast) {
        onShowToast('Please enter your name before saving.', 'error');
      }
      return;
    }

    setSaving(true);
    try {
      // Map UI fields back to backend schema
      const payload = {
        name: editedData.name,
        phone: editedData.city,           // city field stores phone in old code
        dateOfBirth: editedData.dob,
        gender: editedData.gender,
        medicalProfile: {
          bloodGroup: editedData.bloodGroup,
          existingConditions: editedData.existingConditions
        }
      };

      const res = await updateProfileAPI(payload);
      // eslint-disable-next-line no-unused-vars
      const updatedProfile = res.data?.user || res.data;

      // Update AuthContext so Navbar/Dashboard reflect new name immediately
      if (updateUser) {
        updateUser({ name: editedData.name });
      }

      setUserData(editedData);
      setIsEditing(false);
      setShowEditPrompt(false);

      if (onShowToast) {
        onShowToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (onShowToast) {
        onShowToast('Failed to update profile. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isEditing) {
      onClose();
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      display: show ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isSmall ? '16px' : '20px',
      animation: 'fadeIn 0.3s ease-out',
      overflowY: 'auto'
    },
    modal: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: isDarkMode
        ? '0 25px 80px rgba(0, 0, 0, 0.5)'
        : '0 25px 80px rgba(0, 0, 0, 0.15)',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      animation: 'scaleIn 0.3s ease-out',
      position: 'relative'
    },
    modalGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, var(--color-secondary), var(--color-third))',
      borderRadius: '24px 24px 0 0'
    },
    closeButton: {
      position: 'absolute',
      top: isSmall ? '12px' : '20px',
      right: isSmall ? '12px' : '20px',
      width: isSmall ? '36px' : '40px',
      height: isSmall ? '36px' : '40px',
      borderRadius: '50%',
      background: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 10,
      color: isDarkMode ? '#e5e7eb' : '#1e293b'
    },
    header: {
      padding: isSmall ? '24px 20px 20px' : '32px 40px 24px',
      textAlign: 'center',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      animation: 'slideUp 0.5s ease-out'
    },
    badge: {
      display: 'inline-block',
      padding: '6px 16px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.15), rgba(96, 165, 250, 0.15))'
        : 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
      borderRadius: '50px',
      fontSize: isSmall ? '0.7rem' : '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    title: {
      fontSize: isSmall ? '1.8rem' : isMobile ? '2rem' : '2.5rem',
      fontWeight: 800,
      marginBottom: '8px',
      fontFamily: "'Merriweather', serif",
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    alertBanner: {
      margin: isSmall ? '16px' : '24px',
      padding: isSmall ? '14px 16px' : '16px 20px',
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15))',
      border: '2px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'pulse 2s ease-in-out infinite'
    },
    alertText: {
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      fontWeight: 600,
      color: isDarkMode ? '#fcd34d' : '#d97706',
      lineHeight: 1.5
    },
    profileSection: {
      padding: isSmall ? '24px 20px' : '32px 40px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isSmall ? '24px' : '32px',
      alignItems: isMobile ? 'center' : 'flex-start',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      animation: 'slideUp 0.5s ease-out 0.1s backwards'
    },
    avatarSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    },
    avatarWrapper: {
      position: 'relative',
      width: isSmall ? '100px' : '120px',
      height: isSmall ? '100px' : '120px'
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '4px solid',
      borderColor: isDarkMode ? '#60a5fa' : '#0d9db8',
      boxShadow: '0 8px 24px rgba(13, 157, 184, 0.3)'
    },
    avatarInitials: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isSmall ? '2.5rem' : '3rem',
      fontWeight: 800,
      color: '#ffffff',
      border: '4px solid',
      borderColor: isDarkMode ? '#60a5fa' : '#0d9db8',
      boxShadow: '0 8px 24px rgba(13, 157, 184, 0.3)',
      fontFamily: "'Merriweather', serif"
    },
    userInfo: {
      flex: 1,
      textAlign: isMobile ? 'center' : 'left'
    },
    userName: {
      fontSize: isSmall ? '1.8rem' : '2.2rem',
      fontWeight: 700,
      color: isDarkMode ? '#f9fafb' : '#1e293b',
      marginBottom: '8px',
      fontFamily: "'Merriweather', serif"
    },
    userEmail: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },
    quickStats: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '16px'
    },
    statCard: {
      background: isDarkMode
        ? 'rgba(13, 157, 184, 0.1)'
        : 'rgba(13, 157, 184, 0.05)',
      padding: isSmall ? '10px' : '12px',
      borderRadius: '10px',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(13, 157, 184, 0.15)'}`,
      textAlign: 'center'
    },
    statLabel: {
      fontSize: isSmall ? '0.7rem' : '0.75rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      marginBottom: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: 600
    },
    statValue: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    healthHistoryCard: {
      margin: isSmall ? '16px' : '24px',
      padding: isSmall ? '20px' : '24px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(96, 165, 250, 0.1))'
        : 'linear-gradient(135deg, rgba(224, 242, 254, 1), rgba(186, 230, 253, 1))',
      borderRadius: '16px',
      border: `2px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
      animation: 'slideUp 0.5s ease-out 0.2s backwards'
    },
    healthHistoryTitle: {
      fontSize: isSmall ? '1.1rem' : '1.3rem',
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0c4a6e',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: "'Merriweather', serif"
    },
    healthHistoryDesc: {
      fontSize: isSmall ? '0.85rem' : '0.95rem',
      color: isDarkMode ? '#93c5fd' : '#0c4a6e',
      marginBottom: '16px',
      lineHeight: 1.5
    },
    historyButton: {
      padding: isSmall ? '10px 20px' : '12px 24px',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      color: '#ffffff',
      border: 'none',
      borderRadius: '10px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(13, 157, 184, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    formSection: {
      padding: isSmall ? '24px 20px' : '32px 40px',
      animation: 'slideUp 0.5s ease-out 0.3s backwards'
    },
    sectionTitle: {
      fontSize: isSmall ? '1rem' : '1.1rem',
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      marginBottom: '20px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isSmall ? '16px' : '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: isSmall ? '0.8rem' : '0.85rem',
      fontWeight: 600,
      color: isDarkMode ? '#9ca3af' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    input: {
      padding: isSmall ? '10px 14px' : '12px 16px',
      background: isDarkMode
        ? 'rgba(55, 65, 81, 0.5)'
        : 'rgba(248, 250, 252, 1)',
      border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(226, 232, 240, 1)'}`,
      borderRadius: '10px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#e5e7eb' : '#1e293b',
      transition: 'all 0.3s ease',
      outline: 'none',
      fontFamily: "'Inter', sans-serif"
    },
    select: {
      padding: isSmall ? '10px 14px' : '12px 16px',
      background: isDarkMode
        ? 'rgba(55, 65, 81, 0.5)'
        : 'rgba(248, 250, 252, 1)',
      border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(226, 232, 240, 1)'}`,
      borderRadius: '10px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#e5e7eb' : '#1e293b',
      cursor: 'pointer',
      outline: 'none',
      fontFamily: "'Inter', sans-serif"
    },
    textarea: {
      padding: isSmall ? '10px 14px' : '12px 16px',
      background: isDarkMode
        ? 'rgba(55, 65, 81, 0.5)'
        : 'rgba(248, 250, 252, 1)',
      border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(226, 232, 240, 1)'}`,
      borderRadius: '10px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#e5e7eb' : '#1e293b',
      minHeight: isSmall ? '80px' : '100px',
      resize: 'vertical',
      outline: 'none',
      fontFamily: "'Inter', sans-serif",
      lineHeight: 1.6
    },
    readOnly: {
      background: isDarkMode
        ? 'rgba(55, 65, 81, 0.3)'
        : 'rgba(241, 245, 249, 1)',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    actions: {
      display: 'flex',
      gap: '12px',
      padding: isSmall ? '20px' : '24px 40px 32px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      justifyContent: 'flex-end',
      flexDirection: isMobile ? 'column-reverse' : 'row'
    },
    button: (variant) => ({
      padding: isSmall ? '12px 24px' : '14px 28px',
      borderRadius: '12px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      fontWeight: 700,
      cursor: variant === 'disabled' ? 'not-allowed' : 'pointer',
      border: 'none',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      opacity: variant === 'disabled' ? 0.6 : 1,
      ...(variant === 'primary' && {
        background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(13, 157, 184, 0.3)'
      }),
      ...(variant === 'success' && {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
      }),
      ...(variant === 'secondary' && {
        background: isDarkMode
          ? 'rgba(148, 163, 184, 0.1)'
          : 'rgba(226, 232, 240, 1)',
        color: isDarkMode ? '#e5e7eb' : '#1e293b',
        border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 1)'}`
      })
    })
  };

  const loaderStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px'
    },
    spinner: {
      width: isSmall ? '48px' : '60px',
      height: isSmall ? '48px' : '60px',
      border: '4px solid transparent',
      borderTop: '4px solid var(--color-secondary)',
      borderRight: '4px solid var(--color-third)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '24px'
    },
    text: {
      fontSize: isSmall ? '1rem' : '1.2rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      fontWeight: 600
    }
  };

  if (!show) return null;

  if (loading || !userData) {
    return (
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <div style={styles.modalGlow}></div>
          <div style={loaderStyles.container}>
            <div style={loaderStyles.spinner}></div>
            <p style={loaderStyles.text}>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalGlow}></div>

        <button
          style={styles.closeButton}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.badge}>MY ACCOUNT</span>
          <h2 style={styles.title}>Profile Settings</h2>
        </div>

        {/* Edit Prompt Alert */}
        {showEditPrompt && (
          <div style={styles.alertBanner}>
            <AlertCircle size={20} color={isDarkMode ? '#fcd34d' : '#d97706'} />
            <span style={styles.alertText}>
              Please complete your profile by adding your name and other details.
            </span>
          </div>
        )}

        {/* Profile Section */}
        <div style={styles.profileSection}>
          <div style={styles.avatarSection}>
            <div style={styles.avatarWrapper}>
              <img
                src={profileImage}
                alt={userData?.name || 'User'}
                style={styles.avatar}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const initials = document.createElement('div');
                  initials.style.cssText = Object.entries(styles.avatarInitials).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ');
                  initials.textContent = getInitials(userData?.name);
                  e.target.parentNode.appendChild(initials);
                }}
              />
            </div>
          </div>

          <div style={styles.userInfo}>
            <h3 style={styles.userName}>
              {(!userData?.name || userData?.name.trim() === '') ? '✏️ Complete Your Profile' : userData?.name}
            </h3>
            <div style={styles.userEmail}>
              <Mail size={16} />
              {userData?.email || 'No email provided'}
            </div>

            <div style={styles.quickStats}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Gender</div>
                <div style={styles.statValue}>{userData?.gender || 'N/A'}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Blood Group</div>
                <div style={styles.statValue}>{userData?.bloodGroup || 'N/A'}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Location</div>
                <div style={styles.statValue}>{userData?.city || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Health History Card */}
        <div style={styles.healthHistoryCard}>
          <h3 style={styles.healthHistoryTitle}>
            <Clock size={20} />
            Health History
          </h3>
          <p style={styles.healthHistoryDesc}>
            View your saved diseases and assessment history
          </p>
          {/* Replaced: window.location.href → React Router navigate */}
          <button
            style={styles.historyButton}
            onClick={() => { onClose(); navigate('/history'); }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(13, 157, 184, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 157, 184, 0.3)';
            }}
          >
            View History
            <FileText size={16} />
          </button>
        </div>

        {/* Form Section */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>
            <User size={18} />
            Personal Information
          </h3>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={14} />
                Full Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  style={styles.input}
                  value={editedData?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <div style={{ ...styles.input, ...styles.readOnly }}>
                  {userData?.name || 'Not set - Click Edit to add'}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Mail size={14} />
                Email Address *
              </label>
              <div style={{ ...styles.input, ...styles.readOnly }}>
                {userData?.email || 'N/A'}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Calendar size={14} />
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  style={styles.input}
                  value={editedData?.dob || ''}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
              ) : (
                <div style={{ ...styles.input, ...styles.readOnly }}>
                  {formatDate(userData?.dob)}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Users size={14} />
                Gender
              </label>
              {isEditing ? (
                <select
                  style={styles.select}
                  value={editedData?.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div style={{ ...styles.input, ...styles.readOnly }}>
                  {userData?.gender || 'N/A'}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Droplet size={14} />
                Blood Group
              </label>
              {isEditing ? (
                <select
                  style={styles.select}
                  value={editedData?.bloodGroup || ''}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              ) : (
                <div style={{ ...styles.input, ...styles.readOnly }}>
                  {userData?.bloodGroup || 'N/A'}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <MapPin size={14} />
                City / Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  style={styles.input}
                  value={editedData?.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Mumbai, Delhi"
                />
              ) : (
                <div style={{ ...styles.input, ...styles.readOnly }}>
                  {userData?.city || 'N/A'}
                </div>
              )}
            </div>

            <div style={{ ...styles.formGroup, gridColumn: isMobile ? '1' : '1 / -1' }}>
              <label style={styles.label}>
                <FileText size={14} />
                Existing Medical Conditions
              </label>
              {isEditing ? (
                <textarea
                  style={styles.textarea}
                  value={editedData?.existingConditions || ''}
                  onChange={(e) => handleInputChange('existingConditions', e.target.value)}
                  placeholder="Enter any existing medical conditions..."
                />
              ) : (
                <div style={{ ...styles.textarea, ...styles.readOnly }}>
                  {userData?.existingConditions || 'None reported'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {isEditing ? (
            <>
              <button
                style={styles.button('secondary')}
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <XCircle size={18} />
                Cancel
              </button>
              <button
                style={styles.button(saving ? 'disabled' : 'success')}
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              style={styles.button('primary')}
              onClick={handleEdit}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(13, 157, 184, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 157, 184, 0.3)';
              }}
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;