import React, { useState, useEffect, useRef } from 'react';

function Audience() {
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
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: 1.6,
      animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
    },
    audienceGrid: {
      display: 'grid',
      gridTemplateColumns: isSmall
        ? '1fr'
        : isMobile
          ? 'repeat(auto-fit, minmax(300px, 1fr))'
          : 'repeat(auto-fit, minmax(380px, 1fr))',
      gap: isSmall ? '24px' : isMobile ? '30px' : '40px',
      marginTop: isSmall ? '40px' : '60px'
    },
    audienceCard: (index, isHovered, isVisibleCard) => ({
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
      transform: isVisibleCard
        ? isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'
        : 'translateY(60px) scale(0.95)',
      animation: isVisibleCard ? `fadeInUp 0.6s ease-out ${index * 0.15}s backwards` : 'none',
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
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
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
      fontSize: isSmall ? '1.4rem' : isMobile ? '1.5rem' : '1.75rem',
      fontWeight: 700,
      marginBottom: '16px',
      fontFamily: "'Merriweather', serif",
      lineHeight: 1.3,
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    cardDesc: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.7,
      marginBottom: '24px'
    },
    featuresContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
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
    featureText: {
      flex: 1
    },
    featureTitle: {
      fontWeight: 600,
      color: isDarkMode ? '#f3f4f6' : '#1e293b',
      marginBottom: '2px'
    },
    featureDesc: {
      fontSize: isSmall ? '0.8rem' : '0.85rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.5
    },
    statsBar: {
      marginTop: '24px',
      padding: '16px',
      background: isDarkMode
        ? 'rgba(13, 157, 184, 0.1)'
        : 'rgba(13, 157, 184, 0.05)',
      borderRadius: '12px',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.2)' : 'rgba(13, 157, 184, 0.1)'}`,
      textAlign: 'center'
    },
    statsText: {
      fontSize: isSmall ? '0.75rem' : '0.8rem',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  const audienceData = [
    {
      id: 1,
      title: 'For Individuals',
      description: 'Empower yourself with intelligent health insights and instant medical guidance powered by advanced AI technology.',
      image: '/assets/wtt-1.svg',
      features: [
        {
          title: 'Instant AI Diagnosis',
          desc: 'Get immediate symptom analysis with clinical-grade accuracy, available 24/7 without appointments.'
        },
        {
          title: 'Medical Knowledge Library',
          desc: 'Access thousands of verified health articles, condition guides, and treatment information.'
        },
        {
          title: 'Smart Health Recommendations',
          desc: 'Receive personalized advice on whether to self-care, book an appointment, or seek emergency care.'
        },
        {
          title: 'Privacy-First Platform',
          desc: 'Your health data is encrypted and secure with HIPAA-compliant protection standards.'
        },
        {
          title: 'Multi-Language Support',
          desc: 'Healthcare guidance available in your preferred language for better understanding.'
        }
      ],
      stat: 'Trusted by Individuals'
    },
    {
      id: 2,
      title: 'For Parents',
      description: 'Specialized pediatric care guidance that helps you make informed decisions about your child\'s health with confidence.',
      image: '/assets/wtt-2.svg',
      features: [
        {
          title: 'Pediatric AI Specialist',
          desc: 'Age-specific symptom analysis tailored for newborns, toddlers, children, and teenagers.'
        },
        {
          title: 'Emergency Alert System',
          desc: 'Instant severity detection that tells you when your child needs immediate medical attention.'
        },
        {
          title: 'Growth & Development Tracking',
          desc: 'Monitor your child\'s milestones, vaccinations, and developmental progress in one place.'
        },
        {
          title: 'Home Care Protocols',
          desc: 'Safe, pediatrician-approved remedies for common childhood illnesses and minor injuries.'
        },
        {
          title: 'Parent Community Support',
          desc: 'Connect with other parents and access expert-verified parenting health resources.'
        }
      ],
      stat: 'Supporting Families Worldwide'
    },
    {
      id: 3,
      title: 'For Caregivers',
      description: 'Comprehensive care coordination tools designed for those managing health needs of loved ones, elderly, or patients.',
      image: '/assets/wtt-3.svg',
      features: [
        {
          title: 'Remote Health Monitoring',
          desc: 'Check symptoms and track health status for family members, even from a distance.'
        },
        {
          title: 'Care Coordination Hub',
          desc: 'Organize medications, appointments, and medical records in a centralized dashboard.'
        },
        {
          title: 'Medical Report Generator',
          desc: 'Create detailed symptom reports to share with doctors for accurate diagnosis and treatment.'
        },
        {
          title: 'Elderly Care Protocols',
          desc: 'Specialized guidance for age-related conditions, medication management, and fall prevention.'
        },
        {
          title: 'Emergency Response Guide',
          desc: 'Step-by-step crisis management instructions for critical health situations at home.'
        }
      ],
      stat: 'Empowering multiple Caregivers Daily'
    }
  ];

  return (
    <section style={styles.section} ref={sectionRef}>
      <div style={styles.backgroundPattern}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.badge}>PERSONALIZED HEALTHCARE</span>
          <h1 style={styles.h1}>
            <span className="gradient-text">Healthcare Solutions</span>
            <br />
            Designed for Every Life Stage
          </h1>
          <p style={styles.subtitle}>
            Whether you're managing your own health, caring for your children, or supporting loved ones,
            our AI-powered platform provides intelligent guidance tailored to your unique needs and responsibilities.
          </p>
        </div>

        <div style={styles.audienceGrid}>
          {audienceData.map((audience, index) => (
            <div
              key={audience.id}
              ref={el => cardRefs.current[index] = el}
              style={styles.audienceCard(index, hoveredCard === audience.id, isVisible[index])}
              onMouseEnter={() => setHoveredCard(audience.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.cardGlow(hoveredCard === audience.id)}></div>

              <div style={styles.imageContainer}>
                <img
                  src={audience.image}
                  alt={audience.title}
                  style={styles.img(hoveredCard === audience.id)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Healthcare';
                  }}
                />
              </div>

              <div style={styles.contentArea}>
                <h3 style={styles.cardTitle}>{audience.title}</h3>
                <p style={styles.cardDesc}>{audience.description}</p>

                <div style={styles.featuresContainer}>
                  {audience.features.map((feature, idx) => (
                    <div key={idx} style={styles.featureItem(idx)}>
                      <div style={styles.featureIcon}>✓</div>
                      <div style={styles.featureText}>
                        <div style={styles.featureTitle}>{feature.title}</div>
                        <div style={styles.featureDesc}>{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.statsBar}>
                  <div style={styles.statsText}>{audience.stat}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Audience;