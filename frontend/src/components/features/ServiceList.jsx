import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Services() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

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

    return () => observer.disconnect();
  }, []);

  // Add animations CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
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

      .gradient-text {
        background: linear-gradient(135deg, var(--color-secondary), var(--color-third));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall = window.matchMedia('(max-width: 480px)').matches;

  const styles = {
    section: {
      padding: isSmall ? '60px 16px' : isMobile ? '80px 20px' : '120px 40px',
      paddingTop: isSmall ? '80px' : isMobile ? '100px' : '140px',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e1b4b 75%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%, #ffffff 100%)',
      minHeight: '100vh',
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
      position: 'relative',
      zIndex: 1
    },
    header: {
      textAlign: 'center',
      marginBottom: isSmall ? '50px' : isMobile ? '60px' : '80px',
      animation: 'fadeInUp 0.8s ease-out'
    },
    badge: {
      display: 'inline-block',
      padding: '8px 20px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.15), rgba(96, 165, 250, 0.15))'
        : 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
      borderRadius: '50px',
      fontSize: isSmall ? '0.75rem' : '0.85rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '20px',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      animation: 'scaleIn 0.6s ease-out'
    },
    h1: {
      fontSize: isSmall ? '2rem' : isMobile ? '2.5rem' : '3.5rem',
      fontWeight: 800,
      marginBottom: '20px',
      lineHeight: 1.2,
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      animation: 'slideInLeft 0.8s ease-out 0.2s backwards'
    },
    subtitle: {
      fontSize: isSmall ? '1rem' : isMobile ? '1.1rem' : '1.25rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      maxWidth: '700px',
      margin: '0 auto',
      lineHeight: 1.6,
      animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: isSmall
        ? '1fr'
        : isMobile
          ? 'repeat(auto-fit, minmax(300px, 1fr))'
          : 'repeat(auto-fit, minmax(380px, 1fr))',
      gap: isSmall ? '24px' : isMobile ? '30px' : '40px',
      marginTop: isSmall ? '40px' : '60px'
    },
    serviceCard: (index, isHovered, isVisibleCard) => ({
      position: 'relative',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: isSmall ? '24px' : isMobile ? '28px' : '36px',
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
        : '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      overflow: 'hidden',
      opacity: isVisibleCard ? 1 : 0,
      // transform: isVisibleCard
      //   ? isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'
      //   : 'translateY(60px) scale(0.95)',
      animation: isVisibleCard ? `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` : 'none',
      ...(isHovered && {
        boxShadow: isDarkMode
          ? '0 20px 60px rgba(13, 157, 184, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 20px 60px rgba(13, 157, 184, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)',
        borderColor: isDarkMode ? 'rgba(13, 157, 184, 0.4)' : 'rgba(13, 157, 184, 0.3)'
      })
    }),
    cardGlow: (isHovered) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, var(--color-secondary), var(--color-third), var(--color-secondary))',
      backgroundSize: '200% 100%',
      opacity: isHovered ? 1 : 0,
      animation: isHovered ? 'shimmer 2s infinite' : 'none',
      borderRadius: '24px 24px 0 0',
      transition: 'opacity 0.3s ease'
    }),
    imageContainer: {
      width: '100%',
      height: isSmall ? '200px' : isMobile ? '220px' : '240px',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '24px',
      position: 'relative',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: isDarkMode ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(148, 163, 184, 0.08)'
    },
    img: (isHovered) => ({
      width: '85%',
      height: '85%',
      objectFit: 'contain',
      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered ? 'scale(1.1) rotate(2deg)' : 'scale(1)',
      filter: isDarkMode ? 'brightness(0.95) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))'

    }),
    contentArea: {
      position: 'relative'
    },
    cardTitle: {
      fontSize: isSmall ? '1.3rem' : isMobile ? '1.4rem' : '1.6rem',
      fontWeight: 700,
      marginBottom: '12px',
      fontFamily: "'Merriweather', serif",
      lineHeight: 1.3,
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    cardDesc: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.7,
      marginBottom: '20px'
    },
    featuresContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '24px'
    },
    featureItem: (index) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      color: isDarkMode ? '#d1d5db' : '#475569',
      lineHeight: 1.6,
      opacity: 0,
      animation: `fadeInUp 0.4s ease-out ${0.6 + index * 0.1}s forwards`
    }),
    featureIcon: {
      width: isSmall ? '20px' : '24px',
      height: isSmall ? '20px' : '24px',
      minWidth: isSmall ? '20px' : '24px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: isSmall ? '0.7rem' : '0.75rem',
      fontWeight: 'bold',
      flexShrink: 0,
      marginTop: '2px',
      boxShadow: '0 4px 12px rgba(13, 157, 184, 0.3)'
    },
    ctaButton: (isHovered) => ({
      width: '100%',
      padding: isSmall ? '12px 20px' : '14px 24px',
      background: isHovered
        ? 'linear-gradient(135deg, var(--color-third), var(--color-secondary))'
        : 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: isHovered
        ? '0 8px 24px rgba(13, 157, 184, 0.4)'
        : '0 4px 12px rgba(13, 157, 184, 0.2)',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      marginTop: 'auto'
    }),
    arrow: {
      transition: 'transform 0.3s ease',
      transform: 'translateX(0)',
      display: 'inline-block'
    },
    arrowHover: {
      transform: 'translateX(4px)'
    }
  };

  const servicesData = [
    {
      id: 1,
      title: 'AI Symptom Analysis',
      description: 'Experience clinical-grade AI that analyzes your symptoms with precision, providing instant triage advice backed by medical research.',
      features: [
        'Advanced machine learning algorithms',
        'Real-time symptom assessment',
        'Personalized health recommendations',
        'Severity level detection'
      ],
      image: '/assets/Symptomspage.svg',
      route: '/symptoms'
    },
    {
      id: 2,
      title: 'Disease Knowledge Hub',
      description: 'Access our comprehensive medical library with verified information about thousands of conditions, symptoms, and treatments.',
      features: [
        'Medically reviewed database',
        'Easy-to-understand explanations',
        'Latest research updates',
        'Interactive search functionality'
      ],
      image: '/assets/diseas.svg',
      route: '/diseases'
    },
    {
      id: 3,
      title: 'Smart Lab Analysis',
      description: 'Upload your lab reports and medical imaging for AI-powered interpretation with detailed insights and recommendations.',
      features: [
        'AI-powered result interpretation',
        'Instant analysis feedback',
        'Historical trend tracking',
        'Secure data encryption'
      ],
      image: '/assets/report_analysis.svg',
      route: '/lab-analysis'
    },
    {
      id: 4,
      title: '24/7 AI Health Assistant',
      description: 'Connect with DoctorXCare AI for personalized health guidance anytime, anywhere. Your intelligent health companion.',
      features: [
        'Round-the-clock availability',
        'Contextual health conversations',
        'Evidence-based responses',
        'Privacy-first approach'
      ],
      image: '/assets/hi.svg',
      route: '/doctorx-ai'
    },
    {
      id: 5,
      title: 'Chronic Disease Management',
      description: 'Comprehensive long-term care platform for managing chronic conditions with intelligent monitoring and insights.',
      features: [
        'Multi-condition monitoring',
        'Visual health trend analytics',
        'Lifestyle tracking integration',
        'Proactive health alerts'
      ],
      image: '/assets/chronic.svg',
      route: '/health-tracking/chronic-care'
    },

    {
      id: 6,
      title: 'Healthcare Network',
      description: 'Discover nearby specialists and hospitals with smart filtering, ratings, and seamless appointment booking.',
      features: [
        'GPS-based hospital finder',
        'Specialty-wise filtering',
        'Verified reviews & ratings',
        'Direct booking integration'
      ],
      image: '/assets/hospital.svg',
      route: '/healthcare-network'
    }
  ];

  return (
    <section style={styles.section} ref={sectionRef}>
      <div style={styles.backgroundPattern}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.badge}>HEALTHCARE EXCELLENCE</span>
          <h1 style={styles.h1}>
            <span className="gradient-text">Revolutionary Healthcare</span>
            <br />
            Services at Your Fingertips
          </h1>
          <p style={styles.subtitle}>
            Experience the future of healthcare with our AI-powered platform designed to make quality medical care accessible, intelligent, and personalized for everyone.
          </p>
        </div>

        <div style={styles.servicesGrid}>
          {servicesData.map((service, index) => (
            <div
              key={service.id}
              ref={el => cardRefs.current[index] = el}
              style={styles.serviceCard(index, hoveredCard === service.id, isVisible[index])}
              onClick={() => navigate(service.route)}
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.cardGlow(hoveredCard === service.id)}></div>
              <div style={styles.cardNumber}>{service.id}</div>

              <div style={styles.imageContainer}>
                <img
                  src={service.image}
                  alt={service.title}
                  style={styles.img(hoveredCard === service.id)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Healthcare+Service';
                  }}
                />
              </div>

              <div style={styles.contentArea}>
                <h3 style={styles.cardTitle}>{service.title}</h3>
                <p style={styles.cardDesc}>{service.description}</p>

                <div style={styles.featuresContainer}>
                  {service.features.map((feature, idx) => (
                    <div key={idx} style={styles.featureItem(idx)}>
                      <div style={styles.featureIcon}>✓</div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button style={styles.ctaButton(hoveredCard === service.id)}>
                  Explore Service
                  <span style={{
                    ...styles.arrow,
                    ...(hoveredCard === service.id ? styles.arrowHover : {})
                  }}>
                    →
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;