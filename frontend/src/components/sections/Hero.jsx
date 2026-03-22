import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../common/LoginModal";
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import useAuth from "../../context/AuthContext.jsx";

function Hero() {
  const [showLogin, setShowLogin] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  const navigate = useNavigate();

  // Replaced: onAuthStateChanged(auth, ...) → useAuth() from AuthContext (JWT)
  const { user, loading } = useAuth();

  const words = [
    "Fingertips",
    "Command",
    "Dashboard"
  ];

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall = window.matchMedia('(max-width: 480px)').matches;

  // Word rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  // Visibility on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(darkMode);
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Page loader timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Replaced: onAuthStateChanged useEffect → useAuth handles auth state
  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Inject animations
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.id = 'hero-page-animations';
    styleTag.innerHTML = `
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
          transform: translateY(-40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-60px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeInRight {
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
          transform: translateY(-20px);
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
      }

      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes wordSlide {
        0% {
          opacity: 0;
          transform: translateY(30px);
        }
        15% {
          opacity: 1;
          transform: translateY(0);
        }
        85% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-30px);
        }
      }

      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes checkBounce {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }

      .gradient-text {
        background: linear-gradient(135deg, var(--color-secondary), var(--color-third));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .gradient-border {
        position: relative;
      }

      .gradient-border::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2px;
        background: linear-gradient(135deg, var(--color-secondary), var(--color-third));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      .loader-spin {
        animation: rotation 1s linear infinite;
      }
    `;
    document.head.appendChild(styleTag);
    return () => {
      const existing = document.getElementById('hero-page-animations');
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  // Button Handlers
  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    navigate('/dashboard');
  };

  const styles = {
    heroSection: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e1b4b 75%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%, #ffffff 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      paddingTop: isSmall ? '80px' : isMobile ? '90px' : '100px',
      paddingBottom: isSmall ? '60px' : isMobile ? '70px' : '80px',
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
    floatingShapes: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none'
    },
    shape: (size, top, left, delay) => ({
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: isDarkMode
        ? 'radial-gradient(circle, rgba(13, 157, 184, 0.1), transparent)'
        : 'radial-gradient(circle, rgba(13, 157, 184, 0.08), transparent)',
      top,
      left,
      animation: `float 6s ease-in-out infinite ${delay}s`
    }),
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isSmall ? '0 16px' : isMobile ? '0 20px' : '0 40px',
      position: 'relative',
      zIndex: 1
    },
    heroContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: isSmall ? '40px' : isMobile ? '50px' : '60px'
    },
    leftContent: {
      opacity: isVisible ? 1 : 0,
      animation: isVisible ? 'fadeInLeft 0.8s ease-out' : 'none',
      width: '100%',
      maxWidth: '1100px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
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
      marginBottom: '24px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      animation: isVisible ? 'fadeInDown 0.6s ease-out 0.2s backwards' : 'none'
    },
    mainHeading: {
      fontSize: isSmall ? '2.2rem' : isMobile ? '2.8rem' : '4rem',
      fontWeight: 800,
      lineHeight: 1.2,
      marginBottom: '24px',
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      fontFamily: "'Merriweather', serif",
      animation: isVisible ? 'fadeInUp 0.8s ease-out 0.3s backwards' : 'none',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    },
    animatedWordContainer: {
      display: 'block',
      position: 'relative',
      height: isSmall ? '2.8rem' : isMobile ? '3.5rem' : '5rem',
      width: '100%',
      overflow: 'hidden'
    },
    animatedWord: {
      display: 'block',
      width: '100%',
      textAlign: 'center',
      fontSize: isSmall ? '2.2rem' : isMobile ? '2.8rem' : '4rem',
      fontWeight: 900,
      lineHeight: isSmall ? '2.8rem' : isMobile ? '3.5rem' : '5rem',
      animation: 'wordSlide 3s ease-in-out'
    },
    subtitle: {
      fontSize: isSmall ? '1rem' : isMobile ? '1.15rem' : '1.3rem',
      lineHeight: 1.5,
      color: isDarkMode ? '#cbd5e1' : '#475569',
      marginBottom: '40px',
      maxWidth: '800px',
      animation: isVisible ? 'fadeInUp 0.8s ease-out 0.4s backwards' : 'none',
      textAlign: 'center'
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 40px 0',
      display: 'grid',
      gridTemplateColumns: isSmall ? '1fr' : isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isSmall ? '14px' : '18px',
      textAlign: 'left',
      maxWidth: '1000px',
      width: '100%'
    },
    featureItem: (index) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      animation: isVisible ? `fadeInUp 0.6s ease-out ${0.5 + index * 0.1}s backwards` : 'none',
      padding: isSmall ? '10px' : '12px',
      background: isDarkMode ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)',
      borderRadius: '12px',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(13, 157, 184, 0.1)'}`,
      transition: 'all 0.3s ease'
    }),
    checkIcon: {
      width: '24px',
      height: '24px',
      minWidth: '24px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
      marginTop: '2px',
      animation: 'checkBounce 2s ease-in-out infinite',
      boxShadow: '0 4px 12px rgba(13, 157, 184, 0.3)'
    },
    featureContent: {
      flex: 1
    },
    featureTitle: {
      fontSize: isSmall ? '0.98rem' : '1.08rem',
      fontWeight: 700,
      color: isDarkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '6px',
      fontFamily: "'Inter', sans-serif"
    },
    featureDesc: {
      fontSize: isSmall ? '0.85rem' : '0.93rem',
      color: isDarkMode ? '#94a3b8' : '#64748b',
      lineHeight: 1.6
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: isSmall ? 'column' : isMobile ? 'column' : 'row',
      gap: '16px',
      marginTop: '20px',
      marginBottom: '20px',
      animation: isVisible ? 'fadeInUp 0.8s ease-out 1s backwards' : 'none',
      justifyContent: 'center',
      width: '100%'
    },
    primaryButton: {
      padding: isSmall ? '16px 32px' : '18px 36px',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: isSmall ? '1rem' : '1.05rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 8px 24px rgba(13, 157, 184, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      minWidth: isSmall ? '100%' : '180px'
    },
    secondaryButton: {
      padding: isSmall ? '16px 32px' : '18px 36px',
      background: 'transparent',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      border: `2px solid ${isDarkMode ? '#60a5fa' : '#0d9db8'}`,
      borderRadius: '12px',
      fontSize: isSmall ? '1rem' : '1.05rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Inter', sans-serif",
      minWidth: isSmall ? '100%' : '180px'
    },
    rightContent: {
      opacity: isVisible ? 1 : 0,
      animation: isVisible ? 'scaleIn 0.8s ease-out 0.6s backwards' : 'none',
      position: 'relative',
      width: '100%',
      maxWidth: '800px'
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    heroImage: {
      width: '100%',
      maxWidth: isSmall ? '420px' : isMobile ? '540px' : '800px',
      height: 'auto',
      animation: 'float 6s ease-in-out infinite',
      filter: isDarkMode ? 'drop-shadow(0 20px 40px rgba(13, 157, 184, 0.3))' : 'drop-shadow(0 20px 40px rgba(13, 157, 184, 0.2))'
    },
    glowEffect: {
      position: 'absolute',
      width: '70%',
      height: '70%',
      background: isDarkMode
        ? 'radial-gradient(circle, rgba(13, 157, 184, 0.2), transparent)'
        : 'radial-gradient(circle, rgba(13, 157, 184, 0.15), transparent)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 4s ease-in-out infinite',
      zIndex: -1
    },
    statsBar: {
      display: 'flex',
      flexDirection: isSmall ? 'column' : 'row',
      gap: isSmall ? '15px' : '30px',
      marginTop: '30px',
      padding: isSmall ? '20px' : '30px',
      background: isDarkMode
        ? 'rgba(30, 41, 59, 0.5)'
        : 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      animation: isVisible ? 'fadeInUp 0.8s ease-out 1.1s backwards' : 'none',
      maxWidth: '100%',
      width: '100%'
    },
    statItem: {
      flex: 1,
      textAlign: isSmall ? 'center' : 'left'
    },
    statValue: {
      fontSize: isSmall ? '1.5rem' : '1.7rem',
      fontWeight: 600,
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '4px',
      fontFamily: "'Merriweather', serif"
    },
    statLabel: {
      fontSize: isSmall ? '0.7rem' : '0.8rem',
      color: isDarkMode ? '#94a3b8' : '#64748b',
      fontWeight: 400
    }
  };

  // Dashboard-style loader
  const loaderStyles = {
    overlay: {
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
    text: {
      marginTop: '24px',
      fontSize: '1.1rem',
      color: '#0d9db8',
      fontWeight: 700,
      fontFamily: "'Merriweather', serif",
      animation: 'pulse 2s ease-in-out infinite'
    }
  };

  const features = [
    {
      title: "AI Symptom Analysis",
      desc: "Clinical-grade AI powered by Infermedica for instant triage"
    },
    {
      title: "Disease Knowledge Hub",
      desc: "Access 1000+ verified medical conditions with treatments"
    },
    {
      title: "Smart Lab Analysis",
      desc: "Upload reports for AI-powered interpretation & insights"
    },
    {
      title: "24/7 AI Health Assistant",
      desc: "Get personalized medical guidance anytime, anywhere"
    },
    {
      title: "Chronic Care Management",
      desc: "Monitor diabetes, hypertension & thyroid with trend analytics"
    },
    {
      title: "Healthcare Network",
      desc: "Find specialists, hospitals & book appointments nearby"
    }
  ];

  if (pageLoading || (loading && user)) {
    return (
      <div style={loaderStyles.overlay}>
        <div style={loaderStyles.loader} className="loader-spin">
          <div style={loaderStyles.loaderInner} className="loader-spin"></div>
        </div>
        <p style={loaderStyles.text}>Loading DoctorXCare...</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <section style={styles.heroSection} ref={heroRef}>
      <div style={styles.backgroundPattern}></div>

      {/* Floating Shapes */}
      <div style={styles.floatingShapes}>
        <div style={styles.shape('300px', '10%', '10%', 0)}></div>
        <div style={styles.shape('200px', '70%', '80%', 2)}></div>
        <div style={styles.shape('250px', '40%', '5%', 4)}></div>
      </div>

      <div style={styles.container}>
        <div style={styles.heroContent}>
          {/* Main Content */}
          <div style={styles.leftContent}>
            <div style={styles.badge}>
              <Sparkles size={16} />
              DoctorXCare Platform
            </div>

            <h1 style={styles.mainHeading}>
              <span>Smart Healthcare at Your</span>
              <div style={styles.animatedWordContainer}>
                <span
                  className="gradient-text"
                  style={styles.animatedWord}
                  key={currentWordIndex}
                >
                  {words[currentWordIndex]}
                </span>
              </div>
            </h1>

            <p style={styles.subtitle}>
              Empower your health decisions with DoctorXCare. Get instant,
              AI-driven symptom analysis and access a library of medically
              verified insights to understand treatments and precautions with confidence.
            </p>

            <ul style={styles.featuresList}>
              {features.map((feature, index) => (
                <li key={index} style={styles.featureItem(index)}>
                  <div style={styles.checkIcon}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div style={styles.featureContent}>
                    <div style={styles.featureTitle}>{feature.title}</div>
                    <div style={styles.featureDesc}>{feature.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Section */}
          <div style={styles.rightContent}>
            <div style={styles.imageContainer}>
              <div style={styles.glowEffect}></div>
              <img
                src="/assets/HeroImage.svg"
                alt="Healthcare Dashboard Illustration"
                style={styles.heroImage}
              />
            </div>
          </div>

          {/* Buttons and Stats */}
          <div style={styles.leftContent}>
            <div style={styles.buttonGroup}>
              <button
                style={styles.primaryButton}
                onClick={handleGetStarted}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(13, 157, 184, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 157, 184, 0.3)';
                }}
              >
                Get Started
                <ArrowRight size={20} />
              </button>

              <button
                style={styles.secondaryButton}
                onClick={handleLoginClick}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(13, 157, 184, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Login
              </button>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsBar}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>500+</div>
                <div style={styles.statLabel}>Medical Conditions Covered</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>AI-Powered</div>
                <div style={styles.statLabel}>Symptoms & Triage Analysis</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>24/7</div>
                <div style={styles.statLabel}>AI Health Assistance</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>Clinically Guided</div>
                <div style={styles.statLabel}>Medical Advisor Validation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </section>
  );
}

export default Hero;