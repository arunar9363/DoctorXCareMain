import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  Calendar,
  Globe,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Bell,
  Activity,
  Shield,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { whoApiService } from "../../hooks/useWHOApi.js";
import { getAllDiseases as getAllDiseasesAPI, searchDiseases as searchDiseasesAPI } from "../../api/diseaseApi.js";

// Helper hook for responsive design using media queries in JS
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

const DiseaseSearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // State management for theme and interactive styles
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });
  const [interactionStates, setInteractionStates] = useState({});

  // Scroll state for navigation buttons
  const [scrollContainerRef, setScrollContainerRef] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // WHO Updates State — replaces useWHONews and useWHOOutbreaks hooks
  const [whoUpdates, setWhoUpdates] = useState([]);
  const [whoLoading, setWhoLoading] = useState(false);
  const [whoError, setWhoError] = useState(null);
  const [newOutbreaks, setNewOutbreaks] = useState([]);
  const [hasNewOutbreaks, setHasNewOutbreaks] = useState(false);

  // Page loader timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(darkMode);
    };

    checkDarkMode();

    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    const handleStorageChange = () => {
      checkDarkMode();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleInteraction = (key, type, value) => {
    setInteractionStates(prev => ({ ...prev, [key]: { ...prev[key], [type]: value } }));
  };

  // WHO News fetch — replaces useWHONews hook
  const fetchWHONews = useCallback(async () => {
    setWhoLoading(true);
    setWhoError(null);
    try {
      const updates = await whoApiService.fetchNews({
        limit: 8,
        feedTypes: ['news', 'diseaseOutbreaks']
      });
      setWhoUpdates(updates || []);
    } catch (err) {
      setWhoError('Failed to load WHO updates');
      console.error('WHO news fetch error:', err);
    } finally {
      setWhoLoading(false);
    }
  }, []);

  // WHO Outbreaks fetch — replaces useWHOOutbreaks hook
  const fetchWHOOutbreaks = useCallback(async () => {
    try {
      const outbreaks = await whoApiService.getDiseaseOutbreaks(5);
      if (outbreaks && outbreaks.length > 0) {
        setNewOutbreaks(outbreaks);
        setHasNewOutbreaks(true);
      }
    } catch (err) {
      console.error('WHO outbreaks fetch error:', err);
    }
  }, []);

  // Clear new outbreaks alert — replaces clearNewOutbreaks from hook
  const clearNewOutbreaks = useCallback(() => {
    setHasNewOutbreaks(false);
    setNewOutbreaks([]);
  }, []);

  // Refresh WHO updates — replaces refresh from hook
  const refreshWHOUpdates = useCallback(() => {
    fetchWHONews();
  }, [fetchWHONews]);

  // Load WHO data on mount and auto-refresh every 5 minutes
  useEffect(() => {
    fetchWHONews();
    fetchWHOOutbreaks();

    const newsInterval = setInterval(fetchWHONews, 300000);   // 5 minutes
    const outbreakInterval = setInterval(fetchWHOOutbreaks, 600000); // 10 minutes

    return () => {
      clearInterval(newsInterval);
      clearInterval(outbreakInterval);
    };
  }, [fetchWHONews, fetchWHOOutbreaks]);

  const createSlug = useCallback((name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }, []);

  // Fetch disease data
  useEffect(() => {
    const loadDiseases = async () => {
      try {
        setLoading(true);
        setError(null);
        let diseasesData = [];
        try {
          // Replaced: fetch('/data/diseases.json') → MongoDB backend API
          const res = await getAllDiseasesAPI();
          diseasesData = res.data || res || [];
          // eslint-disable-next-line no-unused-vars
        } catch (fetchError) {
          diseasesData = [];
        }
        setDiseases(diseasesData);
        setFilteredDiseases(diseasesData);
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setError('Failed to load diseases data');
      } finally {
        setLoading(false);
      }
    };
    loadDiseases();
  }, []);

  // Enhanced search logic
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() && selectedKeywords.length === 0) {
        setFilteredDiseases(diseases);
        return;
      }

      const query = searchQuery.toLowerCase();

      // Local filter on already-loaded diseases (instant, no lag)
      const localFiltered = diseases.filter(disease => {
        const nameMatch = disease.name.toLowerCase().includes(query);
        const symptomMatch = disease.symptoms?.some(symptom =>
          symptom.toLowerCase().includes(query)
        );
        const otherMatch = query ?
          `${disease.description} ${disease.prevention?.join(' ')} ${disease.treatment?.join(' ')}`
            .toLowerCase().includes(query) : true;
        const keywordMatch = selectedKeywords.length > 0 ?
          selectedKeywords.every(kw => {
            const kwLower = kw.toLowerCase();
            return disease.name.toLowerCase().includes(kwLower) ||
              disease.symptoms?.some(symptom => symptom.toLowerCase().includes(kwLower)) ||
              `${disease.description} ${disease.prevention?.join(' ')} ${disease.treatment?.join(' ')}`
                .toLowerCase().includes(kwLower);
          }) : true;

        return (nameMatch || symptomMatch || (query ? otherMatch : true)) && keywordMatch;
      });

      localFiltered.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(query);
        const bNameMatch = b.name.toLowerCase().includes(query);
        const aSymptomMatch = a.symptoms?.some(symptom => symptom.toLowerCase().includes(query));
        const bSymptomMatch = b.symptoms?.some(symptom => symptom.toLowerCase().includes(query));

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        if (aSymptomMatch && !bSymptomMatch) return -1;
        if (!aSymptomMatch && bSymptomMatch) return 1;
        return 0;
      });

      // Show local results immediately for instant feedback
      setFilteredDiseases(localFiltered);

      // Also call backend search API if query present — merges any extra results from MongoDB
      if (searchQuery.trim()) {
        try {
          const res = await searchDiseasesAPI(searchQuery.trim());
          const backendResults = res.data || res || [];
          if (backendResults.length > 0) {
            // Merge: backend results first, then local-only results not already in backend response
            const backendIds = new Set(backendResults.map(d => d._id || d.id));
            const localOnly = localFiltered.filter(d => !backendIds.has(d._id || d.id));
            setFilteredDiseases([...backendResults, ...localOnly]);
          }
        } catch {
          // Backend search failed — local results already shown, no disruption to user
        }
      }
    };
    performSearch();
  }, [searchQuery, selectedKeywords, diseases]);

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    if (scrollContainerRef) {
      updateScrollButtons();
      scrollContainerRef.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        scrollContainerRef.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [scrollContainerRef, updateScrollButtons]);

  const scrollContainer = (direction) => {
    if (scrollContainerRef) {
      const scrollAmount = 360;
      const newScrollLeft = scrollContainerRef.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = (e) => e.preventDefault();
  const addKeyword = (keyword) => {
    if (keyword && !selectedKeywords.includes(keyword)) setSelectedKeywords([...selectedKeywords, keyword]);
  };
  const removeKeyword = (keyword) => setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      addKeyword(keywordInput.trim());
      setKeywordInput('');
    }
  };

  const handleViewDetails = (disease) => {
    navigate(`/diseases/${createSlug(disease.name)}?id=${disease.id}`);
  };

  const handleUpdateClick = (update) => { if (update?.url) window.open(update.url, '_blank', 'noopener,noreferrer'); };
  const handleViewAllUpdates = () => window.open('https://www.who.int/news', '_blank', 'noopener,noreferrer');
  const getIconComponent = (iconName, size = 20) => {
    const components = { AlertCircle, TrendingUp, Globe, Calendar, Shield, Activity };
    const IconComponent = components[iconName] || Activity;
    return <IconComponent size={size} />;
  };
  const getCategoryIcon = (category) => getIconComponent({ 'emergency alert': 'AlertCircle', 'health data': 'TrendingUp', 'guidelines': 'Shield' }[category?.toLowerCase()]);

  // Updated theme colors
  const themes = {
    light: {
      colorPrimary: '#ffffff',
      colorSecondary: '#0d9db8',
      colorThird: '#3b82f6',
      colorFourth: '#d1f4f9',
      colorDark: '#1a1a1a',
      borderColor: '#e5e7eb',
      cardDescColor: '#6b7280',
      dateColor: '#6b7280',
      noResultsColor: '#6b7280',
      symptomBg: 'rgba(13, 157, 184, 0.05)',
      symptomBorder: '#0d9db8',
      scrollbarTrack: '#f1f5f9',
    },
    dark: {
      colorPrimary: '#121212',
      colorSecondary: '#0d9db8',
      colorThird: '#60a5fa',
      colorFourth: '#1f2937',
      colorDark: '#e5e7eb',
      borderColor: '#374151',
      cardDescColor: '#9ca3af',
      dateColor: '#9ca3af',
      noResultsColor: '#9ca3af',
      symptomBg: 'rgba(13, 157, 184, 0.1)',
      symptomBorder: '#d1d5db',
      scrollbarTrack: '#374151',
    }
  };
  const currentTheme = themes[isDarkMode ? 'dark' : 'light'];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInFromLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }
      .animate-spin { animation: spin 1s linear infinite; @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } }
      .fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      .slide-in-left {
        animation: slideInFromLeft 0.5s ease-out forwards;
      }
      .scale-in {
        animation: scaleIn 0.4s ease-out forwards;
      }
    `;
    document.head.appendChild(styleTag);
    return () => { document.head.removeChild(styleTag); };
  }, [isDarkMode]);

  const isMediumScreen = useMediaQuery('(max-width: 1024px)');
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const isMobile = useMediaQuery('(max-width: 480px)');
  const mergeStyles = (...objs) => Object.assign({}, ...objs.filter(Boolean));

  const getInteractionStyles = (key) => interactionStates[key] || {};

  // Page Loader Styles
  const pageLoaderOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: isDarkMode ? '#000' : '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  };

  const loaderContainerStyle = {
    textAlign: 'center'
  };

  const loaderStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'inline-block',
    borderTop: '4px solid var(--color-secondary)',
    borderRight: '4px solid transparent',
    borderBottom: '4px solid transparent',
    borderLeft: '4px solid transparent',
    boxSizing: 'border-box',
    animation: 'rotation 1s linear infinite',
    position: 'relative'
  };

  const loaderAfterStyle = {
    content: "''",
    boxSizing: 'border-box',
    position: 'absolute',
    left: '0',
    top: '0',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    borderLeft: '4px solid var(--color-third)',
    borderBottom: '4px solid transparent',
    borderTop: '4px solid transparent',
    borderRight: '4px solid transparent',
    animation: 'rotation 0.5s linear infinite reverse'
  };

  const loaderTextStyle = {
    marginTop: '20px',
    fontSize: '1.2rem',
    color: 'var(--color-secondary)',
    fontWeight: '600',
    fontFamily: "'Merriweather', serif"
  };

  const styles = {
    diseaseSearchPage: {
      backgroundColor: currentTheme.colorFourth,
      minHeight: '100vh',
      color: currentTheme.colorDark,
      lineHeight: 1.6,
      background: isDarkMode
        ? 'linear-gradient(135deg, var(--color-fourth) 0%, #0f172a 50%, var(--color-primary) 100%)'
        : `linear-gradient(120deg, ${currentTheme.colorPrimary} 0%, ${currentTheme.colorFourth} 100%)`,
      transition: 'background 0.4s ease-in-out',
      paddingTop: '30px'
    },
    container: mergeStyles({ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }, isSmallScreen && { padding: '0 16px' }),
    pageHeader: mergeStyles({
      color: currentTheme.colorSecondary,
      padding: '60px 0',
      textAlign: 'center',
      marginTop: '20px',
      marginBottom: 0,
      animation: 'fadeInUp 0.8s ease-out'
    }, isMobile && { padding: '40px 0' }),
    pageTitle: mergeStyles({
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '16px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: "'Merriweather', serif",
      animation: 'slideInFromLeft 0.6s ease-out'
    }, isSmallScreen && { fontSize: '2rem' }, isMobile && { fontSize: '1.75rem' }),
    pageSubtitle: mergeStyles({
      fontSize: '1.1rem',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: 1.5,
      color: currentTheme.colorDark,
      animation: 'fadeInUp 0.8s ease-out 0.2s backwards'
    }, isSmallScreen && { fontSize: '1rem' }),
    mainContent: { marginBottom: '60px' },
    contentWrapper: { display: 'flex', flexDirection: 'column', gap: '40px' },
    searchSection: mergeStyles({
      padding: '40px',
      marginBottom: '20px',
      borderRadius: '16px',
      border: `1px solid ${currentTheme.borderColor}`,
      backgroundColor: currentTheme.colorPrimary,
      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      animation: 'scaleIn 0.5s ease-out 0.3s backwards'
    }, isSmallScreen && { padding: '24px 20px', borderRadius: '12px' }, isMobile && { padding: '20px 16px', borderRadius: '12px', marginBottom: '16px' }),
    searchForm: { display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' },
    searchContainer: mergeStyles({ display: 'flex', gap: '12px', alignItems: 'stretch' }, isSmallScreen && { flexDirection: 'column', gap: '12px' }),
    searchInputWrapper: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '16px', color: currentTheme.colorSecondary, zIndex: 1 },
    searchInput: (isFocused) => mergeStyles({
      width: '100%',
      padding: '16px 16px 16px 48px',
      border: `2px solid ${currentTheme.borderColor}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: currentTheme.colorPrimary,
      color: currentTheme.colorDark,
      transition: 'all 0.3s ease',
      outline: 'none'
    }, isFocused && { borderColor: currentTheme.colorSecondary, boxShadow: '0 0 0 3px rgba(13, 157, 184, 0.1)', transform: 'translateY(-1px)' }, isMobile && { padding: '14px 14px 14px 44px', fontSize: '0.95rem', borderRadius: '10px' }),
    searchButton: (state) => mergeStyles({
      padding: '16px 32px',
      background: `linear-gradient(135deg, ${currentTheme.colorSecondary} 0%, ${currentTheme.colorThird} 100%)`,
      color: currentTheme.colorPrimary,
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      outlineOffset: '2px'
    }, state.isHovered && { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(13, 157, 184, 0.3)' }, state.isActive && { transform: 'translateY(0)' }, isSmallScreen && { width: '100%', padding: '14px 24px', fontSize: '0.95rem', borderRadius: '10px' }),
    keywordsSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
    keywordInput: (isFocused) => mergeStyles({
      padding: '12px 16px',
      border: `1px solid ${currentTheme.borderColor}`,
      borderRadius: '8px',
      fontSize: '0.9rem',
      background: currentTheme.colorPrimary,
      color: currentTheme.colorDark,
      transition: 'all 0.3s ease',
      outline: 'none'
    }, isFocused && { borderColor: currentTheme.colorSecondary, transform: 'translateY(-1px)' }, isMobile && { fontSize: '0.85rem', borderRadius: '8px' }),
    keywordsList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    keywordTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: isDarkMode ? 'rgba(13,157,184,0.1)' : currentTheme.colorFourth,
      color: currentTheme.colorSecondary,
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: 500,
      border: `1px solid ${isDarkMode ? 'rgba(13,157,184,0.3)' : 'rgba(13,157,184,0.2)'}`,
      animation: 'scaleIn 0.3s ease-out'
    },
    keywordRemove: (isHovered) => mergeStyles({
      background: 'none',
      border: 'none',
      color: currentTheme.colorSecondary,
      cursor: 'pointer',
      fontSize: '1.2rem',
      lineHeight: 1,
      padding: 0,
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'all 0.2s ease'
    }, isHovered && { background: 'rgba(13, 157, 184, 0.2)', transform: 'rotate(90deg)' }),
    mainSection: { width: '100%', marginBottom: '40px', backgroundColor: `${currentTheme.colorPrimary} !important` },
    diseasesSection: {
      marginBottom: '40px',
      position: 'relative'
    },
    sectionTitle: {
      position: 'relative',
      fontSize: '1.75rem',
      fontWeight: 700,
      color: currentTheme.colorDark,
      marginBottom: '24px',
      paddingBottom: '8px',
      fontFamily: "'Merriweather', serif",
      animation: 'slideInFromLeft 0.6s ease-out'
    },
    sectionTitleAfter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '60px',
      height: '3px',
      background: `linear-gradient(90deg, ${currentTheme.colorSecondary}, ${currentTheme.colorThird})`,
      borderRadius: '2px',
      animation: 'slideInFromLeft 0.6s ease-out 0.2s backwards'
    },
    resultCount: { fontSize: '1rem', color: currentTheme.cardDescColor, fontWeight: 400 },
    scrollButtonsContainer: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
      marginBottom: '12px'
    },
    scrollButton: (isHovered, disabled) => mergeStyles({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: disabled
        ? (isDarkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(209, 213, 219, 0.5)')
        : `linear-gradient(135deg, ${currentTheme.colorSecondary} 0%, ${currentTheme.colorThird} 100%)`,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      opacity: disabled ? 0.5 : 1,
      boxShadow: disabled ? 'none' : (isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(13, 157, 184, 0.2)')
    }, isHovered && !disabled && {
      transform: 'scale(1.1)',
      boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(13, 157, 184, 0.3)'
    }),
    diseasesHorizontalScroll: {
      display: 'flex',
      gap: isMobile ? '12px' : '16px',
      overflowX: 'auto',
      padding: '20px 0',
      scrollBehavior: 'smooth',
      scrollbarWidth: 'thin',
      scrollbarColor: `${currentTheme.colorSecondary} ${currentTheme.scrollbarTrack}`
    },
    diseaseCard: (isHovered, index) => mergeStyles({
      background: currentTheme.colorPrimary,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid ${isDarkMode ? currentTheme.borderColor : 'rgba(13,157,184,0.1)'}`,
      minWidth: '340px',
      maxWidth: '340px',
      minHeight: '490px',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      willChange: 'transform, box-shadow',
      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`
    }, isHovered && {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: isDarkMode ? '0 12px 40px rgba(0, 0, 0, 0.5)' : '0 12px 40px rgba(13, 157, 184, 0.2)',
      borderColor: currentTheme.colorSecondary
    }, isMediumScreen && { minWidth: '320px', maxWidth: '320px', minHeight: '470px' }, isSmallScreen && { minWidth: '300px', maxWidth: '300px', minHeight: '450px' }, isMobile && { minWidth: '280px', maxWidth: '280px', minHeight: '420px' }),
    cardImage: (isHovered) => ({
      position: 'relative',
      height: isMobile ? '140px' : isSmallScreen ? '160px' : '180px',
      overflow: 'hidden',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    cardImageImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease'
    },
    cardCategory: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: currentTheme.colorSecondary,
      color: currentTheme.colorPrimary,
      padding: isMobile ? '2px 6px' : '3px 8px',
      borderRadius: '10px',
      fontSize: isMobile ? '0.6rem' : '0.7rem',
      fontWeight: 600,
      animation: 'scaleIn 0.4s ease-out 0.3s backwards'
    },
    cardContent: mergeStyles({
      padding: isMobile ? '14px' : '18px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }),
    cardTitle: {
      fontSize: isMobile ? '1rem' : isSmallScreen ? '1.1rem' : '1.25rem',
      fontWeight: 700,
      color: currentTheme.colorDark,
      marginBottom: '8px',
      lineHeight: 1.2,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      lineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      transition: 'color 0.3s ease'
    },
    cardDescription: {
      color: currentTheme.cardDescColor,
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      lineHeight: 1.4,
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: isMobile ? 3 : 4,
      lineClamp: isMobile ? 3 : 4,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      flex: 1
    },
    symptomsPreview: {
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      color: isDarkMode ? '#d1d5db' : '#4a5568',
      marginBottom: '12px',
      padding: isMobile ? '6px 8px' : '8px 10px',
      background: currentTheme.symptomBg,
      borderRadius: '6px',
      borderLeft: `3px solid ${currentTheme.symptomBorder}`,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      lineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    viewDetailsBtn: (state) => mergeStyles({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: `linear-gradient(135deg, ${currentTheme.colorSecondary} 0%, ${currentTheme.colorThird} 100%)`,
      color: currentTheme.colorPrimary,
      border: 'none',
      padding: isMobile ? '8px 12px' : '10px 16px',
      borderRadius: '8px',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      width: '100%',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
      state.isHovered && {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(13, 157, 184, 0.4)',
        fontWeight: 700
      },
      state.isActive && { transform: 'translateY(0)' }),
    loadingState: {
      textAlign: 'center',
      padding: '60px 20px',
      animation: 'fadeInUp 0.6s ease-out'
    },
    loadingText: {
      fontSize: '1.2rem',
      color: currentTheme.colorSecondary,
      animation: 'pulse 2s infinite',
      fontWeight: 600
    },
    errorState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#dc2626',
      animation: 'fadeInUp 0.6s ease-out'
    },
    noResults: {
      textAlign: 'center',
      padding: '60px 20px',
      color: currentTheme.noResultsColor,
      animation: 'fadeInUp 0.6s ease-out'
    },
    noResultsHeader: {
      color: currentTheme.colorDark,
      marginBottom: '16px',
      fontSize: '1.5rem',
      fontWeight: 700
    },
    clearSearchBtn: (state) => mergeStyles({
      marginTop: '20px',
      padding: '10px 24px',
      background: currentTheme.colorSecondary,
      color: currentTheme.colorPrimary,
      border: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }, state.isHovered && {
      background: currentTheme.colorThird,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(13, 157, 184, 0.3)'
    }, state.isActive && { transform: 'translateY(0)' }),
    whoUpdatesSection: mergeStyles({
      background: currentTheme.colorPrimary,
      padding: '40px',
      borderRadius: '16px',
      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${isDarkMode ? currentTheme.borderColor : 'rgba(13,157,184,0.1)'}`,
      marginTop: '40px',
      marginBottom: '40px',
      animation: 'fadeInUp 0.6s ease-out 0.4s backwards'
    }, isSmallScreen && { padding: '24px 20px', borderRadius: '12px', marginTop: '30px', marginBottom: '30px' }, isMobile && { padding: '20px 16px' }),
    refreshButton: (state) => mergeStyles({
      padding: '10px 20px',
      background: currentTheme.colorSecondary,
      color: currentTheme.colorPrimary,
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }, state.isHovered && {
      background: currentTheme.colorThird,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(13, 157, 184, 0.3)'
    }, state.isActive && { transform: 'translateY(0)' }),
    updatesList: mergeStyles({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    }, isSmallScreen && { gridTemplateColumns: '1fr', gap: '16px' }),
    updateItem: (isHovered, index) => mergeStyles({
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '24px',
      borderRadius: '16px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13,157,184,0.08) 0%, rgba(13,157,184,0.04) 100%)'
        : 'linear-gradient(135deg, rgba(209, 244, 249, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
      border: `1px solid ${isDarkMode ? 'rgba(13,157,184,0.2)' : 'rgba(13,157,184,0.15)'}`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`,
      position: 'relative',
      overflow: 'hidden'
    }, isHovered && {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13,157,184,0.15) 0%, rgba(13,157,184,0.08) 100%)'
        : 'linear-gradient(135deg, rgba(209, 244, 249, 0.8) 0%, rgba(255, 255, 255, 1) 100%)',
      borderColor: currentTheme.colorSecondary,
      transform: 'translateY(-6px)',
      boxShadow: isDarkMode
        ? '0 12px 35px rgba(13, 157, 184, 0.3)'
        : '0 12px 35px rgba(13, 157, 184, 0.25)'
    }, isMobile && { padding: '18px', borderRadius: '12px' }),
    updateHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px'
    },
    updateIcon: {
      color: currentTheme.colorSecondary,
      flexShrink: 0,
      marginTop: '2px',
      padding: '12px',
      background: isDarkMode
        ? 'rgba(13, 157, 184, 0.15)'
        : 'rgba(13, 157, 184, 0.12)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      boxShadow: isDarkMode
        ? '0 2px 8px rgba(13, 157, 184, 0.2)'
        : '0 2px 8px rgba(13, 157, 184, 0.15)'
    },
    updateContent: { flex: 1, minWidth: 0 },
    updateTitle: {
      margin: '0 0 10px 0',
      fontSize: isMobile ? '1rem' : '1.1rem',
      lineHeight: 1.4,
      fontWeight: 700,
      transition: 'color 0.3s ease',
      color: currentTheme.colorDark,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    updateDescription: {
      fontSize: isMobile ? '0.875rem' : '0.95rem',
      color: currentTheme.cardDescColor,
      lineHeight: 1.6,
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    updateMeta: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 'auto',
      paddingTop: '8px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.1)' : 'rgba(13, 157, 184, 0.08)'}`
    },
    updateCategory: {
      fontSize: '0.75rem',
      padding: '6px 12px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.25) 0%, rgba(13, 157, 184, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(13, 157, 184, 0.2) 0%, rgba(13, 157, 184, 0.1) 100%)',
      color: currentTheme.colorSecondary,
      borderRadius: '6px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      animation: 'scaleIn 0.3s ease-out',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`
    },
    updateLink: (isHovered) => mergeStyles({
      background: 'none',
      border: 'none',
      color: currentTheme.colorDark,
      textAlign: 'left',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: 600,
      transition: 'color 0.3s ease'
    }, isHovered && {
      color: currentTheme.colorSecondary,
      textDecoration: 'underline'
    }),
    updateDate: {
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      color: currentTheme.dateColor,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      background: isDarkMode ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.08)',
      borderRadius: '6px'
    },
    viewAllLink: (isHovered) => mergeStyles({
      background: 'none',
      border: `2px solid ${currentTheme.colorSecondary}`,
      padding: '12px 24px',
      borderRadius: '10px',
      color: currentTheme.colorSecondary,
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: '0.95rem',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }, isHovered && {
      background: currentTheme.colorSecondary,
      color: currentTheme.colorPrimary,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(13, 157, 184, 0.3)'
    }),
    outbreakAlert: {
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      animation: 'slideInFromLeft 0.5s ease-out',
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
    },
    whoResourcesSection: mergeStyles({
      background: currentTheme.colorPrimary,
      padding: '40px',
      borderRadius: '16px',
      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${isDarkMode ? currentTheme.borderColor : 'rgba(13,157,184,0.1)'}`,
      marginBottom: '80px',
      animation: 'fadeInUp 0.6s ease-out 0.5s backwards'
    }, isSmallScreen && { padding: '20px' }),
    resourcesGrid: mergeStyles(
      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
      isMediumScreen && { gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' },
      isSmallScreen && { gridTemplateColumns: '1fr' }
    ),
    resourceCard: (isHovered, index) => mergeStyles({
      padding: '24px',
      background: currentTheme.colorFourth,
      borderRadius: '12px',
      textAlign: 'center',
      border: `1px solid ${currentTheme.borderColor}`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform, box-shadow',
      animation: `scaleIn 0.5s ease-out ${index * 0.15}s backwards`
    }, isHovered && {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: isDarkMode ? '0 12px 30px rgba(0, 0, 0, 0.4)' : '0 12px 30px rgba(13, 157, 184, 0.2)',
      background: isDarkMode ? 'rgba(13, 157, 184, 0.1)' : 'rgba(13, 157, 184, 0.08)',
      borderColor: currentTheme.colorSecondary
    }, isMobile && { padding: '20px' }),
    resourceCardIcon: {
      color: currentTheme.colorSecondary,
      marginBottom: '12px',
      transition: 'transform 0.3s ease'
    },
    resourceCardHeader: {
      margin: '0 0 8px 0',
      fontSize: '1rem',
      color: currentTheme.colorDark,
      fontWeight: 700,
      transition: 'color 0.3s ease'
    },
    resourceCardP: {
      margin: '0 0 16px 0',
      fontSize: '0.9rem',
      color: currentTheme.cardDescColor,
      lineHeight: 1.4
    },
    resourceLink: (isHovered, isFocused) => mergeStyles({
      background: 'none',
      border: 'none',
      color: currentTheme.colorSecondary,
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }, isHovered && {
      color: currentTheme.colorThird,
      textDecoration: 'underline',
      transform: 'translateX(4px)'
    }, isFocused && {
      outline: `2px solid ${currentTheme.colorSecondary}`,
      outlineOffset: '2px'
    }),
  };

  const interactiveProps = (key) => ({
    onMouseEnter: () => handleInteraction(key, 'isHovered', true),
    onMouseLeave: () => handleInteraction(key, 'isHovered', false),
    onFocus: () => handleInteraction(key, 'isFocused', true),
    onBlur: () => handleInteraction(key, 'isFocused', false),
    onMouseDown: () => handleInteraction(key, 'isActive', true),
    onMouseUp: () => handleInteraction(key, 'isActive', false),
  });

  if (pageLoading) {
    return (
      <div style={pageLoaderOverlayStyle}>
        <div style={loaderContainerStyle}>
          <div style={loaderStyle}>
            <div style={loaderAfterStyle}></div>
          </div>
          <p style={loaderTextStyle}>Loading Disease Search...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.diseaseSearchPage}>
      <header style={styles.pageHeader}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Find Interested Diseases & Conditions</h1>
          <p style={styles.pageSubtitle}>Search through comprehensive medical information and get the latest WHO updates on diseases, symptoms, treatments, and prevention methods.</p>
        </div>
      </header>

      <div style={mergeStyles(styles.container, styles.mainContent)}>
        <div style={styles.contentWrapper}>
          <section style={styles.searchSection}>
            <form style={styles.searchForm} onSubmit={handleSearch}>
              <div style={styles.searchContainer}>
                <div style={styles.searchInputWrapper}>
                  <Search style={styles.searchIcon} size={24} />
                  <input
                    type="text"
                    placeholder="Search by disease name, symptom, etc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput(getInteractionStyles('searchInput').isFocused)}
                    {...interactiveProps('searchInput')}
                  />
                </div>
                <button
                  type="submit"
                  style={styles.searchButton(getInteractionStyles('searchBtn'))}
                  {...interactiveProps('searchBtn')}
                >
                  Search
                </button>
              </div>
              <div style={styles.keywordsSection}>
                <input
                  type="text"
                  placeholder="Add keywords and press Enter..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={styles.keywordInput(getInteractionStyles('keywordInput').isFocused)}
                  {...interactiveProps('keywordInput')}
                />
                {selectedKeywords.length > 0 && (
                  <div style={styles.keywordsList}>
                    {selectedKeywords.map((keyword, index) => (
                      <span key={index} style={styles.keywordTag}>
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          style={styles.keywordRemove(getInteractionStyles(`kwRemove${index}`).isHovered)}
                          {...interactiveProps(`kwRemove${index}`)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </section>

          {hasNewOutbreaks && (
            <div style={styles.outbreakAlert}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} />
                <span style={{ fontWeight: '600' }}>
                  {newOutbreaks.length} New Outbreak Alert{newOutbreaks.length > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={clearNewOutbreaks}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                Dismiss
              </button>
            </div>
          )}

          <main style={styles.mainSection}>
            <section style={styles.diseasesSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={styles.sectionTitle}>
                  {searchQuery || selectedKeywords.length > 0 ? 'Search Results' : 'All Diseases'}
                  {filteredDiseases.length > 0 && <span style={styles.resultCount}> ({filteredDiseases.length} found)</span>}
                  <div style={styles.sectionTitleAfter}></div>
                </h2>
                {filteredDiseases.length > 0 && (
                  <div style={styles.scrollButtonsContainer}>
                    <button
                      onClick={() => scrollContainer('left')}
                      disabled={!canScrollLeft}
                      style={styles.scrollButton(getInteractionStyles('scrollLeft').isHovered, !canScrollLeft)}
                      {...interactiveProps('scrollLeft')}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={20} color={!canScrollLeft ? '#9ca3af' : '#ffffff'} />
                    </button>
                    <button
                      onClick={() => scrollContainer('right')}
                      disabled={!canScrollRight}
                      style={styles.scrollButton(getInteractionStyles('scrollRight').isHovered, !canScrollRight)}
                      {...interactiveProps('scrollRight')}
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={20} color={!canScrollRight ? '#9ca3af' : '#ffffff'} />
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div style={styles.loadingState}>
                  <div style={styles.loadingText}>Loading diseases...</div>
                </div>
              ) : error ? (
                <div style={styles.errorState}>
                  <p>Error: {error}</p>
                </div>
              ) : filteredDiseases.length > 0 ? (
                <div
                  ref={setScrollContainerRef}
                  style={styles.diseasesHorizontalScroll}
                >
                  {filteredDiseases.map((disease, index) => (
                    <div
                      key={disease._id || disease.id || index}
                      style={styles.diseaseCard(getInteractionStyles(`card${index}`).isHovered, index)}
                      {...interactiveProps(`card${index}`)}
                    >
                      <div style={{ ...styles.cardImage(getInteractionStyles(`card${index}`).isHovered), overflow: 'hidden' }}>
                        <img
                          src={disease.image ? `/${disease.image}` : `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop`}
                          alt={disease.name}
                          style={styles.cardImageImg}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop';
                          }}
                        />
                        <div style={styles.cardCategory}>{disease.category}</div>
                      </div>
                      <div style={styles.cardContent}>
                        <div>
                          <h3 style={styles.cardTitle}>{disease.name}</h3>
                          <p style={styles.cardDescription}>{disease.description}</p>
                          {disease.symptoms?.length > 0 && (
                            <div style={styles.symptomsPreview}>
                              <strong>Symptoms: </strong>
                              {disease.symptoms.slice(0, 2).join(', ')}
                              {disease.symptoms.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                        <button
                          style={styles.viewDetailsBtn(getInteractionStyles(`detailsBtn${index}`))}
                          onClick={() => handleViewDetails(disease)}
                          {...interactiveProps(`detailsBtn${index}`)}
                        >
                          <Eye size={isMobile ? 14 : 16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noResults}>
                  <h3 style={styles.noResultsHeader}>No diseases found</h3>
                  <p>Try different keywords or clear your search.</p>
                  <button
                    style={styles.clearSearchBtn(getInteractionStyles('clearBtn'))}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedKeywords([]);
                    }}
                    {...interactiveProps('clearBtn')}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </section>
          </main>

          <section style={styles.whoUpdatesSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={mergeStyles(styles.sectionTitle, { margin: 0, paddingBottom: '12px' })}>
                Latest WHO Health Updates
                <div style={styles.sectionTitleAfter}></div>
              </h2>
              <button
                onClick={refreshWHOUpdates}
                style={mergeStyles(styles.refreshButton(getInteractionStyles('refreshBtn')), {
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  borderRadius: '8px',
                  fontWeight: 600
                })}
                disabled={whoLoading}
                {...interactiveProps('refreshBtn')}
              >
                <RefreshCw size={16} className={whoLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            {whoError ? (
              <div style={styles.errorState}>
                <p>Error: {whoError}</p>
              </div>
            ) : whoUpdates?.length > 0 ? (
              <>
                <div style={styles.updatesList}>
                  {whoUpdates.map((update, index) => (
                    <article
                      key={update.id || index}
                      style={styles.updateItem(getInteractionStyles(`update${index}`).isHovered, index)}
                      onClick={() => handleUpdateClick(update)}
                      {...interactiveProps(`update${index}`)}
                    >
                      <div style={styles.updateHeader}>
                        <div style={styles.updateIcon}>
                          {getCategoryIcon(update.category)}
                        </div>
                        <div style={styles.updateContent}>
                          <h3 style={styles.updateTitle}>
                            {update.title}
                            {update.url && <ExternalLink size={14} style={{ marginLeft: '6px', verticalAlign: 'middle' }} />}
                          </h3>
                          {update.description && (
                            <p style={styles.updateDescription}>{update.description}</p>
                          )}
                        </div>
                      </div>
                      <div style={styles.updateMeta}>
                        {update.category && (
                          <span style={styles.updateCategory}>{update.category}</span>
                        )}
                        <time style={styles.updateDate}>
                          <Calendar size={12} />
                          {update.date}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  style={styles.viewAllLink(getInteractionStyles('viewAllLink').isHovered)}
                  onClick={handleViewAllUpdates}
                  {...interactiveProps('viewAllLink')}
                >
                  View All WHO Updates →
                </button>
              </>
            ) : (
              <div style={styles.loadingState}>
                <div style={styles.loadingText}>Loading WHO updates...</div>
              </div>
            )}
          </section>

          <section style={styles.whoResourcesSection}>
            <h2 style={mergeStyles(styles.sectionTitle, { marginBottom: '24px' })}>
              WHO Resources & Tools
              <div style={styles.sectionTitleAfter}></div>
            </h2>
            <div style={styles.resourcesGrid}>
              {[
                { icon: Globe, title: "Global Health Observatory", desc: "Health statistics and data", link: "https://www.who.int/data/gho", label: "Visit GHO" },
                { icon: Shield, title: "Health Topics", desc: "A-Z health topics", link: "https://www.who.int/health-topics", label: "Browse Topics" },
                { icon: TrendingUp, title: "Disease Surveillance", desc: "Outbreak monitoring", link: "https://www.who.int/emergencies/surveillance", label: "View Surveillance" },
                { icon: BookOpen, title: "Publications", desc: "Guidelines & reports", link: "https://www.who.int/publications", label: "View Publications" }
              ].map((res, index) => {
                const Icon = res.icon;
                return (
                  <div
                    key={index}
                    style={styles.resourceCard(getInteractionStyles(`res${index}`).isHovered, index)}
                    {...interactiveProps(`res${index}`)}
                  >
                    <Icon size={32} style={styles.resourceCardIcon} />
                    <h4 style={styles.resourceCardHeader}>{res.title}</h4>
                    <p style={styles.resourceCardP}>{res.desc}</p>
                    <button
                      onClick={() => window.open(res.link, '_blank')}
                      style={styles.resourceLink(
                        getInteractionStyles(`reslink${index}`).isHovered,
                        getInteractionStyles(`reslink${index}`).isFocused
                      )}
                      {...interactiveProps(`reslink${index}`)}
                    >
                      {res.label} →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DiseaseSearchPage;