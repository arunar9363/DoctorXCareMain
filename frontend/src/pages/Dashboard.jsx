// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMeAPI } from "../api/auth.api.js";
import { getAssessmentsAPI } from "../api/assessment.api.js";
import { getSavedDiseasesAPI } from "../api/disease.api.js";
import profileImage from "/assets/profile.jpg";

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

function Dashboard() {
  const navigate = useNavigate();

  // Replaced: onAuthStateChanged(auth, ...) → useAuth() from AuthContext (JWT)
  const { user, loading: authLoading } = useAuth();

  const [userName, setUserName] = useState("Doctor");
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [savedDiseases, setSavedDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isVisible, setIsVisible] = useState({});
  const cardRefs = useRef([]);

  // Handle Resize for Mobile View
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check theme
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = cardRefs.current.indexOf(entry.target);
          if (index !== -1) {
            setIsVisible(prev => ({ ...prev, [index]: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading]);

  // Add animations CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }

      .loader-spin {
        animation: rotation 1s linear infinite;
      }

      .fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }

      .slide-in-left {
        animation: slideInLeft 0.6s ease-out forwards;
      }

      .slide-in-right {
        animation: slideInRight 0.6s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Replaced: onAuthStateChanged useEffect → useAuth + MongoDB API calls
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (!authLoading && user) {
      const fetchDashboardData = async () => {
        // Set user name from JWT context first (instant)
        if (user.name) {
          setUserName(user.name);
        }

        // Fetch fresh profile from MongoDB (gets latest name)
        try {
          const profileRes = await getMeAPI();
          const profile = profileRes.data?.user || profileRes.data;
          if (profile?.name) setUserName(profile.name);
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }

        // Fetch recent assessments from MongoDB
        try {
          const assessRes = await getAssessmentsAPI();
          const assessments = assessRes.data || [];
          setRecentAssessments(assessments.slice(0, 3));
        } catch (e) {
          console.error("Error fetching assessments:", e);
        }

        // Fetch saved diseases from MongoDB
        try {
          const diseasesRes = await getSavedDiseasesAPI();
          const diseases = diseasesRes.data || [];
          setSavedDiseases(diseases.slice(0, 3));
        } catch (e) {
          console.error("Error fetching saved diseases:", e);
        }

        // Minimum loading time for smooth transition
        setTimeout(() => setLoading(false), 800);
      };

      fetchDashboardData();
    }
  }, [user, authLoading, navigate]);

  // --- STYLES ---
  const styles = {
    // Loading Screen
    loadingContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    },
    loader: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: '4px solid transparent',
      borderTopColor: '#0d9db8',
      borderRightColor: '#3b82f6',
      boxSizing: 'border-box',
      position: 'relative'
    },
    loaderInner: {
      content: "''",
      position: 'absolute',
      top: '4px',
      left: '4px',
      right: '4px',
      bottom: '4px',
      borderRadius: '50%',
      border: '4px solid transparent',
      borderTopColor: '#60a5fa',
      borderLeftColor: '#0d9db8'
    },
    loadingText: {
      marginTop: '24px',
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#0d9db8',
      fontFamily: "'Merriweather', serif",
      animation: 'pulse 2s ease-in-out infinite'
    },

    container: {
      paddingTop: "120px",
      paddingBottom: "60px",
      paddingLeft: isMobile ? "16px" : "40px",
      paddingRight: isMobile ? "16px" : "40px",
      minHeight: "100vh",
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e1b4b 75%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%, #ffffff 100%)',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: isDarkMode ? 0.03 : 0.05,
      backgroundImage: `radial-gradient(circle at 25px 25px, ${isDarkMode ? '#60a5fa' : '#0d9db8'} 2%, transparent 0%), 
                        radial-gradient(circle at 75px 75px, ${isDarkMode ? '#0d9db8' : '#60a5fa'} 2%, transparent 0%)`,
      backgroundSize: '100px 100px',
      pointerEvents: 'none'
    },
    content: {
      maxWidth: "1400px",
      margin: "0 auto",
      position: 'relative',
      zIndex: 1
    },

    // Welcome Section
    welcomeSection: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "50px",
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : '#ffffff',
      padding: isMobile ? "30px 24px" : "40px 50px",
      borderRadius: "24px",
      backdropFilter: "blur(20px)",
      border: isDarkMode ? "1px solid rgba(148, 163, 184, 0.1)" : "1px solid rgba(148, 163, 184, 0.15)",
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
        : '0 10px 40px rgba(0, 0, 0, 0.08)',
      animation: 'fadeInDown 0.8s ease-out',
      position: 'relative',
      overflow: 'hidden'
    },
    welcomeGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #0d9db8, #3b82f6, #0d9db8)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 3s linear infinite'
    },
    welcomeText: {
      flex: 1,
      textAlign: isMobile ? "center" : "left"
    },
    badge: {
      display: 'inline-block',
      padding: '6px 16px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.15), rgba(96, 165, 250, 0.15))'
        : 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
      borderRadius: '50px',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    h1: {
      fontSize: isMobile ? "2rem" : "2.5rem",
      fontWeight: "800",
      background: 'linear-gradient(135deg, #0d9db8, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: "12px",
      fontFamily: "'Merriweather', serif"
    },
    subtitle: {
      color: isDarkMode ? "#9ca3af" : "#64748b",
      fontSize: isMobile ? "1rem" : "1.15rem",
      lineHeight: 1.6
    },
    profileContainer: {
      position: 'relative',
      marginLeft: isMobile ? "0" : "30px",
      marginTop: isMobile ? "20px" : "0"
    },
    profileImage: {
      width: isMobile ? "90px" : "110px",
      height: isMobile ? "90px" : "110px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid transparent",
      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #0d9db8, #3b82f6) border-box',
      padding: "4px",
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      boxShadow: '0 8px 24px rgba(13, 157, 184, 0.3)'
    },
    profileRing: {
      position: 'absolute',
      top: '-8px',
      left: '-8px',
      right: '-8px',
      bottom: '-8px',
      borderRadius: '50%',
      border: '2px solid transparent',
      borderTopColor: '#0d9db8',
      borderRightColor: '#3b82f6',
      animation: 'rotation 3s linear infinite',
      opacity: 0.6
    },

    // Quick Stats
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '50px'
    },
    statCard: (index) => ({
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : '#ffffff',
      padding: '24px',
      borderRadius: '20px',
      border: isDarkMode ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(148, 163, 184, 0.15)',
      boxShadow: isDarkMode
        ? '0 4px 20px rgba(0, 0, 0, 0.2)'
        : '0 4px 20px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`
    }),
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      marginBottom: '12px',
      color: '#0d9db8'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '800',
      color: isDarkMode ? '#e5e7eb' : '#0f172a',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      fontWeight: 500
    },

    // Services Grid
    sectionHeader: {
      marginBottom: '30px',
      animation: 'slideInLeft 0.6s ease-out'
    },
    sectionTitle: {
      fontSize: isMobile ? '1.5rem' : '1.8rem',
      fontWeight: '800',
      color: isDarkMode ? '#e5e7eb' : '#0f172a',
      marginBottom: '8px',
      fontFamily: "'Merriweather', serif",
      position: 'relative',
      display: 'inline-block',
      paddingBottom: '12px'
    },
    titleUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '60px',
      height: '4px',
      background: 'linear-gradient(90deg, #0d9db8, #3b82f6)',
      borderRadius: '2px'
    },
    servicesGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
      gap: isMobile ? "20px" : "30px",
      marginBottom: "50px"
    },
    serviceCard: (index, isVisibleCard) => ({
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : '#ffffff',
      padding: "32px 28px 0 28px",
      borderRadius: "20px",
      boxShadow: isDarkMode
        ? '0 8px 30px rgba(0, 0, 0, 0.3)'
        : '0 8px 30px rgba(0, 0, 0, 0.08)',
      border: isDarkMode ? "1px solid rgba(148, 163, 184, 0.1)" : "1px solid rgba(148, 163, 184, 0.15)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      minHeight: "340px",
      position: "relative",
      overflow: "hidden",
      opacity: isVisibleCard ? 1 : 0,
      transform: isVisibleCard ? 'translateY(0)' : 'translateY(40px)',
      animation: isVisibleCard ? `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` : 'none'
    }),
    cardGlowLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #0d9db8, #3b82f6, #0d9db8)',
      backgroundSize: '200% 100%',
      opacity: 0,
      transition: 'opacity 0.3s ease'
    },
    textContainer: {
      width: '100%',
      zIndex: 2,
      marginBottom: '20px'
    },
    cardTitle: {
      fontSize: "1.4rem",
      fontWeight: "700",
      marginBottom: "12px",
      color: isDarkMode ? "#e5e7eb" : "#0f172a",
      fontFamily: "'Merriweather', serif"
    },
    cardDesc: {
      fontSize: "0.95rem",
      color: isDarkMode ? "#9ca3af" : "#64748b",
      lineHeight: "1.6",
      marginBottom: "16px"
    },
    arrowLink: {
      color: "#0d9db8",
      fontWeight: "700",
      fontSize: "0.95rem",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: 'transform 0.3s ease'
    },
    cardLargeImage: {
      width: "100%",
      maxWidth: "200px",
      height: "auto",
      maxHeight: "180px",
      alignSelf: "center",
      marginTop: "auto",
      filter: isDarkMode ? "brightness(0.9)" : "none",
      transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
    },

    // Bottom Section
    bottomSection: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "30px",
      marginTop: '50px'
    },
    sectionBox: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : '#ffffff',
      borderRadius: "20px",
      padding: "30px",
      border: isDarkMode ? "1px solid rgba(148, 163, 184, 0.1)" : "1px solid rgba(148, 163, 184, 0.15)",
      boxShadow: isDarkMode
        ? '0 8px 30px rgba(0, 0, 0, 0.3)'
        : '0 8px 30px rgba(0, 0, 0, 0.08)',
      animation: 'scaleIn 0.6s ease-out 0.4s backwards'
    },
    boxHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: isDarkMode ? "2px solid rgba(148, 163, 184, 0.1)" : "2px solid #f1f5f9"
    },
    boxTitle: {
      fontSize: "1.2rem",
      fontWeight: "700",
      color: isDarkMode ? "#e5e7eb" : "#0f172a",
      fontFamily: "'Merriweather', serif"
    },
    viewAllLink: {
      color: "#0d9db8",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "none",
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    listItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px",
      marginBottom: "12px",
      background: isDarkMode
        ? "rgba(148, 163, 184, 0.05)"
        : "#f8fafc",
      borderRadius: "12px",
      border: isDarkMode ? "1px solid rgba(148, 163, 184, 0.1)" : "1px solid #e2e8f0",
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    itemLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1
    },
    itemIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      color: '#0d9db8',
      flexShrink: 0
    },
    itemContent: {
      flex: 1,
      minWidth: 0
    },
    itemTitle: {
      fontWeight: "600",
      color: isDarkMode ? "#e5e7eb" : "#1e293b",
      marginBottom: "4px",
      fontSize: '0.95rem'
    },
    itemSub: {
      fontSize: "0.85rem",
      color: isDarkMode ? "#9ca3af" : "#64748b"
    },
    itemBadge: (color) => ({
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      whiteSpace: 'nowrap'
    }),
    emptyState: {
      textAlign: "center",
      padding: "40px 20px",
      color: isDarkMode ? "#6b7280" : "#94a3b8"
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '12px',
      opacity: 0.5
    },
    emptyText: {
      fontSize: '0.95rem',
      fontStyle: 'italic'
    }
  };

  // Helper to get severity color
  const getSeverityColor = (level) => {
    if (['emergency', 'emergency_ambulance', 'critical'].includes(level)) return '#ef4444';
    if (['consultation_6', 'consultation_24', 'moderate'].includes(level)) return '#f59e0b';
    return '#10b981';
  };

  // Loading Screen
  if (loading || authLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader} className="loader-spin">
          <div style={styles.loaderInner} className="loader-spin"></div>
        </div>
        <div style={styles.loadingText}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>

      <div style={styles.content}>
        {/* Welcome Header */}
        <div style={styles.welcomeSection}>
          <div style={styles.welcomeGlow}></div>
          <div style={styles.welcomeText}>
            <span style={styles.badge}>HEALTHCARE DASHBOARD</span>
            <h1 style={styles.h1}>Welcome back, {userName}!</h1>
            <p style={styles.subtitle}>Here's what's happening with your health today.</p>
          </div>
          <div style={styles.profileContainer}>
            <div style={styles.profileRing}></div>
            <img
              src={profileImage}
              alt="Profile"
              style={styles.profileImage}
              onClick={() => navigate('/my-profile')}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsGrid}>
          <div
            style={styles.statCard(0)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 12px 40px rgba(13, 157, 184, 0.3)'
                : '0 12px 40px rgba(13, 157, 184, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.2)'
                : '0 4px 20px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statValue}>{recentAssessments.length}</div>
            <div style={styles.statLabel}>Recent Assessments</div>
          </div>

          <div
            style={styles.statCard(1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 12px 40px rgba(13, 157, 184, 0.3)'
                : '0 12px 40px rgba(13, 157, 184, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.2)'
                : '0 4px 20px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div style={styles.statIcon}>💾</div>
            <div style={styles.statValue}>{savedDiseases.length}</div>
            <div style={styles.statLabel}>Saved Diseases</div>
          </div>

          <div
            style={styles.statCard(2)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 12px 40px rgba(13, 157, 184, 0.3)'
                : '0 12px 40px rgba(13, 157, 184, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.2)'
                : '0 4px 20px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div style={styles.statIcon}>🏥</div>
            <div style={styles.statValue}>24/7</div>
            <div style={styles.statLabel}>AI Assistant</div>
          </div>

          <div
            style={styles.statCard(3)}
            onClick={() => navigate('/services')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 12px 40px rgba(13, 157, 184, 0.3)'
                : '0 12px 40px rgba(13, 157, 184, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.2)'
                : '0 4px 20px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statValue}>7</div>
            <div style={styles.statLabel}>Active Services</div>
          </div>
        </div>

        {/* Services Section */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            Quick Access Services
            <div style={styles.titleUnderline}></div>
          </h2>
        </div>

        <div style={styles.servicesGrid}>
          {[
            {
              title: 'Analyze Symptoms',
              desc: 'Check your symptoms using our advanced AI to get instant triage advice.',
              link: 'Start Check',
              route: '/symptoms',
              image: '/assets/Symptomspage.svg',
              icon: '🔬'
            },
            {
              title: 'Disease Library',
              desc: 'Search our verified medical library for detailed disease information.',
              link: 'Explore',
              route: '/diseases',
              image: '/assets/diseas.svg',
              icon: '📚'
            },
            {
              title: 'Lab Report Analysis',
              desc: 'Upload lab reports or medical imaging for AI-powered analysis and insights.',
              link: 'Upload Now',
              route: '/lab-analysis',
              image: '/assets/report_analysis.svg',
              icon: '🧪'
            },
            {
              title: 'AI Health Assistant',
              desc: 'Chat with DoctorXCare for personalized health guidance 24/7.',
              link: 'Chat Now',
              route: '/doctorx-ai',
              image: '/assets/hi.svg',
              icon: '💬'
            }
          ].map((service, index) => (
            <div
              key={index}
              ref={el => cardRefs.current[index] = el}
              style={styles.serviceCard(index, isVisible[index])}
              onClick={() => navigate(service.route)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '0 20px 50px rgba(13, 157, 184, 0.3)'
                  : '0 20px 50px rgba(13, 157, 184, 0.2)';
                e.currentTarget.querySelector('.card-glow').style.opacity = '1';
                e.currentTarget.querySelector('.card-glow').style.animation = 'shimmer 2s linear infinite';
                e.currentTarget.querySelector('.card-image').style.transform = 'scale(1.1) rotate(2deg)';
                e.currentTarget.querySelector('.arrow-link').style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '0 8px 30px rgba(0, 0, 0, 0.3)'
                  : '0 8px 30px rgba(0, 0, 0, 0.08)';
                e.currentTarget.querySelector('.card-glow').style.opacity = '0';
                e.currentTarget.querySelector('.card-image').style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.querySelector('.arrow-link').style.transform = 'translateX(0)';
              }}
            >
              <div className="card-glow" style={styles.cardGlowLine}></div>
              <div style={styles.textContainer}>
                <h3 style={styles.cardTitle}>{service.title}</h3>
                <p style={styles.cardDesc}>{service.desc}</p>
                <div className="arrow-link" style={styles.arrowLink}>{service.link} →</div>
              </div>
              <img
                src={service.image}
                alt={service.title}
                className="card-image"
                style={styles.cardLargeImage}
                onError={(e) => e.target.src = 'https://via.placeholder.com/200x180?text=Service'}
              />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={styles.bottomSection}>
          {/* Recent Assessments */}
          <div style={styles.sectionBox}>
            <div style={styles.boxHeader}>
              <div style={styles.boxTitle}>Recent Assessments</div>
              <div
                style={styles.viewAllLink}
                onClick={() => navigate('/history')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateX(4px)';
                  e.target.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateX(0)';
                  e.target.style.color = '#0d9db8';
                }}
              >
                View All →
              </div>
            </div>

            {recentAssessments.length > 0 ? (
              recentAssessments.map((item) => (
                <div
                  key={item._id || item.id}
                  style={styles.listItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = isDarkMode
                      ? '0 4px 12px rgba(13, 157, 184, 0.2)'
                      : '0 4px 12px rgba(13, 157, 184, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.itemLeft}>
                    <div style={styles.itemIcon}>📋</div>
                    <div style={styles.itemContent}>
                      <div style={styles.itemTitle}>{item.patientName || 'Self Assessment'}</div>
                      <div style={styles.itemSub}>{formatDate(item.completedAt || item.createdAt)} • {item.symptoms?.length || 0} Symptoms</div>
                    </div>
                  </div>
                  <span style={styles.itemBadge(getSeverityColor(item.triageLevel))}>
                    {item.triageLevel === 'no_action' ? 'Stable' : 'Check Required'}
                  </span>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📊</div>
                <div style={styles.emptyText}>No recent assessments found</div>
              </div>
            )}
          </div>

          {/* Saved Diseases */}
          <div style={styles.sectionBox}>
            <div style={styles.boxHeader}>
              <div style={styles.boxTitle}>Saved Diseases</div>
              <div
                style={styles.viewAllLink}
                onClick={() => navigate('/history')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateX(4px)';
                  e.target.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateX(0)';
                  e.target.style.color = '#0d9db8';
                }}
              >
                View All →
              </div>
            </div>

            {savedDiseases.length > 0 ? (
              savedDiseases.map((item) => (
                <div
                  key={item._id || item.id}
                  style={styles.listItem}
                  onClick={() => navigate(`/diseases/${item.diseaseSlug}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = isDarkMode
                      ? '0 4px 12px rgba(13, 157, 184, 0.2)'
                      : '0 4px 12px rgba(13, 157, 184, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.itemLeft}>
                    <div style={styles.itemIcon}>🏥</div>
                    <div style={styles.itemContent}>
                      <div style={styles.itemTitle}>{item.name || item.diseaseName}</div>
                      <div style={styles.itemSub}>{item.category || 'Medical Condition'}</div>
                    </div>
                  </div>
                  <span style={{ color: '#0d9db8', fontSize: '1.5rem' }}>›</span>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💾</div>
                <div style={styles.emptyText}>No saved diseases yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;