import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SymptomChecker() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const heroRef = useRef(null);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall = window.matchMedia('(max-width: 480px)').matches;

  // Page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
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

    // Observe hero section
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
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate('/symptom-checker');
      setIsAnalyzing(false);
    }, 1500);
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

    // Hero Section Styles
    heroSection: {
      padding: isSmall ? '100px 16px 60px' : isMobile ? '120px 20px 80px' : '140px 40px 100px',
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
    },
    heroContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: isSmall ? '40px' : isMobile ? '50px' : '80px',
      flexDirection: isMobile ? 'column' : 'row'
    },
    heroContent: {
      flex: 1,
      animation: 'slideInLeft 0.8s ease-out'
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
      animation: 'scaleIn 0.6s ease-out'
    },
    heroTitle: {
      fontSize: isSmall ? '2.2rem' : isMobile ? '2.8rem' : '4rem',
      fontWeight: 900,
      marginBottom: '24px',
      lineHeight: 1.2,
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      animation: 'fadeInUp 0.8s ease-out 0.2s backwards'
    },
    heroSubtitle: {
      fontSize: isSmall ? '1rem' : isMobile ? '1.1rem' : '1.3rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.7,
      marginBottom: '32px',
      animation: 'fadeInUp 0.8s ease-out 0.3s backwards'
    },
    statsContainer: {
      display: 'flex',
      gap: isSmall ? '20px' : '32px',
      marginBottom: '40px',
      flexWrap: 'wrap',
      animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
    },
    statItem: {
      flex: isSmall ? '1 1 calc(50% - 10px)' : '0 0 auto'
    },
    statNumber: {
      fontSize: isSmall ? '1.8rem' : isMobile ? '2rem' : '2.5rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #0d9db8, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontFamily: "'Inter', sans-serif",
      lineHeight: 1
    },
    statLabel: {
      fontSize: isSmall ? '0.8rem' : '0.9rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      marginTop: '4px',
      fontWeight: 500
    },
    ctaButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: isSmall ? '14px 32px' : '18px 40px',
      background: isButtonHovered && !isAnalyzing
        ? 'linear-gradient(135deg, #3b82f6, #0d9db8)'
        : 'linear-gradient(135deg, #0d9db8, #3b82f6)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50px',
      fontSize: isSmall ? '1rem' : '1.1rem',
      fontWeight: 700,
      cursor: isAnalyzing ? 'not-allowed' : 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isButtonHovered && !isAnalyzing
        ? '0 12px 32px rgba(13, 157, 184, 0.4)'
        : '0 8px 24px rgba(13, 157, 184, 0.25)',
      transform: isButtonHovered && !isAnalyzing ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
      animation: 'fadeInUp 0.8s ease-out 0.5s backwards',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Inter', sans-serif",
      opacity: isAnalyzing ? 0.7 : 1
    },
    buttonLoader: {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      display: 'inline-block',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      animation: 'rotation 1s linear infinite'
    },
    heroImage: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'slideInRight 0.8s ease-out',
      minHeight: isSmall ? '350px' : isMobile ? '400px' : '500px'
    },
    heroImg: {
      width: '100%',
      maxWidth: isSmall ? '600px' : isMobile ? '800px' : '1100px',
      height: 'auto',
      objectFit: 'contain',
      filter: isDarkMode
        ? 'drop-shadow(0 20px 40px rgba(13, 157, 184, 0.3))'
        : 'drop-shadow(0 20px 40px rgba(13, 157, 184, 0.2))',
      animation: 'float 6s ease-in-out infinite'
    },

    // Features Section
    featuresSection: {
      padding: isSmall ? '60px 16px' : isMobile ? '80px 20px' : '100px 40px',
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
    },
    sectionHeader: {
      textAlign: 'center',
      marginBottom: isSmall ? '50px' : isMobile ? '60px' : '80px'
    },
    sectionTitle: {
      fontSize: isSmall ? '1.8rem' : isMobile ? '2.2rem' : '3rem',
      fontWeight: 800,
      marginBottom: '16px',
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    sectionSubtitle: {
      fontSize: isSmall ? '1rem' : isMobile ? '1.1rem' : '1.2rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      maxWidth: '700px',
      margin: '0 auto',
      lineHeight: 1.6
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: isSmall
        ? '1fr'
        : isMobile
          ? 'repeat(auto-fit, minmax(280px, 1fr))'
          : 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: isSmall ? '24px' : isMobile ? '30px' : '40px'
    },
    featureCard: (index, isHovered, isVisibleCard) => ({
      position: 'relative',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: isSmall ? '28px' : isMobile ? '32px' : '40px',
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
        : '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      overflow: 'hidden',
      opacity: isVisibleCard ? 1 : 0,
      transform: isVisibleCard
        ? isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'
        : 'translateY(60px) scale(0.95)',
      animation: isVisibleCard ? `fadeInUp 0.6s ease-out ${index * 0.15}s backwards` : 'none',
      ...(isHovered && {
        boxShadow: isDarkMode
          ? '0 20px 60px rgba(13, 157, 184, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 20px 60px rgba(13, 157, 184, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)'
      })
    }),
    cardGlow: (isHovered) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #0d9db8, #3b82f6, #0d9db8)',
      backgroundSize: '200% 100%',
      opacity: isHovered ? 1 : 0,
      animation: isHovered ? 'shimmer 2s infinite' : 'none',
      borderRadius: '24px 24px 0 0',
      transition: 'opacity 0.3s ease'
    }),
    iconContainer: (isHovered) => ({
      width: isSmall ? '60px' : '70px',
      height: isSmall ? '60px' : '70px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
      fontSize: isSmall ? '1.8rem' : '2rem',
      transition: 'all 0.4s ease',
      transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
    }),
    featureTitle: {
      fontSize: isSmall ? '1.3rem' : isMobile ? '1.4rem' : '1.5rem',
      fontWeight: 700,
      marginBottom: '12px',
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    featureDesc: {
      fontSize: isSmall ? '0.95rem' : '1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.7
    },

    // How It Works Section
    howItWorksSection: {
      padding: isSmall ? '60px 16px' : isMobile ? '80px 20px' : '100px 40px',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
    },
    stepsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: isSmall ? '40px' : '60px',
      marginTop: isSmall ? '40px' : '60px'
    },
    stepCard: (index, isVisibleCard) => ({
      display: 'flex',
      alignItems: 'center',
      gap: isSmall ? '24px' : isMobile ? '32px' : '48px',
      flexDirection: isMobile && index % 2 === 0 ? 'column' : isMobile ? 'column' : index % 2 === 0 ? 'row' : 'row-reverse',
      opacity: isVisibleCard ? 1 : 0,
      transform: isVisibleCard ? 'translateY(0)' : 'translateY(40px)',
      animation: isVisibleCard ? `fadeInUp 0.8s ease-out ${index * 0.2}s backwards` : 'none'
    }),
    stepNumber: {
      width: isSmall ? '60px' : isMobile ? '70px' : '80px',
      height: isSmall ? '60px' : isMobile ? '70px' : '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0d9db8, #3b82f6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isSmall ? '1.5rem' : isMobile ? '1.8rem' : '2rem',
      fontWeight: 900,
      color: '#ffffff',
      flexShrink: 0,
      boxShadow: '0 8px 24px rgba(13, 157, 184, 0.3)',
      fontFamily: "'Inter', sans-serif"
    },
    stepContent: {
      flex: 1
    },
    stepTitle: {
      fontSize: isSmall ? '1.4rem' : isMobile ? '1.6rem' : '1.8rem',
      fontWeight: 700,
      marginBottom: '12px',
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    stepDesc: {
      fontSize: isSmall ? '0.95rem' : '1.05rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.7
    }
  };

  const features = [
    {
      icon: '🔍',
      title: 'Advanced AI Analysis',
      description: 'Clinical Insights by Infermedica, DoctorXcare integrates the Infermedica API to analyze symptoms against millions of clinical cases, delivering research-backed, hospital-grade accuracy.'
    },
    {
      icon: '⚡',
      title: 'Instant Results',
      description: 'Swift and Actionable Triage Receive immediate guidance categorizing symptoms into Home Care, Weekly Monitoring, or Emergency Room (ER) visits for rapid, decisive health actions.'
    },
    {
      icon: '🎯',
      title: 'Personalized Recommendations',
      description: 'Integrated Clinical Guidance Get tailored advice that connects our Smart Lab Analysis, Chronic Disease Management, and Healthcare Network for a comprehensive care experience.'
    },
    {
      icon: '🔒',
      title: 'Complete Privacy',
      description: 'Your lab reports, symptom assessments, and AI health conversations are secured with end-to-end encryption, ensuring a strict privacy-first experience.'
    },
    {
      icon: '🏥',
      title: 'Specialist Matching',
      description: 'Get connected with the right healthcare specialists for your condition, with direct booking options and location-based recommendations.'
    },
    {
      icon: '📊',
      title: 'Severity Assessment',
      description: 'Precision Urgency Detection Understand clinical urgency through priority-ranked results (Minimal to Severe) and proactive monitoring of critical danger signs to ensure patient safety.'
    }
  ];

  const steps = [
    {
      title: 'Describe Your Symptoms',
      description: 'Tell us what you\'re experiencing in your own words. Our AI understands natural language and medical terminology alike.'
    },
    {
      title: 'Answer Smart Questions',
      description: 'Our system asks targeted follow-up questions to narrow down possibilities and understand your situation better.'
    },
    {
      title: 'Receive Your Analysis',
      description: 'Get a comprehensive report with possible causes, urgency level, and recommended next steps tailored to you.'
    },
    {
      title: 'Take Action',
      description: 'Connect with specialists, access treatment information, or follow self-care guidance based on your results.'
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
            <div style={styles.loaderSubtext}>Please wait...</div>
          </div>
        </div>
      )}

      <div style={styles.backgroundPattern}></div>

      {/* Hero Section */}
      <section style={styles.heroSection} ref={heroRef}>
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <span style={styles.badge}>AI-POWERED HEALTH ASSESSMENT</span>
            <h1 style={styles.heroTitle}>
              Your <span className="gradient-text">Personal Health</span> Intelligence Platform
            </h1>
            <p style={styles.heroSubtitle}>
              Experience clinical-grade symptom analysis powered by Infermedica. Get instant insights, personalized recommendations, and peace of mind all from the comfort of your home.
            </p>

            <div style={styles.statsContainer}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>150+</div>
                <div style={styles.statLabel}>Analyses Completed</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>95%</div>
                <div style={styles.statLabel}>Accuracy Rate</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>2 Min</div>
                <div style={styles.statLabel}>Average Time</div>
              </div>
            </div>

            <button
              style={styles.ctaButton}
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              {isAnalyzing ? (
                <>
                  <span style={styles.buttonLoader}></span>
                  Initializing Analysis...
                </>
              ) : (
                <>
                  Start Free Assessment
                  <span style={{ transition: 'transform 0.3s ease', transform: isButtonHovered ? 'translateX(4px)' : 'translateX(0)' }}>→</span>
                </>
              )}
            </button>
          </div>

          <div style={styles.heroImage}>
            <img
              src="/assets/Symptomspage.svg"
              alt="Medical Analysis Illustration"
              style={styles.heroImg}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600/0d9db8/ffffff?text=Medical+Analysis';
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection} ref={sectionRef}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            Why Choose <span className="gradient-text">DoctorXCare</span>
          </h2>
          <p style={styles.sectionSubtitle}>
            Advanced technology meets compassionate care to provide you with the most comprehensive health assessment experience available.
          </p>
        </div>

        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              ref={el => cardRefs.current[index] = el}
              style={styles.featureCard(index, hoveredCard === index, isVisible[index])}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.cardGlow(hoveredCard === index)}></div>
              <div style={styles.iconContainer(hoveredCard === index)}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p style={styles.sectionSubtitle}>
            Get your personalized health assessment in four simple steps. Our streamlined process makes getting answers fast and easy.
          </p>
        </div>

        <div style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div
              key={index}
              ref={el => cardRefs.current[features.length + index] = el}
              style={styles.stepCard(index, isVisible[features.length + index])}
            >
              <div style={styles.stepNumber}>{index + 1}</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SymptomChecker;