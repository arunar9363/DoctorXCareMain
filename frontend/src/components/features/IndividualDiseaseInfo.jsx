import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIfSaved as checkDiseaseIsSavedAPI, saveDisease as saveDiseaseAPI, removeSavedDisease as removeSavedDiseaseAPI } from '../../api/savedDiseaseApi.js';
import { getDiseaseBySlug as getDiseaseBySlugAPI, getAllDiseases as getAllDiseasesAPI } from '../../api/diseaseApi.js';

import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Shield,
  Heart,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Info,
  Stethoscope,
  Pill,
  BookmarkPlus,
  BookmarkCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

const IndividualDiseasesInfo = () => {
  const navigate = useNavigate();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [hoverStates, setHoverStates] = useState({});
  const [error, setError] = useState(null);

  const handleHover = (key, value) => setHoverStates(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const checkDarkMode = () => {
      const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(darkMode);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadDiseaseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get disease ID from URL parameters - supports both query params and route params
        const urlParams = new URLSearchParams(window.location.search);
        let diseaseId = urlParams.get('id');

        // Also check for disease ID in the path (for routes like /diseases/:id)
        if (!diseaseId) {
          const pathParts = window.location.pathname.split('/');
          const diseasesIndex = pathParts.indexOf('diseases');
          if (diseasesIndex !== -1 && pathParts[diseasesIndex + 1]) {
            diseaseId = pathParts[diseasesIndex + 1];
          }
        }

        let foundDisease = null;

        // Try by slug first (most common case from DiseaseSearch navigation)
        if (diseaseId) {
          try {
            const res = await getDiseaseBySlugAPI(diseaseId);
            foundDisease = res.data || res;
          } catch {
            // Slug not found — fallback to searching all diseases below
          }
        }

        // If slug lookup failed, load all diseases and find by id or slug locally
        if (!foundDisease) {
          const allRes = await getAllDiseasesAPI();
          const diseasesData = allRes.data || allRes || [];

          // Find by id
          foundDisease = diseasesData.find(d => d.id === diseaseId || d._id === diseaseId);

          // If not found by ID, try to find by slug (converted from name)
          if (!foundDisease && diseaseId) {
            // Convert slug back to name comparison
            foundDisease = diseasesData.find(d => {
              const diseaseSlug = d.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return diseaseSlug === diseaseId;
            });
          }

          if (foundDisease) {
            setDisease(foundDisease);
          } else if (diseaseId) {
            // If ID was provided but not found
            setError(`Disease with ID "${diseaseId}" not found`);
            setDisease(diseasesData[0]); // Fallback to first disease
          } else {
            // No ID provided, show first disease
            setDisease(diseasesData[0]);
          }
        } else {
          setDisease(foundDisease);
        }

        // Check if already saved in MongoDB
        if (diseaseId) {
          try {
            const savedRes = await checkDiseaseIsSavedAPI(diseaseId);
            setIsSaved(savedRes.isSaved || savedRes.data?.isSaved || false);
          } catch {
            // Not saved or check failed — default false is fine
          }
        }

      } catch (error) {
        console.error('Error loading disease data:', error);
        setError('Failed to load disease information. Please try again.');

        // Set a default disease if loading fails
        setDisease({
          id: "501",
          name: "Fever (Pyrexia)",
          description: "Fever is a temporary increase in body temperature, typically in response to an illness or infection.",
          symptoms: ["Elevated body temperature >100.4°F (38°C)", "Chills, headache, fatigue, body aches"],
          prevention: ["Prevent underlying infections through frequent handwashing"],
          treatment: ["Get plenty of rest to allow the body to recover"],
          category: "Common Ailment",
          image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=300&fit=crop",
          severity: "Mild to Moderate",
          duration: "1-3 days",
          contagious: true,
          when_to_consult_a_doctor: "Consult if fever >103°F (39.4°C), lasts >3 days.",
          common_tests_advised: "CBC, Urine Routine, Malaria Antigen.",
          symptoms_that_should_not_be_ignored: "Stiff neck, confusion, seizures, difficulty breathing.",
          dr_note: "Minor point: 37.5°C is usually considered low-grade fever."
        });
      } finally {
        setLoading(false);
      }
    };

    loadDiseaseData();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
    }

    // If it's already a full URL (starts with http:// or https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it starts with a slash, use as-is
    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    // Otherwise, add a leading slash
    return `/${imagePath}`;
  };

  const handleSaveDisease = async () => {
    if (!disease) return;
    setIsSaving(true);

    try {
      const slug = disease.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      if (isSaved) {
        // Remove from MongoDB saved diseases
        await removeSavedDiseaseAPI(slug);
        setIsSaved(false);
        showToast('Disease removed from saved list', 'info');
      } else {
        // Save to MongoDB saved diseases
        await saveDiseaseAPI({
          diseaseSlug: slug,
          diseaseName: disease.name,
          category: disease.category || '',
          description: disease.description || '',
          severity: disease.severity || '',
          image: disease.image || '',
        });
        setIsSaved(true);
        showToast('Disease saved successfully!', 'success');
      }
    } catch (err) {
      console.error('Save/remove disease error:', err);
      showToast('Failed to update saved diseases. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const themes = {
    light: {
      colorPrimary: '#ffffff', colorSecondary: '#0d9db8', colorThird: '#3b82f6', colorFourth: '#d1f4f9',
      colorDark: '#1a1a1a', colorSuccess: '#10b981', colorWarning: '#f59e0b', colorDanger: '#dc2626',
      borderColor: 'rgba(13, 157, 184, 0.1)', cardBg: 'rgba(13, 157, 184, 0.02)', textColorSecondary: '#6b7280',
    },
    dark: {
      colorPrimary: '#121212', colorSecondary: '#0d9db8', colorThird: '#60a5fa', colorFourth: '#1f2937',
      colorDark: '#e5e7eb', colorSuccess: '#10b981', colorWarning: '#f59e0b', colorDanger: '#dc2626',
      borderColor: '#374151', cardBg: 'rgba(13, 157, 184, 0.05)', textColorSecondary: '#9ca3af',
    }
  };
  const t = themes[isDarkMode ? 'dark' : 'light'];

  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isSmall = useMediaQuery('(max-width: 360px)');

  const m = (...styles) => Object.assign({}, ...styles.filter(Boolean));

  const s = {
    container: {
      background: isDarkMode ? 'linear-gradient(135deg, #1f2937 0%, #0f172a 50%, #121212 100%)' : t.colorFourth,
      minHeight: '100vh', color: isDarkMode ? '#e5e7eb' : t.colorDark,
      padding: isMobile ? '8px' : isTablet ? '16px' : '32px 16px',
      transition: 'background 0.3s ease, color 0.3s ease',
      marginTop: isMobile ? '64px' : '64px'
    },
    max: { maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: isMobile ? '12px' : '24px' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' },
    backBtn: (h) => m({
      display: 'flex', alignItems: 'center', gap: '6px',
      background: isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(115, 142, 239, 0.368)',
      color: isDarkMode ? t.colorSecondary : t.colorThird,
      border: `1px solid ${isDarkMode ? t.colorSecondary : t.colorDark}`,
      padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: '8px', fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.3s ease', fontSize: isMobile ? '0.8rem' : '0.85rem',
    }, h && { background: isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(255, 255, 255, 0.3)', transform: 'translateY(-2px)' }),
    saveBtn: (h) => m({
      display: 'flex', alignItems: 'center', gap: '6px',
      background: isSaved ? 'rgba(16, 185, 129, 0.2)' : isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(115, 142, 239, 0.368)',
      border: `1px solid ${isSaved ? '#10b981' : isDarkMode ? t.colorSecondary : t.colorDark}`,
      color: isSaved ? '#10b981' : isDarkMode ? t.colorSecondary : t.colorThird,
      padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: '8px', fontWeight: 600,
      cursor: isSaving ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
      opacity: isSaving ? 0.6 : 1, fontSize: isMobile ? '0.8rem' : '0.85rem',
    }, h && !isSaving && { background: isSaved ? 'rgba(16, 185, 129, 0.3)' : isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(255, 255, 255, 0.3)', transform: 'translateY(-2px)' }),
    dHeader: { display: 'flex', gap: isMobile ? '12px' : '24px', alignItems: 'flex-start', flexDirection: isTablet ? 'column' : 'row' },
    img: {
      width: isSmall ? '100%' : isMobile ? '100%' : isTablet ? '180px' : '250px',
      height: isSmall ? '160px' : isMobile ? '180px' : isTablet ? '120px' : '180px',
      objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
    },
    info: { flex: 1 },
    title: {
      fontSize: isSmall ? '1.3rem' : isMobile ? '1.5rem' : isTablet ? '1.8rem' : '2.2rem',
      fontWeight: 600, color: isDarkMode ? t.colorSecondary : t.colorSecondary,
      marginBottom: isMobile ? '6px' : '10px', lineHeight: 1.2
    },
    sub: {
      fontSize: isMobile ? '0.85rem' : '0.95rem', opacity: 0.9,
      marginBottom: isMobile ? '10px' : '14px', lineHeight: 1.4
    },
    stats: { display: 'flex', gap: isMobile ? '6px' : '12px', flexWrap: 'wrap' },
    stat: {
      display: 'flex', alignItems: 'center', gap: '4px',
      background: isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(13, 157, 184, 0.1)',
      padding: isMobile ? '4px 8px' : '6px 12px', borderRadius: '6px',
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`
    },
    main: {
      background: t.colorPrimary, borderRadius: '10px', overflow: 'hidden',
      boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${t.borderColor}`, marginTop: isMobile ? '12px' : '20px'
    },
    tabs: {
      display: 'flex',
      background: isDarkMode ? 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)' : t.colorFourth,
      borderBottom: `1px solid ${t.borderColor}`, overflowX: 'auto'
    },
    tab: (a, h) => m({
      flex: isMobile ? 'none' : 1, minWidth: isMobile ? 'auto' : 'auto',
      background: 'none', border: 'none',
      padding: isSmall ? '8px 6px' : isMobile ? '10px 10px' : '14px 14px',
      color: isDarkMode ? '#e5e7eb' : t.colorDark, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
      position: 'relative', fontSize: isSmall ? '0.7rem' : isMobile ? '0.75rem' : '0.85rem',
      whiteSpace: 'nowrap'
    }, h && { background: isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(13, 157, 184, 0.1)', color: isDarkMode ? '#0d9db8' : t.colorSecondary },
      a && { background: t.colorPrimary, color: isDarkMode ? '#0d9db8' : t.colorSecondary, boxShadow: isDarkMode ? '0 -2px 6px rgba(0, 0, 0, 0.3)' : '0 -2px 6px rgba(0, 0, 0, 0.1)' }),
    content: { padding: isSmall ? '10px' : isMobile ? '12px' : isTablet ? '16px' : '24px' },
    heading: {
      display: 'flex', alignItems: 'center', gap: '6px',
      margin: '0 0 12px 0', fontSize: isMobile ? '1rem' : '1.2rem',
      color: isDarkMode ? t.colorSecondary : t.colorSecondary, fontWeight: 700
    },
    card: {
      background: isDarkMode ? 'rgba(13, 157, 184, 0.1)' : t.cardBg,
      padding: isMobile ? '10px' : '16px', borderRadius: '8px',
      marginBottom: isMobile ? '10px' : '16px', border: `1px solid ${t.borderColor}`
    },
    cardTitle: {
      display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 700,
      color: isDarkMode ? t.colorSecondary : t.colorSecondary, marginBottom: '6px'
    },
    cardText: {
      fontSize: isMobile ? '0.8rem' : '0.9rem', lineHeight: 1.5,
      color: isDarkMode ? '#e5e7eb' : t.colorDark
    },
    item: (h) => m({
      display: 'flex', alignItems: 'flex-start', gap: isMobile ? '6px' : '10px',
      padding: isMobile ? '6px' : '10px',
      background: isDarkMode ? 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)' : t.colorFourth,
      borderRadius: '6px', marginBottom: isMobile ? '6px' : '10px',
      border: `1px solid ${t.borderColor}`, transition: 'all 0.3s ease',
      fontSize: isMobile ? '0.8rem' : '0.9rem'
    }, h && { background: isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(13, 157, 184, 0.1)', transform: 'translateX(4px)' }),
    icon: { color: t.colorSuccess, flexShrink: 0, marginTop: '2px' },
    errorBanner: {
      background: isDarkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)',
      border: `1px solid ${t.colorDanger}`,
      padding: isMobile ? '10px' : '14px',
      borderRadius: '8px',
      marginBottom: isMobile ? '12px' : '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: isDarkMode ? '#fca5a5' : t.colorDanger
    },
    toast: (show, type) => {
      const base = {
        display: show ? 'flex' : 'none', alignItems: 'center', gap: '10px',
        padding: isMobile ? '10px 14px' : '14px 20px', borderRadius: '10px',
        boxShadow: isDarkMode ? '0 6px 24px rgba(0, 0, 0, 0.5)' : '0 6px 24px rgba(0, 0, 0, 0.15)',
        fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 600,
        position: 'fixed', top: isMobile ? '12px' : '70px',
        right: isMobile ? '8px' : '16px', zIndex: 10000,
        minWidth: isMobile ? '180px' : '250px',
        maxWidth: isMobile ? 'calc(100vw - 16px)' : '380px'
      };
      const types = {
        success: { background: isDarkMode ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' },
        error: { background: isDarkMode ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' },
        info: { background: isDarkMode ? 'linear-gradient(135deg, #0d9db8 0%, #0284c7 100%)' : 'linear-gradient(135deg, #0d9db8 0%, #0ea5e9 100%)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }
      };
      return Object.assign({}, base, types[type] || {});
    },
  };

  const renderTab = () => {
    if (!disease) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h3 style={s.heading}><Info size={18} /> About {disease.name}</h3>
            <p style={s.cardText}>{disease.description}</p>

            {disease.when_to_consult_a_doctor && (
              <div style={s.card}>
                <div style={s.cardTitle}><AlertTriangle size={16} />When to Consult</div>
                <p style={s.cardText}>{disease.when_to_consult_a_doctor}</p>
              </div>
            )}

            {disease.common_tests_advised && (
              <div style={s.card}>
                <div style={s.cardTitle}><FileText size={16} />Common Tests</div>
                <p style={s.cardText}>{disease.common_tests_advised}</p>
              </div>
            )}

            {disease.symptoms_that_should_not_be_ignored && (
              <div style={m(s.card, { borderLeft: `3px solid ${t.colorDanger}` })}>
                <div style={m(s.cardTitle, { color: t.colorDanger })}><AlertCircle size={16} />Critical Symptoms</div>
                <p style={s.cardText}>{disease.symptoms_that_should_not_be_ignored}</p>
              </div>
            )}

            {disease.dr_note && (
              <div style={m(s.card, { background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' })}>
                <div style={m(s.cardTitle, { color: t.colorThird })}><Info size={16} />Doctor's Note</div>
                <p style={s.cardText}>{disease.dr_note}</p>
              </div>
            )}

            {disease['Verification Status'] && (
              <div style={m(s.card, {
                background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                borderLeft: `3px solid ${t.colorSuccess}`
              })}>
                <div style={m(s.cardTitle, { color: t.colorSuccess })}>
                  <CheckCircle size={16} />
                  Medical Verification
                </div>
                <div style={s.cardText}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Status: </strong>
                    <span style={{
                      color: disease['Verification Status'] === 'Verified' ? t.colorSuccess : t.colorWarning,
                      fontWeight: 600
                    }}>
                      {disease['Verification Status']}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: isMobile ? '0.75rem' : '0.85rem', opacity: 0.9 }}>
                    This information has been reviewed and verified by DoctorXcare's medical experts to ensure accuracy and reliability.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'symptoms':
        return (
          <div>
            <h3 style={s.heading}><Stethoscope size={18} /> Symptoms</h3>
            {disease.symptoms?.length > 0 ? disease.symptoms.map((symptom, i) => (
              <div key={i} style={s.item(hoverStates[`s${i}`])}
                onMouseEnter={() => handleHover(`s${i}`, true)}
                onMouseLeave={() => handleHover(`s${i}`, false)}>
                <CheckCircle size={14} style={s.icon} />
                <span>{symptom}</span>
              </div>
            )) : <p style={s.cardText}>No symptoms information available.</p>}
          </div>
        );

      case 'treatment':
        return (
          <div>
            <h3 style={s.heading}><Pill size={18} /> Treatment</h3>
            {disease.treatment?.length > 0 ? disease.treatment.map((treat, i) => (
              <div key={i} style={s.item(hoverStates[`t${i}`])}
                onMouseEnter={() => handleHover(`t${i}`, true)}
                onMouseLeave={() => handleHover(`t${i}`, false)}>
                <Pill size={14} style={s.icon} />
                <span>{treat}</span>
              </div>
            )) : <p style={s.cardText}>No treatment information available.</p>}
          </div>
        );

      case 'prevention':
        return (
          <div>
            <h3 style={s.heading}><Shield size={18} /> Prevention</h3>
            {disease.prevention?.length > 0 ? disease.prevention.map((prev, i) => (
              <div key={i} style={s.item(hoverStates[`p${i}`])}
                onMouseEnter={() => handleHover(`p${i}`, true)}
                onMouseLeave={() => handleHover(`p${i}`, false)}>
                <Shield size={14} style={s.icon} />
                <span>{prev}</span>
              </div>
            )) : <p style={s.cardText}>No prevention information available.</p>}
          </div>
        );

      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.max}>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: t.colorSecondary }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
            <div>Loading disease information...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!disease) {
    return (
      <div style={s.container}>
        <div style={s.max}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <AlertCircle size={48} style={{ color: t.colorDanger, marginBottom: '16px' }} />
            <h2>Disease Not Found</h2>
            <p>The requested disease information could not be found.</p>
            <button style={s.backBtn(false)} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {toast.show && (
        <div style={s.toast(toast.show, toast.type)}>
          <div style={{ flexShrink: 0 }}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          <div style={{ flex: 1, lineHeight: 1.3 }}>{toast.message}</div>
        </div>
      )}

      <div style={s.max}>
        {error && (
          <div style={s.errorBanner}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <header style={s.header}>
          <div style={s.headerTop}>
            <button style={s.backBtn(hoverStates.back)}
              onMouseEnter={() => handleHover('back', true)}
              onMouseLeave={() => handleHover('back', false)}
              onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              {!isSmall && <span>Back</span>}
            </button>

            <button style={s.saveBtn(hoverStates.save)}
              onMouseEnter={() => handleHover('save', true)}
              onMouseLeave={() => handleHover('save', false)}
              onClick={handleSaveDisease} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{isSaved ? 'Removing' : 'Saving'}</span>
                </>
              ) : isSaved ? (
                <>
                  <BookmarkCheck size={14} />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <BookmarkPlus size={14} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>

          <div style={s.dHeader}>
            <img
              src={getImageUrl(disease.image)}
              alt={disease.name}
              style={s.img}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop';
              }}
            />
            <div style={s.info}>
              <h1 style={s.title}>{disease.name}</h1>
              {disease['Verification Status'] && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: isMobile ? '4px 10px' : '6px 12px',
                  background: disease['Verification Status'] === 'Verified'
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                  fontWeight: 600,
                  marginBottom: isMobile ? '8px' : '10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}>
                  <CheckCircle size={isMobile ? 12 : 14} />
                  <span>{disease['Verification Status']}</span>
                </div>
              )}
              <p style={s.sub}>{disease.description}</p>
              <div style={s.stats}>
                {disease.severity && <div style={s.stat}><Heart size={14} style={{ color: t.colorSecondary }} /><span>Severity: {disease.severity}</span></div>}
                {disease.duration && <div style={s.stat}><Clock size={14} style={{ color: t.colorSecondary }} /><span>Duration: {disease.duration}</span></div>}
                {typeof disease.contagious !== 'undefined' && <div style={s.stat}><Users size={14} style={{ color: t.colorSecondary }} /><span>Contagious: {disease.contagious ? 'Yes' : 'No'}</span></div>}
                {disease.affectedPopulation && <div style={s.stat}><Users size={14} style={{ color: t.colorSecondary }} /><span>Affects: {disease.affectedPopulation}</span></div>}
                {disease.geographicSpread && <div style={s.stat}><MapPin size={14} style={{ color: t.colorSecondary }} /><span>Spread: {disease.geographicSpread}</span></div>}
                {disease.onsetPeriod && <div style={s.stat}><Clock size={14} style={{ color: t.colorSecondary }} /><span>Onset: {disease.onsetPeriod}</span></div>}
              </div>
            </div>
          </div>
        </header>

        <main style={s.main}>
          <nav style={s.tabs}>
            {['overview', 'symptoms', 'treatment', 'prevention'].map((tab, i) => (
              <button key={tab} style={s.tab(activeTab === tab, hoverStates[`tab${i}`])}
                onClick={() => setActiveTab(tab)}
                onMouseEnter={() => handleHover(`tab${i}`, true)}
                onMouseLeave={() => handleHover(`tab${i}`, false)}>
                {{
                  overview: <Info size={14} />,
                  symptoms: <Stethoscope size={14} />,
                  treatment: <Pill size={14} />,
                  prevention: <Shield size={14} />
                }[tab]}
                {!isSmall && <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>}
              </button>
            ))}
          </nav>
          <div style={s.content}>{renderTab()}</div>
        </main>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default IndividualDiseasesInfo;