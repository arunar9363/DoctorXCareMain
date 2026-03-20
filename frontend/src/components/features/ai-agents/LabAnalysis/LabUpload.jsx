import React, { useState, useEffect, useRef } from 'react';
import { Upload, Activity, FileText, AlertCircle } from 'lucide-react';
import LabResult from './LabResult';
import { analyzeLabImageAPI, saveLabReportAPI } from '../../api/lab.api.js';

const LabUpload = () => {
  const [file, setFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const heroRef = useRef(null);
  const cardRefs = useRef([]);
  const resultRef = useRef(null);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall = window.matchMedia('(max-width: 480px)').matches;

  // Page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to results when analysis data is received
  useEffect(() => {
    if (analysisData && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [analysisData]);

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
      rootMargin: '0px 0px -100px 0px'
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

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Add animations CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(60px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-60px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(60px);
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

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }

      @keyframes rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .gradient-text {
        background: linear-gradient(135deg, #0d9db8, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .dark-mode .gradient-text {
        background: linear-gradient(135deg, #0d9db8, #60a5fa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setError("");
      setAnalysisData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1 — AI analysis via backend (replaces fetch to /api/medical-analysis)
      const res = await analyzeLabImageAPI(formData);
      const data = res.data;

      console.log("Backend response:", data);

      if (data.error) {
        setError("Server Error: " + data.error);
      } else if (data.analysis) {
        console.log("Setting analysis data:", data.analysis);
        setAnalysisData(data.analysis);

        // Step 2 — Save report + analysis to MongoDB
        try {
          await saveLabReportAPI({
            fileName: file.name,
            reportType: 'OTHER',
            analysis: {
              summary: data.analysis.substring(0, 300),
              rawText: data.analysis
            }
          });
        } catch (saveErr) {
          // Save failed — dont block UI, analysis already shown
          console.error("Failed to save report to MongoDB:", saveErr);
        }
      } else {
        console.log("No analysis in response");
        setError("No analysis data received from server");
      }
    } catch (err) {
      setError("Connection Failed: Make sure Backend is running.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setFile(null);
    setError("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const styles = {
    pageLoader: {
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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: isPageLoading ? 'none' : 'fadeOut 0.5s ease-out forwards'
    },
    loaderContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    },
    spinner: {
      width: '60px',
      height: '60px',
      border: `4px solid ${isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(13, 157, 184, 0.2)'}`,
      borderTop: '4px solid #0d9db8',
      borderRadius: '50%',
      animation: 'rotation 1s linear infinite'
    },
    loaderText: {
      fontSize: '1.1rem',
      fontWeight: 600,
      background: 'linear-gradient(135deg, #0d9db8, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontFamily: "'Inter', sans-serif"
    },
    loaderSubtext: {
      fontSize: '0.9rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      fontFamily: "'Inter', sans-serif"
    },
    pageWrapper: {
      width: '100%',
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e1b4b 75%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%, #ffffff 100%)',
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
    heroSection: {
      padding: isSmall ? '100px 16px 40px' : isMobile ? '120px 20px 60px' : '140px 40px 80px',
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
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
      marginBottom: '20px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      animation: 'scaleIn 0.6s ease-out',
      textAlign: 'center'
    },
    heroTitle: {
      fontSize: isSmall ? '2rem' : isMobile ? '2.5rem' : '3.5rem',
      fontWeight: 900,
      marginBottom: '24px',
      lineHeight: 1.2,
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
      textAlign: 'center'
    },
    heroSubtitle: {
      fontSize: isSmall ? '0.95rem' : isMobile ? '1rem' : '1.15rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.7,
      marginBottom: '40px',
      animation: 'fadeInUp 0.8s ease-out 0.3s backwards',
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto 40px'
    },
    uploadCard: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: isSmall ? '32px 20px' : isMobile ? '40px 28px' : '48px 40px',
      boxShadow: isDarkMode
        ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 20px 60px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
      maxWidth: '900px',
      margin: '0 auto',
      animation: 'scaleIn 0.8s ease-out 0.4s backwards',
      position: 'relative',
      overflow: 'hidden'
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #0d9db8, #3b82f6, #0d9db8)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite',
      borderRadius: '24px 24px 0 0'
    },
    dropZone: {
      border: file ? '3px dashed #4ade80' : `3px dashed ${isDarkMode ? '#60a5fa' : '#0d9db8'}`,
      backgroundColor: file
        ? isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4'
        : isDarkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(13, 157, 184, 0.05)',
      borderRadius: '20px',
      padding: isSmall ? '48px 20px' : isMobile ? '64px 32px' : '80px 40px',
      textAlign: 'center',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative'
    },
    uploadIcon: {
      width: isSmall ? '56px' : '72px',
      height: isSmall ? '56px' : '72px',
      color: file ? '#16a34a' : isDarkMode ? '#60a5fa' : '#0d9db8',
      marginBottom: '20px',
      animation: file ? 'none' : 'float 3s ease-in-out infinite'
    },
    fileIcon: {
      width: isSmall ? '56px' : '72px',
      height: isSmall ? '56px' : '72px',
      color: '#16a34a',
      marginBottom: '20px'
    },
    fileName: {
      color: '#166534',
      fontWeight: 700,
      fontSize: isSmall ? '1rem' : isMobile ? '1.1rem' : '1.3rem',
      marginBottom: '8px',
      display: 'block',
      wordBreak: 'break-word',
      padding: '0 12px',
      fontFamily: "'Inter', sans-serif"
    },
    fileHint: {
      color: '#16a34a',
      fontSize: isSmall ? '0.8rem' : '0.9rem',
      fontWeight: 500
    },
    uploadText: {
      color: isDarkMode ? '#f9fafb' : '#334155',
      fontWeight: 700,
      fontSize: isSmall ? '1.1rem' : isMobile ? '1.2rem' : '1.4rem',
      marginBottom: '8px',
      display: 'block',
      fontFamily: "'Inter', sans-serif"
    },
    uploadHint: {
      color: isDarkMode ? '#9ca3af' : '#64748b',
      fontSize: isSmall ? '0.85rem' : '1rem',
      fontWeight: 500
    },
    errorBox: {
      marginTop: '24px',
      padding: isSmall ? '16px' : '20px',
      backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.15)' : '#fef2f2',
      color: isDarkMode ? '#fca5a5' : '#991b1b',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      border: `1px solid ${isDarkMode ? 'rgba(220, 38, 38, 0.3)' : '#fecaca'}`
    },
    analyzeButton: {
      width: '100%',
      marginTop: '32px',
      padding: isSmall ? '16px' : '20px',
      borderRadius: '16px',
      fontWeight: 700,
      color: 'white',
      fontSize: isSmall ? '1rem' : '1.1rem',
      boxShadow: loading || !file ? 'none' : '0 12px 32px rgba(13, 157, 184, 0.3)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      border: 'none',
      cursor: loading || !file ? 'not-allowed' : 'pointer',
      background: loading || !file
        ? isDarkMode ? '#374151' : '#cbd5e1'
        : 'linear-gradient(135deg, #0d9db8, #3b82f6)',
      transform: isButtonHovered && !loading && file ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
      fontFamily: "'Inter', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    securityNote: {
      marginTop: '24px',
      textAlign: 'center',
      padding: '20px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))'
        : 'linear-gradient(135deg, rgba(13, 157, 184, 0.05), rgba(59, 130, 246, 0.05))',
      borderRadius: '16px',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(13, 157, 184, 0.15)'}`
    },
    securityText: {
      fontSize: isSmall ? '0.85rem' : '0.95rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      fontFamily: "'Inter', sans-serif"
    },
    securityHighlight: {
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    featuresSection: {
      padding: isSmall ? '60px 16px' : isMobile ? '80px 20px' : '100px 40px',
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
      display: analysisData ? 'none' : 'block'
    },
    sectionTitle: {
      fontSize: isSmall ? '1.8rem' : isMobile ? '2.2rem' : '2.8rem',
      fontWeight: 800,
      marginBottom: '16px',
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      textAlign: 'center'
    },
    sectionSubtitle: {
      fontSize: isSmall ? '0.95rem' : isMobile ? '1rem' : '1.1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      maxWidth: '700px',
      margin: '0 auto 60px',
      lineHeight: 1.6,
      textAlign: 'center'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: isSmall
        ? '1fr'
        : isMobile
          ? 'repeat(auto-fit, minmax(280px, 1fr))'
          : 'repeat(3, 1fr)',
      gap: isSmall ? '24px' : isMobile ? '30px' : '32px'
    },
    featureCard: (index, isHovered) => ({
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: isSmall ? '28px' : '36px',
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
        : '0 10px 40px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      opacity: isVisible[index] ? 1 : 0,
      animation: isVisible[index] ? `fadeInUp 0.6s ease-out ${index * 0.15}s backwards` : 'none'
    }),
    featureIcon: (isHovered) => ({
      fontSize: isSmall ? '2rem' : '2.5rem',
      marginBottom: '20px',
      display: 'block',
      transition: 'transform 0.4s ease',
      transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
    }),
    featureTitle: {
      fontSize: isSmall ? '1.2rem' : '1.4rem',
      fontWeight: 700,
      marginBottom: '12px',
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    featureDesc: {
      fontSize: isSmall ? '0.9rem' : '0.95rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.7,
      fontFamily: "'Inter', sans-serif"
    },
    resultSection: {
      padding: isSmall ? '40px 16px' : '60px 40px',
      animation: 'fadeIn 0.5s ease-in',
      position: 'relative',
      zIndex: 1
    }
  };

  const features = [
    {
      icon: '🔬',
      title: 'Advanced AI Analysis',
      description: 'Powered by cutting-edge medical AI technology for accurate lab report and imaging analysis.'
    },
    {
      icon: '⚡',
      title: 'Instant Results',
      description: 'Get comprehensive analysis results in seconds, not days. Fast, accurate, and reliable.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and processed securely. We never store your files permanently.'
    },
    {
      icon: '📊',
      title: 'Detailed Reports',
      description: 'Receive comprehensive reports with red flag detection and actionable health insights.'
    },
    {
      icon: '🎯',
      title: 'High Accuracy',
      description: 'Clinical-grade accuracy with AI trained on millions of medical records and images.'
    },
    {
      icon: '💡',
      title: 'Smart Recommendations',
      description: 'Get personalized health recommendations based on your lab results and imaging data.'
    }
  ];

  return (
    <div style={styles.pageWrapper} className={isDarkMode ? 'dark-mode' : ''}>
      {/* Page Loader */}
      {isPageLoading && (
        <div style={styles.pageLoader}>
          <div style={styles.loaderContent}>
            <div style={styles.spinner}></div>
            <div style={styles.loaderText}>Loading DoctorXCare</div>
            <div style={styles.loaderSubtext}>Initializing Lab Analysis...</div>
          </div>
        </div>
      )}

      <div style={styles.backgroundPattern}></div>

      {/* Hero Section - Hide when results are displayed */}
      <section style={{ ...styles.heroSection, display: analysisData ? 'none' : 'block' }} ref={heroRef}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={styles.badge}>AI-POWERED MEDICAL ANALYSIS</span>
          <h1 style={styles.heroTitle}>
            <span className="gradient-text">Advanced Lab Report</span> & Imaging Analysis
          </h1>
          <p style={styles.heroSubtitle}>
            Upload your lab reports (PDF) or medical imaging (X-Ray/MRI) for instant AI-powered analysis. Detect potential health risks with clinical-grade accuracy and receive actionable insights in seconds.
          </p>
        </div>

        {/* Upload Card */}
        <div style={styles.uploadCard}>
          <div style={styles.cardGlow}></div>

          <div style={styles.dropZone}>
            <input
              type="file"
              id="lab-file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label htmlFor="lab-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {file ? (
                <>
                  <FileText style={styles.fileIcon} />
                  <span style={styles.fileName}>{file.name}</span>
                  <span style={styles.fileHint}>✓ File selected - Click to change</span>
                </>
              ) : (
                <>
                  <Upload style={styles.uploadIcon} />
                  <span style={styles.uploadText}>Click or Drag to Upload</span>
                  <span style={styles.uploadHint}>Supports PDF, JPG, PNG (Maximum 5MB)</span>
                </>
              )}
            </label>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontWeight: 600, fontSize: isSmall ? '0.85rem' : '0.95rem' }}>{error}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
            style={styles.analyzeButton}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            {loading ? (
              <>
                <Activity size={20} className="animate-spin" />
                Processing Analysis...
              </>
            ) : (
              <>
                <Activity size={20} />
                Analyze Now
              </>
            )}
          </button>

          <div style={styles.securityNote}>
            <p style={styles.securityText}>
              <span style={styles.securityHighlight}>🔐 Enterprise-Grade Security:</span> Your medical data is encrypted end-to-end and processed in secure cloud environments. We comply with HIPAA and GDPR standards.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Hide when results are displayed */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>
          Why Choose <span className="gradient-text">DoctorXCare</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Experience the future of medical analysis with our advanced AI technology trusted by healthcare professionals worldwide.
        </p>

        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              ref={el => cardRefs.current[index] = el}
              style={styles.featureCard(index, hoveredFeature === index)}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <span style={styles.featureIcon(hoveredFeature === index)}>{feature.icon}</span>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Results Section - Only shown when analysisData exists */}
      {analysisData && (
        <div ref={resultRef} style={styles.resultSection}>
          <LabResult analysis={analysisData} onNewAnalysis={handleNewAnalysis} />
        </div>
      )}
    </div>
  );
};

export default LabUpload;