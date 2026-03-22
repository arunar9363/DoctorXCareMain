import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookmarkCheck,
  Activity,
  Trash2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { getAssessmentsAPI, deleteAssessmentAPI, getAssessmentStatsAPI } from '../api/assessment.api.js';
import { getSavedDiseases as getSavedDiseasesAPI, removeSavedDisease as removeSavedDiseaseAPI } from '../api/savedDiseaseApi.js'
import useAuth from "../hooks/useAuth.js";

const HistoryPage = () => {
  const navigate = useNavigate();

  // Replaced: onAuthStateChanged(auth, ...) → useAuth() from AuthContext (JWT)
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('assessments');
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, id: null, name: null });

  // Data states
  const [savedDiseases, setSavedDiseases] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall = window.matchMedia('(max-width: 480px)').matches;

  // Check theme
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadAllData();
    }
  }, [user, authLoading]);

  // Replaced: getSavedDiseases + getAssessmentHistory + getAssessmentStats (Firebase)
  //           → getSavedDiseasesAPI + getAssessmentsAPI + getAssessmentStatsAPI (MongoDB)
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [diseasesRes, assessmentsRes, statsRes] = await Promise.all([
        getSavedDiseasesAPI(),
        getAssessmentsAPI(),
        getAssessmentStatsAPI()
      ]);

      setSavedDiseases(diseasesRes.data || []);
      setAssessments(assessmentsRes.data || []);
      setStats(statsRes.data || statsRes);
    } catch (error) {
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDisease = (diseaseId) => {
    const disease = savedDiseases.find(d => d._id === diseaseId || d.id === diseaseId);
    setDeleteModal({
      show: true,
      type: 'disease',
      id: diseaseId,
      name: disease?.diseaseName || disease?.name || 'this disease'
    });
  };

  const handleDeleteAssessment = (assessmentId) => {
    const assessment = assessments.find(a => a._id === assessmentId || a.id === assessmentId);
    setDeleteModal({
      show: true,
      type: 'assessment',
      id: assessmentId,
      name: assessment?.patientName || 'this assessment'
    });
  };

  // Replaced: removeSavedDisease + deleteAssessment (Firebase) → MongoDB API calls
  const confirmDelete = async () => {
    try {
      if (deleteModal.type === 'disease') {
        // Find the disease slug for DELETE API
        const disease = savedDiseases.find(
          d => d._id === deleteModal.id || d.id === deleteModal.id
        );
        const slug = disease?.diseaseSlug || disease?.slug || deleteModal.id;
        await removeSavedDiseaseAPI(slug);
        setSavedDiseases(prev => prev.filter(
          d => d._id !== deleteModal.id && d.id !== deleteModal.id
        ));
      } else if (deleteModal.type === 'assessment') {
        await deleteAssessmentAPI(deleteModal.id);
        setAssessments(prev => prev.filter(
          a => a._id !== deleteModal.id && a.id !== deleteModal.id
        ));
        // Reload stats after assessment delete
        try {
          const statsRes = await getAssessmentStatsAPI();
          setStats(statsRes.data || statsRes);
        } catch { /* stats reload failed silently */ }
      }
      setDeleteModal({ show: false, type: null, id: null, name: null });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, type: null, id: null, name: null });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTriageColor = (level) => {
    const colors = {
      'emergency': '#dc2626',
      'emergency_ambulance': '#b91c1c',
      'consultation_6': '#f59e0b',
      'consultation_24': '#fbbf24',
      'consultation': '#10b981',
      'self_care': '#6366f1',
      'no_action': '#8b5cf6'
    };
    return colors[level] || '#6b7280';
  };

  const getTriageLabel = (level) => {
    const labels = {
      'emergency': 'Emergency',
      'emergency_ambulance': 'Call 102',
      'consultation_6': 'See Doctor (6hrs)',
      'consultation_24': 'See Doctor (24hrs)',
      'consultation': 'Doctor Visit',
      'self_care': 'Self Care',
      'no_action': 'No Action'
    };
    return labels[level] || level;
  };

  // Inject animations
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'history-animations';
    style.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .gradient-text {
        background: linear-gradient(135deg, var(--color-secondary), var(--color-third));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById('history-animations');
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
      paddingTop: isSmall ? '80px' : isMobile ? '90px' : '100px',
      paddingBottom: isSmall ? '40px' : '60px',
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
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isSmall ? '0 16px' : isMobile ? '0 20px' : '0 40px',
      position: 'relative',
      zIndex: 1
    },
    header: {
      marginBottom: isSmall ? '32px' : '48px',
      animation: isVisible ? 'fadeInUp 0.6s ease-out' : 'none'
    },
    badge: {
      display: 'inline-block',
      padding: '8px 20px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.15), rgba(96, 165, 250, 0.15))'
        : 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
      borderRadius: '50px',
      fontSize: isSmall ? '0.7rem' : '0.8rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '16px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    title: {
      fontSize: isSmall ? '2rem' : isMobile ? '2.5rem' : '3.5rem',
      fontWeight: 800,
      marginBottom: '12px',
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    subtitle: {
      fontSize: isSmall ? '1rem' : '1.2rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      maxWidth: '600px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: isSmall ? '16px' : '24px',
      marginBottom: isSmall ? '32px' : '48px'
    },
    statCard: (index) => ({
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: isSmall ? '24px' : '32px',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
        : '0 10px 40px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      animation: isVisible ? `scaleIn 0.6s ease-out ${index * 0.1}s backwards` : 'none',
      position: 'relative',
      overflow: 'hidden'
    }),
    statGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, var(--color-secondary), var(--color-third))',
      borderRadius: '20px 20px 0 0'
    },
    statIconWrapper: {
      width: isSmall ? '48px' : '56px',
      height: isSmall ? '48px' : '56px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(96, 165, 250, 0.1))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    statLabel: {
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      marginBottom: '8px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statValue: {
      fontSize: isSmall ? '2rem' : '2.5rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontFamily: "'Merriweather', serif"
    },
    tabsWrapper: {
      background: isDarkMode
        ? 'rgba(30, 41, 59, 0.5)'
        : 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '8px',
      marginBottom: isSmall ? '32px' : '40px',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      animation: isVisible ? 'fadeInUp 0.6s ease-out 0.3s backwards' : 'none'
    },
    tabs: {
      display: 'flex',
      gap: '8px'
    },
    tab: (isActive) => ({
      flex: 1,
      padding: isSmall ? '12px 16px' : '16px 24px',
      background: isActive
        ? 'linear-gradient(135deg, var(--color-secondary), var(--color-third))'
        : 'transparent',
      color: isActive ? '#ffffff' : isDarkMode ? '#e5e7eb' : '#1e293b',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: isSmall ? '0.9rem' : '1rem',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Inter', sans-serif",
      boxShadow: isActive ? '0 4px 12px rgba(13, 157, 184, 0.3)' : 'none'
    }),
    contentSection: {
      animation: isVisible ? 'fadeInUp 0.6s ease-out 0.4s backwards' : 'none'
    },
    emptyState: {
      textAlign: 'center',
      padding: isSmall ? '60px 20px' : '80px 40px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
        : '0 10px 40px rgba(0, 0, 0, 0.08)'
    },
    emptyIcon: {
      fontSize: isSmall ? '4rem' : '5rem',
      marginBottom: '24px',
      opacity: 0.5
    },
    emptyTitle: {
      fontSize: isSmall ? '1.5rem' : '2rem',
      fontWeight: 700,
      color: isDarkMode ? '#f9fafb' : '#1e293b',
      marginBottom: '12px',
      fontFamily: "'Merriweather', serif"
    },
    emptyText: {
      fontSize: isSmall ? '1rem' : '1.1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      marginBottom: '32px',
      lineHeight: 1.6
    },
    emptyButton: {
      padding: isSmall ? '14px 28px' : '16px 32px',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: isSmall ? '0.95rem' : '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 8px 24px rgba(13, 157, 184, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: isSmall ? '16px' : '24px'
    },
    card: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: isSmall ? '20px' : '24px',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
        : '0 10px 40px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, var(--color-secondary), var(--color-third))',
      borderRadius: '20px 20px 0 0'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    cardTitle: {
      fontSize: isSmall ? '1.1rem' : '1.25rem',
      fontWeight: 700,
      color: isDarkMode ? '#f9fafb' : '#1e293b',
      marginBottom: '8px',
      fontFamily: "'Merriweather', serif"
    },
    cardMeta: {
      fontSize: isSmall ? '0.8rem' : '0.85rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '4px'
    },
    deleteBtn: {
      background: isDarkMode
        ? 'rgba(220, 38, 38, 0.1)'
        : 'rgba(220, 38, 38, 0.05)',
      border: 'none',
      color: '#dc2626',
      cursor: 'pointer',
      padding: '10px',
      borderRadius: '10px',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    triageBadge: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: isSmall ? '0.75rem' : '0.8rem',
      fontWeight: 700,
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }),
    symptomChipsContainer: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`
    },
    chipLabel: {
      fontSize: isSmall ? '0.75rem' : '0.8rem',
      fontWeight: 600,
      marginBottom: '10px',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    symptomChip: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      margin: '4px 4px 4px 0',
      background: isDarkMode
        ? 'rgba(13, 157, 184, 0.15)'
        : 'rgba(13, 157, 184, 0.1)',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      borderRadius: '10px',
      fontSize: isSmall ? '0.75rem' : '0.85rem',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
      fontWeight: 500
    },
    conditionsSection: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`
    },
    conditionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      color: isDarkMode ? '#e5e7eb' : '#1e293b'
    },
    probabilityBadge: {
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    viewDetailsLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      fontWeight: 600,
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`
    },
    categoryBadge: (color) => ({
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '10px',
      fontSize: isSmall ? '0.75rem' : '0.8rem',
      fontWeight: 600,
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      marginRight: '8px',
      marginBottom: '8px'
    }),
    diseaseDescription: {
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.6,
      marginTop: '12px',
      marginBottom: '12px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out'
    },
    modalContent: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: isSmall ? '32px 24px' : '48px 40px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: isDarkMode
        ? '0 25px 60px rgba(0, 0, 0, 0.5)'
        : '0 25px 60px rgba(0, 0, 0, 0.2)',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 1)'}`,
      animation: 'scaleIn 0.3s ease-out',
      position: 'relative'
    },
    modalGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
      borderRadius: '24px 24px 0 0'
    },
    modalIconWrapper: {
      width: isSmall ? '64px' : '80px',
      height: isSmall ? '64px' : '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.15))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      animation: 'pulse 2s ease-in-out infinite'
    },
    modalTitle: {
      fontSize: isSmall ? '1.5rem' : '1.8rem',
      fontWeight: 800,
      color: isDarkMode ? '#f9fafb' : '#1e293b',
      marginBottom: '12px',
      textAlign: 'center',
      fontFamily: "'Merriweather', serif"
    },
    modalMessage: {
      fontSize: isSmall ? '0.95rem' : '1.05rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      textAlign: 'center',
      lineHeight: 1.6,
      marginBottom: '8px'
    },
    modalItemName: {
      fontSize: isSmall ? '1rem' : '1.1rem',
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      textAlign: 'center',
      marginBottom: '32px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      flexDirection: isSmall ? 'column-reverse' : 'row'
    },
    modalButton: (variant) => ({
      flex: 1,
      padding: isSmall ? '14px 24px' : '16px 32px',
      borderRadius: '12px',
      fontSize: isSmall ? '0.95rem' : '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Inter', sans-serif",
      ...(variant === 'danger' ? {
        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
      } : {
        background: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)',
        color: isDarkMode ? '#e5e7eb' : '#1e293b',
        border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 1)'}`
      })
    })
  };

  const loaderStyles = {
    overlay: {
      ...styles.pageWrapper,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    container: { textAlign: 'center' },
    spinner: {
      width: '56px',
      height: '56px',
      border: '4px solid transparent',
      borderTop: '4px solid var(--color-secondary)',
      borderRight: '4px solid var(--color-third)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    },
    text: {
      marginTop: '24px',
      fontSize: '1.2rem',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      fontWeight: 700,
      fontFamily: "'Merriweather', serif"
    }
  };

  if (loading || authLoading) {
    return (
      <div style={loaderStyles.overlay}>
        <div style={loaderStyles.container}>
          <div style={loaderStyles.spinner}></div>
          <p style={loaderStyles.text}>Loading your health history...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.backgroundPattern}></div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.badge}>HEALTH RECORDS</span>
          <h1 style={styles.title}>
            <span className="gradient-text">My Health History</span>
          </h1>
          <p style={styles.subtitle}>
            Track your saved diseases and assessment history with comprehensive insights
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard(0)}>
              <div style={styles.statGlow}></div>
              <div style={styles.statIconWrapper}>
                <Activity size={isSmall ? 24 : 28} />
              </div>
              <div style={styles.statLabel}>Total Assessments</div>
              <div style={styles.statValue}>{stats.totalAssessments || assessments.length}</div>
            </div>

            <div style={styles.statCard(1)}>
              <div style={styles.statGlow}></div>
              <div style={styles.statIconWrapper}>
                <BookmarkCheck size={isSmall ? 24 : 28} />
              </div>
              <div style={styles.statLabel}>Saved Diseases</div>
              <div style={styles.statValue}>{savedDiseases.length}</div>
            </div>

            <div style={styles.statCard(2)}>
              <div style={styles.statGlow}></div>
              <div style={styles.statIconWrapper}>
                <Calendar size={isSmall ? 24 : 28} />
              </div>
              <div style={styles.statLabel}>Last Assessment</div>
              <div style={{
                fontSize: isSmall ? '1rem' : '1.2rem',
                fontWeight: 700,
                color: isDarkMode ? '#f9fafb' : '#1e293b',
                fontFamily: "'Inter', sans-serif"
              }}>
                {stats.lastAssessment ? formatDate(stats.lastAssessment).split(',')[0] : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabsWrapper}>
          <div style={styles.tabs}>
            <button
              style={styles.tab(activeTab === 'assessments')}
              onClick={() => setActiveTab('assessments')}
              onMouseEnter={(e) => {
                if (activeTab !== 'assessments') {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'assessments') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Activity size={20} />
              Assessments ({assessments.length})
            </button>
            <button
              style={styles.tab(activeTab === 'diseases')}
              onClick={() => setActiveTab('diseases')}
              onMouseEnter={(e) => {
                if (activeTab !== 'diseases') {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'diseases') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <BookmarkCheck size={20} />
              Saved Diseases ({savedDiseases.length})
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div style={styles.contentSection}>
          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <>
              {assessments.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📋</div>
                  <h3 style={styles.emptyTitle}>No Assessments Yet</h3>
                  <p style={styles.emptyText}>
                    Complete a symptom assessment to see it here and track your health journey
                  </p>
                  <button
                    onClick={() => navigate('/symptom-checker')}
                    style={styles.emptyButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(13, 157, 184, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 157, 184, 0.3)';
                    }}
                  >
                    Start Assessment
                    <ChevronRight size={20} />
                  </button>
                </div>
              ) : (
                <div style={styles.grid}>
                  {assessments.map((assessment) => (
                    <div
                      key={assessment._id || assessment.id}
                      style={styles.card}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = isDarkMode
                          ? '0 20px 60px rgba(13, 157, 184, 0.3)'
                          : '0 20px 60px rgba(13, 157, 184, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = isDarkMode
                          ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                          : '0 10px 40px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      <div style={styles.cardGlow}></div>

                      <div style={styles.cardHeader}>
                        <div style={{ flex: 1 }}>
                          <h3 style={styles.cardTitle}>
                            {assessment.patientName || 'Anonymous'}
                          </h3>
                          <div style={styles.cardMeta}>
                            <Clock size={14} />
                            {formatDate(assessment.completedAt || assessment.createdAt)}
                          </div>
                          <div style={styles.cardMeta}>
                            Age: {assessment.age} | {assessment.sex === 'male' ? 'Male' : 'Female'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAssessment(assessment._id || assessment.id)}
                          style={styles.deleteBtn}
                          title="Delete assessment"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDarkMode
                              ? 'rgba(220, 38, 38, 0.1)'
                              : 'rgba(220, 38, 38, 0.05)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Triage Level */}
                      <div style={{ marginBottom: '12px' }}>
                        <span style={styles.triageBadge(getTriageColor(assessment.triageLevel))}>
                          <AlertCircle size={14} />
                          {getTriageLabel(assessment.triageLevel)}
                        </span>
                      </div>

                      {/* Symptoms */}
                      {assessment.symptoms && assessment.symptoms.length > 0 && (
                        <div style={styles.symptomChipsContainer}>
                          <div style={styles.chipLabel}>Symptoms:</div>
                          <div>
                            {assessment.symptoms.slice(0, 3).map((symptom, idx) => (
                              <span key={idx} style={styles.symptomChip}>
                                {symptom}
                              </span>
                            ))}
                            {assessment.symptoms.length > 3 && (
                              <span style={styles.symptomChip}>
                                +{assessment.symptoms.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Conditions */}
                      {assessment.conditions && assessment.conditions.length > 0 && (
                        <div style={styles.conditionsSection}>
                          <div style={styles.chipLabel}>Possible Conditions:</div>
                          {assessment.conditions.slice(0, 3).map((condition, idx) => (
                            <div key={idx} style={styles.conditionItem}>
                              <span>{condition.name}</span>
                              <span style={styles.probabilityBadge}>
                                {condition.probability}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Saved Diseases Tab */}
          {activeTab === 'diseases' && (
            <>
              {savedDiseases.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🏥</div>
                  <h3 style={styles.emptyTitle}>No Saved Diseases</h3>
                  <p style={styles.emptyText}>
                    Browse diseases and save them for quick reference and easy access
                  </p>
                  <button
                    onClick={() => navigate('/diseases')}
                    style={styles.emptyButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(13, 157, 184, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 157, 184, 0.3)';
                    }}
                  >
                    Browse Diseases
                    <ChevronRight size={20} />
                  </button>
                </div>
              ) : (
                <div style={styles.grid}>
                  {savedDiseases.map((disease) => (
                    <div
                      key={disease._id || disease.id}
                      style={styles.card}
                      onClick={() => navigate(`/diseases/${disease.diseaseSlug || disease.slug}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = isDarkMode
                          ? '0 20px 60px rgba(13, 157, 184, 0.3)'
                          : '0 20px 60px rgba(13, 157, 184, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = isDarkMode
                          ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                          : '0 10px 40px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      <div style={styles.cardGlow}></div>

                      <div style={styles.cardHeader}>
                        <div style={{ flex: 1 }}>
                          <h3 style={styles.cardTitle}>
                            {disease.diseaseName || disease.name}
                          </h3>
                          <div style={styles.cardMeta}>
                            <Clock size={14} />
                            Saved {formatDate(disease.savedAt || disease.createdAt)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDisease(disease._id || disease.id);
                          }}
                          style={styles.deleteBtn}
                          title="Remove from saved"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDarkMode
                              ? 'rgba(220, 38, 38, 0.1)'
                              : 'rgba(220, 38, 38, 0.05)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <span style={styles.categoryBadge('#0d9db8')}>
                          {disease.category}
                        </span>
                        {disease.severity && (
                          <span style={styles.categoryBadge('#f59e0b')}>
                            {disease.severity}
                          </span>
                        )}
                      </div>

                      {disease.description && (
                        <p style={styles.diseaseDescription}>
                          {disease.description.substring(0, 120)}
                          {disease.description.length > 120 ? '...' : ''}
                        </p>
                      )}

                      <div style={styles.viewDetailsLink}>
                        View Full Details
                        <ExternalLink size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div style={styles.modalOverlay} onClick={cancelDelete}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalGlow}></div>

            <div style={styles.modalIconWrapper}>
              <AlertCircle size={isSmall ? 32 : 40} color="#dc2626" />
            </div>

            <h3 style={styles.modalTitle}>Confirm Deletion</h3>

            <p style={styles.modalMessage}>
              Are you sure you want to {deleteModal.type === 'disease' ? 'remove' : 'delete'}
            </p>
            <p style={styles.modalItemName}>
              "{deleteModal.name}"
            </p>
            <p style={{ ...styles.modalMessage, marginBottom: '32px', fontSize: isSmall ? '0.85rem' : '0.9rem' }}>
              {deleteModal.type === 'disease'
                ? 'This disease will be removed from your saved list.'
                : 'This assessment will be permanently deleted from your history.'}
            </p>

            <div style={styles.modalButtons}>
              <button
                onClick={cancelDelete}
                style={styles.modalButton('cancel')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode
                    ? 'rgba(148, 163, 184, 0.2)'
                    : 'rgba(203, 213, 225, 1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode
                    ? 'rgba(148, 163, 184, 0.1)'
                    : 'rgba(226, 232, 240, 1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={styles.modalButton('danger')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
              >
                {deleteModal.type === 'disease' ? 'Remove' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;