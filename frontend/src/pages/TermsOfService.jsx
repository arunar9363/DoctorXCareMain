import React, { useState, useEffect } from 'react';

function TermsOfService() {
  const [activeSection, setActiveSection] = useState('term-important');
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      const sectionIds = [
        'term-important',
        'term-general',
        'term-liability',
        'term-services',
        'term-agreement',
        'term-usage',
        'term-termination',
        'term-ip',
        'term-support',
        'term-privacy',
        'term-company',
        'term-final'
      ];

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall = window.matchMedia('(max-width: 480px)').matches;

  const styles = {
    pageWrapper: {
      padding: isSmall ? '80px 16px 60px' : isMobile ? '100px 20px 80px' : '140px 40px 100px',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
      minHeight: '100vh',
      position: 'relative'
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
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
    },
    header: {
      textAlign: 'center',
      marginBottom: isSmall ? '40px' : isMobile ? '50px' : '60px'
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
      fontSize: isSmall ? '2rem' : isMobile ? '2.5rem' : '3rem',
      fontWeight: 800,
      marginBottom: '12px',
      fontFamily: "'Merriweather', serif",
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.2
    },
    subtitle: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      maxWidth: '700px',
      margin: '0 auto'
    },
    navigationWrapper: {
      position: 'sticky',
      top: isSmall ? '60px' : isMobile ? '70px' : '80px',
      zIndex: 100,
      marginBottom: isSmall ? '30px' : '40px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'
        : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: isSmall ? '12px' : '16px',
      boxShadow: isDarkMode
        ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
        : '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.08)'}`
    },
    navigation: {
      display: 'flex',
      gap: isSmall ? '6px' : '8px',
      overflowX: 'auto',
      padding: '4px',
      scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'thin',
      scrollbarColor: isDarkMode ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9'
    },
    navLink: (isActive) => ({
      padding: isSmall ? '8px 12px' : '10px 16px',
      borderRadius: '10px',
      fontSize: isSmall ? '0.75rem' : '0.85rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      background: isActive
        ? 'linear-gradient(135deg, var(--color-secondary), var(--color-third))'
        : 'transparent',
      color: isActive
        ? '#ffffff'
        : isDarkMode ? '#9ca3af' : '#64748b',
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: isActive
        ? '0 4px 12px rgba(13, 157, 184, 0.3)'
        : 'none'
    }),
    contentCard: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: isSmall ? '24px' : isMobile ? '32px' : '48px',
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
        : '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.08)'}`
    },
    sectionTitle: {
      fontSize: isSmall ? '1.3rem' : isMobile ? '1.5rem' : '1.75rem',
      fontWeight: 700,
      marginTop: '40px',
      marginBottom: '20px',
      fontFamily: "'Merriweather', serif",
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      paddingBottom: '12px',
      borderBottom: `2px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`
    },
    firstSectionTitle: {
      marginTop: 0
    },
    paragraph: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      lineHeight: 1.8,
      color: isDarkMode ? '#d1d5db' : '#475569',
      marginBottom: '16px'
    },
    warningBox: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(254, 226, 226, 1) 0%, rgba(254, 202, 202, 1) 100%)',
      border: `2px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(220, 38, 38, 0.3)'}`,
      borderRadius: '16px',
      padding: isSmall ? '16px' : '20px',
      marginBottom: '24px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    },
    warningIcon: {
      fontSize: isSmall ? '1.3rem' : '1.5rem',
      flexShrink: 0,
      marginTop: '2px'
    },
    warningText: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      lineHeight: 1.7,
      color: isDarkMode ? '#fca5a5' : '#991b1b',
      fontWeight: 500,
      margin: 0
    },
    importantBox: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(224, 242, 254, 1) 0%, rgba(186, 230, 253, 1) 100%)',
      border: `2px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.4)' : 'rgba(13, 157, 184, 0.3)'}`,
      borderRadius: '16px',
      padding: isSmall ? '16px' : '20px',
      marginBottom: '24px'
    },
    importantTitle: {
      fontSize: isSmall ? '1rem' : '1.1rem',
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0c4a6e',
      marginBottom: '8px'
    },
    divider: {
      height: '1px',
      background: isDarkMode
        ? 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent)',
      margin: '32px 0',
      border: 'none'
    },
    contactOptions: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isSmall ? '16px' : '20px',
      marginTop: '24px',
      marginBottom: '24px'
    },
    supportOption: {
      background: isDarkMode
        ? 'rgba(30, 41, 59, 0.5)'
        : 'rgba(248, 250, 252, 1)',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 1)'}`,
      borderRadius: '16px',
      padding: isSmall ? '16px' : '20px',
      transition: 'all 0.3s ease'
    },
    supportOptionTitle: {
      fontSize: isSmall ? '1rem' : '1.1rem',
      fontWeight: 700,
      color: isDarkMode ? '#f9fafb' : '#0f172a',
      marginBottom: '8px'
    },
    supportOptionDescription: {
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      marginBottom: '12px'
    },
    supportEmail: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      fontWeight: 600,
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.3s ease'
    },
    responseTimeBox: {
      background: isDarkMode
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(209, 250, 229, 1)',
      border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
      borderRadius: '12px',
      padding: isSmall ? '12px 16px' : '14px 20px',
      fontSize: isSmall ? '0.85rem' : '0.9rem',
      color: isDarkMode ? '#6ee7b7' : '#065f46',
      fontWeight: 600,
      textAlign: 'center',
      marginTop: '24px'
    },
    companyInfoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isSmall ? '16px' : '20px',
      marginTop: '24px',
      marginBottom: '24px'
    },
    companyInfoCard: {
      background: isDarkMode
        ? 'rgba(30, 41, 59, 0.5)'
        : 'rgba(248, 250, 252, 1)',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 1)'}`,
      borderRadius: '16px',
      padding: isSmall ? '16px' : '20px'
    },
    companyInfoLabel: {
      fontSize: isSmall ? '0.75rem' : '0.8rem',
      fontWeight: 600,
      color: isDarkMode ? '#9ca3af' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    },
    companyInfoValue: {
      fontSize: isSmall ? '0.95rem' : '1.05rem',
      fontWeight: 700,
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    companyDescription: {
      background: isDarkMode
        ? 'rgba(13, 157, 184, 0.1)'
        : 'rgba(224, 242, 254, 1)',
      border: `1px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
      borderRadius: '12px',
      padding: isSmall ? '16px' : '20px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      lineHeight: 1.7,
      color: isDarkMode ? '#93c5fd' : '#0c4a6e',
      fontWeight: 500
    },
    effectiveDate: {
      display: 'inline-block',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(224, 242, 254, 1) 0%, rgba(186, 230, 253, 1) 100%)',
      border: `2px solid ${isDarkMode ? 'rgba(13, 157, 184, 0.4)' : 'rgba(13, 157, 184, 0.3)'}`,
      borderRadius: '12px',
      padding: isSmall ? '12px 20px' : '14px 24px',
      fontSize: isSmall ? '0.9rem' : '1rem',
      fontWeight: 700,
      color: isDarkMode ? '#60a5fa' : '#0c4a6e',
      marginTop: '24px'
    },
    strongText: {
      fontWeight: 700,
      color: isDarkMode ? '#f9fafb' : '#1e293b'
    }
  };

  const navItems = [
    { id: 'term-important', label: 'Important' },
    { id: 'term-general', label: '1. General' },
    { id: 'term-liability', label: '2. Liability' },
    { id: 'term-services', label: '3. Services' },
    { id: 'term-agreement', label: '4. Agreement' },
    { id: 'term-usage', label: '5. Usage' },
    { id: 'term-termination', label: '6. Termination' },
    { id: 'term-ip', label: '7. IP Rights' },
    { id: 'term-support', label: '8. Support' },
    { id: 'term-privacy', label: '9. Privacy' },
    { id: 'term-company', label: '10. Company' },
    { id: 'term-final', label: '11. Final' }
  ];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.backgroundPattern}></div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.badge}>LEGAL DOCUMENTS</span>
          <h1 style={styles.title}>Terms of Service</h1>
          <p style={styles.subtitle}>
            Please read these terms carefully before using DoctorXCare services
          </p>
        </div>

        {/* Sticky Navigation */}
        <div style={styles.navigationWrapper}>
          <nav style={styles.navigation}>
            {navItems.map((item) => (
              <a
                key={item.id}
                style={styles.navLink(activeSection === item.id)}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                href={`#${item.id}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div style={styles.contentCard}>
          {/* IMPORTANT NOTE */}
          <h2 id="term-important" style={{ ...styles.sectionTitle, ...styles.firstSectionTitle }}>
            IMPORTANT NOTE
          </h2>

          <p style={styles.paragraph}>
            DoctorXCare is a digital health information platform designed for educational and wellness purposes only.
            It is not intended to provide a medical diagnosis, treatment, or professional healthcare advice.
          </p>

          <div style={styles.importantBox}>
            <div style={styles.importantTitle}>Universal Regulatory Status:</div>
            <p style={styles.paragraph}>
              DoctorXCare is <span style={styles.strongText}>not a licensed medical device</span>. It has not been registered,
              reviewed, certified, or approved by any governmental or medical regulatory authority worldwide. This includes,
              but is not limited to, the CDSCO (India), the FDA (United States), and the EMA (European Union).
            </p>
          </div>

          <div style={styles.importantBox}>
            <div style={styles.importantTitle}>User Responsibility:</div>
            <p style={styles.paragraph}>
              You are solely responsible for ensuring that your use of this platform is compliant with the laws and
              regulations of your jurisdiction. Do not use this tool if your local laws classify platforms like this
              as a regulated medical device requiring formal certification.
            </p>
          </div>

          <div style={styles.warningBox}>
            <span style={styles.warningIcon}>⚠️</span>
            <p style={styles.warningText}>
              DoctorXCare does not provide a medical diagnosis. It is intended to help you better understand your
              symptoms and prepare for a consultation with a licensed healthcare professional. Always seek professional
              medical advice before making healthcare decisions. If you experience an emergency, call your local
              emergency number immediately.
            </p>
          </div>

          <hr style={styles.divider} />

          {/* §1. GENERAL PROVISIONS */}
          <h2 id="term-general" style={styles.sectionTitle}>1. General Provisions</h2>
          <p style={styles.paragraph}>
            These Terms of Service govern the use of the DoctorXCare website and mobile application, including: rules
            for using DoctorXCare services, the rights and obligations of DoctorXCare and its users, territorial
            limitations of use, disclaimers regarding liability.
          </p>
          <p style={styles.paragraph}>
            By using DoctorXCare, you agree to these Terms of Service.
          </p>

          <hr style={styles.divider} />

          {/* §2. ACKNOWLEDGMENTS & LIABILITY */}
          <h2 id="term-liability" style={styles.sectionTitle}>2. Acknowledgments & Liability</h2>
          <p style={styles.paragraph}>
            DoctorXCare provides informational and educational content only. DoctorXCare is not a replacement for
            professional medical advice, diagnosis, or treatment.
          </p>
          <p style={styles.paragraph}>
            Do not use DoctorXCare in emergency situations — always contact emergency services.
          </p>
          <p style={styles.paragraph}>
            Users must not rely solely on DoctorXCare results to make medical decisions. Always consult a doctor.
            Any medicines, treatments, or medical steps should only be taken after professional consultation.
          </p>
          <p style={styles.paragraph}>
            DoctorXCare may be unavailable from time to time due to updates, maintenance, or unforeseen issues.
          </p>
          <p style={styles.paragraph}>
            DoctorXCare is not liable for: user actions based on the information provided, third-party services or
            websites linked from DoctorXCare, hardware/software issues on the user's device, misuse of the application
            outside allowed jurisdictions, Force Majeure events (e.g., natural disasters, strikes, technical outages).
          </p>

          <hr style={styles.divider} />

          {/* §3. SERVICES */}
          <h2 id="term-services" style={styles.sectionTitle}>3. Services Provided</h2>
          <p style={styles.paragraph}>
            DoctorXCare currently provides several services: our interactive <span style={styles.strongText}>Symptom Checker</span>,
            where users can input symptoms to understand possible health conditions; a focused <span style={styles.strongText}>Disease
              Information Library</span> with articles on a select number of health topics; and <span style={styles.strongText}>Global
                Health Updates</span>, featuring the latest news from the World Health Organization (WHO).
          </p>
          <p style={styles.paragraph}>
            DoctorXCare may expand or restrict services at any time. All services are provided free of charge for
            personal use, unless otherwise stated.
          </p>

          <hr style={styles.divider} />

          {/* §4. USER AGREEMENT */}
          <h2 id="term-agreement" style={styles.sectionTitle}>4. User Agreement</h2>
          <p style={styles.paragraph}>
            By accessing and using the DoctorXCare website, you agree to be bound by these Terms of Service. If you
            do not agree with these terms, you must immediately cease using the website.
          </p>
          <p style={styles.paragraph}>
            The services provided on this website are intended for voluntary use by adults (18 years of age or older).
            DoctorXCare reserves the right to introduce, modify, or remove services in the future, which may include
            additional features such as advanced reports.
          </p>

          <hr style={styles.divider} />

          {/* §5. ACCEPTABLE USE */}
          <h2 id="term-usage" style={styles.sectionTitle}>5. Acceptable Use Policy</h2>
          <p style={styles.paragraph}>
            Users must not:
          </p>
          <ul style={{ ...styles.paragraph, paddingLeft: isSmall ? '20px' : '24px' }}>
            <li style={{ marginBottom: '8px' }}>Upload, share, or promote unlawful or harmful content</li>
            <li style={{ marginBottom: '8px' }}>Use DoctorXCare for advertising or commercial promotion without written consent</li>
            <li style={{ marginBottom: '8px' }}>Attempt to hack, disrupt, or reverse-engineer DoctorXCare systems</li>
            <li style={{ marginBottom: '8px' }}>Misuse results for self-treatment without consulting a doctor</li>
          </ul>
          <p style={styles.paragraph}>
            DoctorXCare reserves the right to suspend accounts or restrict access if misuse is detected.
          </p>

          <hr style={styles.divider} />

          {/* §6. TERMINATION */}
          <h2 id="term-termination" style={styles.sectionTitle}>6. Termination of Use</h2>
          <p style={styles.paragraph}>
            Users may stop using DoctorXCare anytime. DoctorXCare may suspend or terminate services if a user violates
            these Terms.
          </p>

          <hr style={styles.divider} />

          {/* §7. INTELLECTUAL PROPERTY */}
          <h2 id="term-ip" style={styles.sectionTitle}>7. Intellectual Property</h2>
          <p style={styles.paragraph}>
            All content, design, and software of DoctorXCare are protected by copyright. Users are granted a limited,
            non-transferable license to use DoctorXCare for personal, non-commercial purposes.
          </p>
          <p style={styles.paragraph}>
            Users may not copy, modify, or distribute DoctorXCare's intellectual property without prior consent.
          </p>

          <hr style={styles.divider} />

          {/* §8. COMPLAINTS & SUPPORT */}
          <h2 id="term-support" style={styles.sectionTitle}>8. Complaints & Support</h2>
          <p style={styles.paragraph}>
            For any complaints, queries, or feedback, we're here to help. You can reach us through the following channels:
          </p>

          <div style={styles.contactOptions}>
            <div style={styles.supportOption}>
              <div style={styles.supportOptionTitle}>General Support</div>
              <div style={styles.supportOptionDescription}>
                For support queries and assistance
              </div>
              <a href="mailto:support@doctorxcare.in" style={styles.supportEmail}>
                support@doctorxcare.in
              </a>
            </div>

            <div style={styles.supportOption}>
              <div style={styles.supportOptionTitle}>Contact & Inquiries</div>
              <div style={styles.supportOptionDescription}>
                For general inquiries and feedback
              </div>
              <a href="mailto:contact@doctorxcare.in" style={styles.supportEmail}>
                contact@doctorxcare.in
              </a>
            </div>
          </div>

          <div style={styles.responseTimeBox}>
            ✓ We aim to respond to all inquiries within 14 business days
          </div>

          <hr style={styles.divider} />

          {/* §9. PRIVACY & COOKIES */}
          <h2 id="term-privacy" style={styles.sectionTitle}>9. Privacy & Cookies</h2>
          <p style={styles.paragraph}>
            Your privacy is fundamental to how DoctorXCare operates. We want to be clear: <span style={styles.strongText}>we
              do not store the personal symptom or health data you enter</span>. The only personal information we collect is
            the minimal data required for account purposes, such as your email address for login.
          </p>
          <p style={styles.paragraph}>
            Any data we do hold is stored securely, never sold, and you can find full details in our Privacy Policy and
            Cookies Policy.
          </p>

          <hr style={styles.divider} />

          {/* §10. COMPANY INFORMATION */}
          <h2 id="term-company" style={styles.sectionTitle}>10. Company Information</h2>

          <div style={styles.companyInfoGrid}>
            <div style={styles.companyInfoCard}>
              <div style={styles.companyInfoLabel}>Business Name</div>
              <div style={styles.companyInfoValue}>DoctorXCare</div>
            </div>

            <div style={styles.companyInfoCard}>
              <div style={styles.companyInfoLabel}>MSME Registration</div>
              <div style={styles.companyInfoValue}>Udyam-UP-28-0186274</div>
            </div>

            <div style={styles.companyInfoCard}>
              <div style={styles.companyInfoLabel}>Enterprise Type</div>
              <div style={styles.companyInfoValue}>Micro, Small and Medium Enterprise</div>
            </div>

            <div style={styles.companyInfoCard}>
              <div style={styles.companyInfoLabel}>Registered Under</div>
              <div style={styles.companyInfoValue}>Government of India</div>
            </div>
          </div>

          <div style={styles.companyDescription}>
            DoctorXCare is officially registered with the Ministry of Micro, Small and Medium Enterprises, Government
            of India, ensuring compliance with national business standards and regulations.
          </div>

          <hr style={styles.divider} />

          {/* §11. FINAL PROVISIONS */}
          <h2 id="term-final" style={styles.sectionTitle}>11. Final Provisions</h2>
          <p style={styles.paragraph}>
            Use of DoctorXCare involves typical risks of online services (e.g., malware, hacking, phishing). DoctorXCare
            takes necessary steps to secure user data but cannot guarantee absolute security.
          </p>
          <p style={styles.paragraph}>
            DoctorXCare may update these Terms of Service at any time. Continued use means acceptance of changes.
          </p>
          <p style={styles.paragraph}>
            <span style={styles.strongText}>Governing Law:</span> These Terms are subject to the laws of India, with user
            protections as per local consumer law.
          </p>

          <div style={styles.effectiveDate}>
            📅 Effective Date: September 20, 2025
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;