import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Send, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFeedbacksAPI, submitFeedbackAPI } from '../api/feedback.api.js';

import contactImage from '/assets/c1.svg';
import doctorXLogo from '/assets/MAINLOGO2.png';

// --- STATIC FEEDBACKS DATA ---
const staticFeedbacks = [
  {
    id: "static_1",
    name: "Kunj Maheshwari",
    message: "Your hardwork paid well. It is a nice website one can visit to check for minor health issues.",
    type: "compliment",
    rating: 5,
  },
  {
    id: "static_2",
    name: "Gopal",
    message: "Good one. 👍",
    type: "general",
    rating: 4,
  },
  {
    id: "static_3",
    name: "Abhishek Singh",
    message: "The website you designed is wonderful working very smoothly 😃",
    type: "compliment",
    rating: 5,
  },
  {
    id: "static_4",
    name: "Meesam",
    message: "Great UI, Really Well Made. Keep up Devs",
    type: "compliment",
    rating: 5,
  },
  {
    id: "static_5",
    name: "Rahul Singh",
    message: "this is great website for normal patients. Well done.",
    type: "compliment",
    rating: 5,
  },
  {
    id: "static_6",
    name: "Nishant Dixit",
    message: "Good app for future",
    type: "feature_request",
    rating: 4,
  },
  {
    id: "static_7",
    name: "Kartik",
    message: "DoctorXCare is an excellent platform for patients seeking a clear understanding of their health conditions. It helps them know which specialist to consult. It's very useful and informative!",
    type: "compliment",
    rating: 5,
  },
  {
    id: "static_8",
    name: "Prateek Singh",
    message: "Ya it's good if u fill the symptoms u know the symptoms in earlier stage ....great",
    type: "general",
    rating: 4,
  },
  {
    id: "static_9",
    name: "Saumya Singh",
    message: "This app is very informative and easy to use! It helps users learn about possible diseases and find suitable doctors quickly.",
    type: "compliment",
    rating: 5,
  },
  {
    id: "static_10",
    name: "Anuj Pratap Singh",
    message: "This app is very helpful. It provides important information for patients to understand their symptoms and find the right doctor. It's a great initiative for basic health awareness.",
    type: "general",
    rating: 5,
  },
  {
    id: "static_11",
    name: "Amardeep Deep Singh",
    message: "This is the very useful app. It's very important for general patients for their basic information to identify the disease and identify the doctor which is more important.",
    type: "general",
    rating: 5,
  },
  {
    id: "static_12",
    name: "Vikas Kumar",
    message: "Experience is good but site is too slow.",
    type: "general",
    rating: 3,
    reply: { from: "DoctorXCare (By Arun)", message: "Hi Vikas, Thank you for pointing out the performance issue. I've optimized the platform for better speed." }
  },
  {
    id: "static_13",
    name: "Mayank Mishra",
    message: "Best.",
    type: "compliment",
    rating: 5,
  },
  {
    id: "static_14",
    name: "Client Name",
    message: "All I can say in a nutshell is what an amazing work and team! I am so thankful for coming across you all.",
    type: "general",
    rating: 5,
    reply: { from: "DoctorXCare (Arun)", message: "Dear Valued Client, Your kind words truly mean the world to me. I'm honored to serve you and grateful for your trust." }
  }
];

function ContactPage() {
  const [toast, setToast] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const feedbackScrollRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    feedback_type: '',
    message: ''
  });

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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Load feedbacks — Replaced: Firestore getDocs → MongoDB backend API
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const res = await getFeedbacksAPI();
        const backendData = (res.data || []).map(doc => ({
          id: doc._id || doc.id,
          name: doc.name || 'Anonymous',
          message: doc.message || '',
          type: doc.type || 'general',
          rating: doc.rating || 5,
          reply: doc.reply || null
        }));
        setFeedbacks([...backendData, ...staticFeedbacks]);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
        setFeedbacks(staticFeedbacks);
      }
    };
    loadFeedbacks();
  }, []);

  // Animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(60px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-60px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(60px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      @keyframes rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes progress {
        0% { transform: scaleX(1); }
        100% { transform: scaleX(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .gradient-text {
        background: linear-gradient(135deg, var(--color-secondary), var(--color-third));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .feedback-scroll-container::-webkit-scrollbar { height: 8px; }
      .feedback-scroll-container::-webkit-scrollbar-track { background: transparent; }
      .feedback-scroll-container::-webkit-scrollbar-thumb { 
        background: linear-gradient(90deg, var(--color-secondary), var(--color-third)); 
        border-radius: 4px; 
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleSubmit — Replaced: Firestore addDoc → MongoDB backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message || !formData.feedback_type) {
      setToast({ type: 'error', title: 'Error', message: 'Please fill all required fields.' });
      return;
    }

    if (rating === 0) {
      setToast({ type: 'error', title: 'Rating Required', message: 'Please give us a star rating.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'N/A',
        type: formData.feedback_type,
        message: formData.message,
        rating: rating,
        status: 'new'
      };

      // Replaced: addDoc(collection(db, 'feedbacks'), ...) → MongoDB backend API
      const res = await submitFeedbackAPI(payload);
      const savedDoc = res.data;

      const newFeedback = {
        id: savedDoc._id || savedDoc.id || Date.now().toString(),
        name: formData.name,
        type: formData.feedback_type,
        message: formData.message,
        rating: rating,
        reply: null
      };

      setFeedbacks((prev) => [newFeedback, ...prev]);
      setFeedbackSubmitted(true);
      setToast({
        type: 'success',
        title: 'Feedback Sent!',
        message: 'Your feedback is now live below!'
      });

      setFormData({ name: '', email: '', phone: '', feedback_type: '', message: '' });
      setRating(0);

      setTimeout(() => {
        document.getElementById('client-feedback-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 1000);

    } catch (error) {
      console.error('Error submitting feedback: ', error);
      setToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Check your internet connection.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFeedback = () => {
    setFeedbackSubmitted(false);
    setToast(null);
  };

  const closeToast = () => setToast(null);

  const scrollFeedback = (direction) => {
    const container = feedbackScrollRef.current;
    const scrollAmount = 380;
    if (container) {
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const styles = {
    pageWrapper: {
      fontFamily: "'Merriweather', serif",
      minHeight: '100vh'
    },
    heroSection: {
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%, #ffffff 100%)',
      padding: isSmall ? '60px 16px' : isMobile ? '80px 20px' : '100px 40px',
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
    heroContent: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isSmall ? '40px' : isMobile ? '50px' : '60px',
      alignItems: 'center'
    },
    leftContent: {
      animation: 'fadeInLeft 0.8s ease-out',
      textAlign: isMobile ? 'center' : 'left'
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
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    heroTitle: {
      fontSize: isSmall ? '2rem' : isMobile ? '2.5rem' : '3.5rem',
      fontWeight: 800,
      marginBottom: '20px',
      lineHeight: 1.2,
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    heroSubtitle: {
      fontSize: isSmall ? '1rem' : isMobile ? '1.1rem' : '1.25rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      lineHeight: 1.6,
      marginBottom: '30px'
    },
    heroImage: {
      maxWidth: '100%',
      height: 'auto',
      animation: 'float 3s ease-in-out infinite',
      filter: isDarkMode ? 'brightness(0.9)' : 'brightness(1)'
    },
    formSection: {
      padding: isSmall ? '60px 16px' : isMobile ? '80px 20px' : '100px 40px',
      background: isDarkMode
        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
    },
    formCard: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: isSmall ? '32px 24px' : isMobile ? '40px 32px' : '56px 48px',
      boxShadow: isDarkMode
        ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.08)'}`,
      animation: 'scaleIn 0.6s ease-out',
      maxWidth: '800px',
      margin: '0 auto'
    },
    formTitle: {
      fontSize: isSmall ? '1.8rem' : isMobile ? '2.2rem' : '2.5rem',
      fontWeight: 800,
      marginBottom: '12px',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textAlign: 'center'
    },
    formSubtitle: {
      fontSize: isSmall ? '0.9rem' : '1rem',
      color: isDarkMode ? '#9ca3af' : '#64748b',
      textAlign: 'center',
      marginBottom: '32px'
    },
    inputGroup: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '16px'
    },
    input: {
      width: '100%',
      padding: '18px 20px',
      border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(226, 232, 240, 1)'}`,
      borderRadius: '12px',
      fontSize: '16px',
      outline: 'none',
      background: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(248, 250, 252, 1)',
      color: isDarkMode ? '#e5e7eb' : '#374151',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      fontFamily: "'Inter', sans-serif",
      boxShadow: isDarkMode
        ? '0 2px 4px rgba(0, 0, 0, 0.2)'
        : '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    textarea: {
      minHeight: isSmall ? '140px' : '160px',
      resize: 'vertical',
      lineHeight: 1.6,
      fontFamily: "'Inter', sans-serif"
    },
    ratingSection: {
      marginBottom: '24px',
      textAlign: 'left'
    },
    ratingLabel: {
      display: 'block',
      marginBottom: '12px',
      fontWeight: 600,
      fontSize: isSmall ? '0.95rem' : '1rem',
      color: isDarkMode ? '#e2e8f0' : '#374151'
    },
    starContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '8px'
    },
    ratingText: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#fbbf24',
      display: 'block'
    },
    submitButton: (isSubmitting) => ({
      width: '100%',
      padding: isSmall ? '18px 24px' : '20px 32px',
      background: isSubmitting
        ? 'rgba(13, 157, 184, 0.7)'
        : 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 700,
      fontSize: '16px',
      cursor: isSubmitting ? 'wait' : 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: isSubmitting
        ? '0 4px 12px rgba(13, 157, 184, 0.2)'
        : '0 8px 24px rgba(13, 157, 184, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '24px',
      opacity: isSubmitting ? 0.7 : 1
    }),
    successCard: {
      textAlign: 'center',
      padding: isSmall ? '40px 24px' : '56px 32px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))'
        : 'linear-gradient(135deg, rgba(209, 250, 229, 1), rgba(167, 243, 208, 1))',
      borderRadius: '20px',
      border: `2px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`
    },
    successIcon: {
      fontSize: isSmall ? '3rem' : '4rem',
      color: '#10b981',
      marginBottom: '20px'
    },
    successTitle: {
      fontSize: isSmall ? '1.5rem' : '1.8rem',
      fontWeight: 700,
      color: isDarkMode ? '#6ee7b7' : '#065f46',
      marginBottom: '12px'
    },
    successText: {
      fontSize: isSmall ? '0.95rem' : '1.05rem',
      color: isDarkMode ? '#a7f3d0' : '#047857',
      marginBottom: '24px',
      lineHeight: 1.6
    },
    editButton: {
      padding: '12px 32px',
      background: 'transparent',
      border: `2px solid ${isDarkMode ? '#6ee7b7' : '#10b981'}`,
      color: isDarkMode ? '#6ee7b7' : '#065f46',
      borderRadius: '10px',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    feedbackSection: {
      padding: isSmall ? '60px 16px' : isMobile ? '80px 20px' : '100px 40px',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      position: 'relative'
    },
    feedbackHeader: {
      textAlign: 'center',
      marginBottom: isSmall ? '40px' : '60px'
    },
    feedbackTitle: {
      fontSize: isSmall ? '1.8rem' : isMobile ? '2.2rem' : '2.8rem',
      fontWeight: 800,
      marginBottom: '12px',
      color: isDarkMode ? '#f9fafb' : '#0f172a'
    },
    feedbackSubtitle: {
      fontSize: isSmall ? '1rem' : isMobile ? '1.1rem' : '1.3rem',
      fontWeight: 600,
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    feedbackCarousel: {
      position: 'relative',
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    navButton: {
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      border: 'none',
      borderRadius: '50%',
      width: isSmall ? '36px' : '44px',
      height: isSmall ? '36px' : '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'white',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(13, 157, 184, 0.3)',
      flexShrink: 0
    },
    feedbackScroll: {
      display: 'flex',
      gap: '20px',
      overflowX: 'auto',
      padding: '10px 5px 20px',
      scrollBehavior: 'smooth',
      flex: 1
    },
    feedbackCard: {
      minWidth: isSmall ? '280px' : '360px',
      maxWidth: isSmall ? '280px' : '360px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : '#ffffff',
      borderRadius: '20px',
      padding: isSmall ? '24px' : '28px',
      boxShadow: isDarkMode
        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
        : '0 10px 40px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
      flexShrink: 0,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
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
    starRating: {
      display: 'flex',
      gap: '4px',
      marginBottom: '8px'
    },
    quoteIcon: {
      fontSize: '3rem',
      color: isDarkMode ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)',
      lineHeight: '0.5',
      fontFamily: 'serif',
      textAlign: 'left'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-third))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 700,
      fontSize: '1.2rem',
      flexShrink: 0
    },
    userName: {
      fontWeight: 700,
      fontSize: isSmall ? '0.95rem' : '1.05rem',
      color: isDarkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '4px'
    },
    userType: {
      fontSize: '0.8rem',
      color: isDarkMode ? '#60a5fa' : '#0d9db8',
      textTransform: 'capitalize',
      fontWeight: 600
    },
    feedbackMessage: {
      color: isDarkMode ? '#cbd5e1' : '#475569',
      lineHeight: 1.6,
      fontSize: isSmall ? '0.85rem' : '0.95rem',
      flex: 1
    },
    replyBox: {
      background: isDarkMode
        ? 'rgba(13, 157, 184, 0.1)'
        : 'rgba(224, 242, 254, 0.5)',
      padding: '14px',
      borderRadius: '12px',
      borderLeft: '3px solid var(--color-secondary)',
      marginTop: '8px'
    },
    replyHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    replyLogo: {
      width: '24px',
      height: '24px',
      borderRadius: '50%'
    },
    replyFrom: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: isDarkMode ? '#60a5fa' : '#0d9db8'
    },
    replyMessage: {
      fontSize: '0.85rem',
      color: isDarkMode ? '#cbd5e1' : '#334155',
      lineHeight: 1.5,
      margin: 0
    },
    backLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: isDarkMode ? '#94a3b8' : '#64748b',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: 500,
      marginTop: '24px',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <div style={styles.leftContent}>
              <span style={styles.badge}>GET IN TOUCH</span>
              <h1 style={styles.heroTitle}>
                <span className="gradient-text">Share Your Experience</span>
                <br />
                With DoctorXCare
              </h1>
              <p style={styles.heroSubtitle}>
                Your feedback drives our innovation. Help us create a better healthcare experience
                by sharing your thoughts, suggestions, and experiences with our platform.
              </p>
            </div>
            <div style={{ animation: 'fadeInRight 0.8s ease-out' }}>
              <img src={contactImage} alt="Contact" style={styles.heroImage} />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section style={styles.formSection}>
        <div style={styles.container}>
          <div style={styles.formCard}>
            {feedbackSubmitted ? (
              <div style={styles.successCard}>
                <CheckCircle style={styles.successIcon} />
                <h3 style={styles.successTitle}>Thank You for Your Feedback!</h3>
                <p style={styles.successText}>
                  We've received your message and rating. Your input helps us improve and serve you better.
                  Check out what others are saying below!
                </p>
                <button onClick={handleEditFeedback} style={styles.editButton}>
                  Send Another Feedback
                </button>
              </div>
            ) : (
              <>
                <h2 style={styles.formTitle}>Share Your Feedback</h2>
                <p style={styles.formSubtitle}>
                  Tell us about your experience and help us improve our services
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={styles.inputGroup}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={styles.input}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number (Optional)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                    <select
                      name="feedback_type"
                      value={formData.feedback_type}
                      onChange={handleInputChange}
                      style={{ ...styles.input, cursor: 'pointer' }}
                      required
                    >
                      <option value="">Select Feedback Type *</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="compliment">Compliment</option>
                      <option value="complaint">Complaint</option>
                      <option value="bug_report">Bug Report</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="general">General Feedback</option>
                    </select>
                  </div>

                  <textarea
                    name="message"
                    placeholder="Share your detailed feedback here... Tell us about your experience, suggestions for improvement, or any issues you've encountered. *"
                    value={formData.message}
                    onChange={handleInputChange}
                    style={{ ...styles.input, ...styles.textarea }}
                    required
                  />

                  <div style={styles.ratingSection}>
                    <label style={styles.ratingLabel}>Rate Your Experience *</label>
                    <div style={styles.starContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={32}
                          fill={star <= (hoverRating || rating) ? '#fbbf24' : 'transparent'}
                          color={star <= (hoverRating || rating) ? '#fbbf24' : (isDarkMode ? '#94a3b8' : '#cbd5e1')}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        />
                      ))}
                    </div>
                    {rating > 0 && (
                      <span style={styles.ratingText}>
                        {rating === 5 ? 'Excellent! 🎉' : rating === 4 ? 'Very Good! 😊' : rating === 3 ? 'Good 🙂' : rating === 2 ? 'Fair 😐' : 'Poor 😞'}
                      </span>
                    )}
                  </div>

                  <button type="submit" disabled={isSubmitting} style={styles.submitButton(isSubmitting)}>
                    {isSubmitting ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '3px solid white',
                          borderRadius: '50%',
                          animation: 'rotation 1s linear infinite'
                        }}></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>

                <Link to="/" style={styles.backLink}>
                  ← Back to Home
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="client-feedback-section" style={styles.feedbackSection}>
        <div style={styles.container}>
          <div style={styles.feedbackHeader}>
            <h2 style={styles.feedbackTitle}>What Our Clients</h2>
            <h3 style={styles.feedbackSubtitle}>Are Saying About DoctorXCare</h3>
          </div>

          <div style={styles.feedbackCarousel}>
            <button
              onClick={() => scrollFeedback('left')}
              style={styles.navButton}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <ChevronLeft size={24} />
            </button>

            <div
              ref={feedbackScrollRef}
              className="feedback-scroll-container"
              style={styles.feedbackScroll}
            >
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  style={styles.feedbackCard}
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
                      : '0 10px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={styles.cardGlow}></div>

                  {feedback.rating && (
                    <div style={styles.starRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < feedback.rating ? '#fbbf24' : 'transparent'}
                          color={i < feedback.rating ? '#fbbf24' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  )}

                  <div style={styles.quoteIcon}>"</div>

                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>{feedback.name.charAt(0)}</div>
                    <div>
                      <div style={styles.userName}>{feedback.name}</div>
                      <div style={styles.userType}>{feedback.type}</div>
                    </div>
                  </div>

                  <p style={styles.feedbackMessage}>{feedback.message}</p>

                  {feedback.reply && (
                    <div style={styles.replyBox}>
                      <div style={styles.replyHeader}>
                        <img src={doctorXLogo} alt="DoctorXCare" style={styles.replyLogo} />
                        <span style={styles.replyFrom}>{feedback.reply.from}</span>
                      </div>
                      <p style={styles.replyMessage}>{feedback.reply.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollFeedback('right')}
              style={styles.navButton}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: isSmall ? '10px' : '20px',
          right: isSmall ? '10px' : '20px',
          left: isSmall ? '10px' : 'auto',
          zIndex: 9999,
          animation: 'slideDown 0.4s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: isDarkMode
              ? 'rgba(15, 23, 42, 0.98)'
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 1)'}`,
            borderRadius: '16px',
            padding: isSmall ? '14px 16px' : '18px 20px',
            minWidth: isSmall ? 'unset' : '350px',
            maxWidth: isSmall ? 'unset' : '450px',
            boxShadow: isDarkMode
              ? '0 10px 40px rgba(0, 0, 0, 0.4)'
              : '0 10px 40px rgba(0, 0, 0, 0.15)',
            borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '16px',
              fontWeight: 700,
              background: toast.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white'
            }}>
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 700,
                fontSize: isSmall ? '0.95rem' : '1rem',
                color: isDarkMode ? '#f8fafc' : '#1f2937',
                marginBottom: '4px'
              }}>
                {toast.title}
              </div>
              <div style={{
                fontSize: isSmall ? '0.85rem' : '0.9rem',
                color: isDarkMode ? '#cbd5e1' : '#6b7280',
                lineHeight: 1.4
              }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={closeToast}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '20px',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.color = isDarkMode ? '#f3f4f6' : '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              width: '100%',
              background: toast.type === 'success'
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #ef4444, #dc2626)',
              transformOrigin: 'left',
              animation: 'progress 6s linear forwards'
            }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactPage;