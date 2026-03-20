import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ScrollSpy from "bootstrap/js/dist/scrollspy";
import { Linkedin, Mail } from 'lucide-react';

function About() {
  const [, setIsVisible] = useState({});
  const [, setIsDarkMode] = useState(false);
  const cardRefs = useRef([]);

  useEffect(() => {
    const spy = new ScrollSpy(document.body, {
      target: "#top-navigation",
      offset: 140,
    });
    spy.refresh();

    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
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

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap');

    :root {
      --color-primary: #ffffff;
      --color-secondary: #0d9db8;
      --color-third: #3b82f6;
      --color-fourth: #d1f4f9;
      --color-dark: #1a1a1a;
      --gradient-primary: linear-gradient(135deg, #0d9db8 0%, #3b82f6 100%);
      --gradient-secondary: linear-gradient(135deg, rgba(13, 157, 184, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    }

    [data-theme="dark"] {
      --color-primary: #121212;
      --color-secondary: #0d9db8;
      --color-third: #60a5fa;
      --color-fourth: #1f2937;
      --color-dark: #e5e7eb;
      --gradient-secondary: linear-gradient(135deg, rgba(13, 157, 184, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%);
    }

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

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
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

    .allContainer {
      min-height: 100vh;
      background: var(--color-primary);
      transition: background-color 0.3s ease;
      padding-top: 80px;
      position: relative;
    }

    .allContainer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 600px;
      background: linear-gradient(135deg, rgba(13, 157, 184, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%);
      pointer-events: none;
      z-index: 0;
    }

    [data-theme="dark"] .allContainer::before {
      background: linear-gradient(135deg, rgba(13, 157, 184, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%);
    }

    .about-container {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 80px;
      padding: 60px 20px;
    }

    .hero-badge {
      display: inline-block;
      padding: 10px 24px;
      background: var(--gradient-secondary);
      border: 1px solid rgba(13, 157, 184, 0.2);
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--color-secondary);
      margin-bottom: 24px;
      animation: scaleIn 0.6s ease-out;
    }

    .about-container h2 {
      font-weight: 800 !important;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
      font-family: "Merriweather", serif;
      font-size: 3.5rem;
      line-height: 1.2;
      animation: fadeInUp 0.8s ease-out;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: var(--color-dark);
      opacity: 0.8;
      max-width: 800px;
      margin: 0 auto 40px;
      line-height: 1.7;
      animation: fadeInUp 0.8s ease-out 0.2s backwards;
    }

    .team-members-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 50px;
      margin-bottom: 80px;
    }

    .team-member-card {
      background: var(--color-primary);
      border-radius: 24px;
      padding: 50px;
      border: 1px solid rgba(13, 157, 184, 0.1);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    [data-theme="dark"] .team-member-card {
      background: var(--color-fourth);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(13, 157, 184, 0.2);
    }

    .team-member-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px rgba(13, 157, 184, 0.2);
    }

    [data-theme="dark"] .team-member-card:hover {
      box-shadow: 0 20px 60px rgba(13, 157, 184, 0.3);
    }

    .team-member-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .team-member-card:hover::before {
      opacity: 1;
    }

    .profile-image-wrapper {
      position: relative;
      width: 220px;
      height: 220px;
      margin: 0 auto 30px;
    }

    .image-container {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid transparent;
      background: var(--gradient-primary);
      padding: 4px;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
    }

    .profile-image-wrapper:hover .image-container {
      transform: scale(1.05);
      box-shadow: 0 15px 40px rgba(13, 157, 184, 0.3);
    }

    .profile-image-circle {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      transition: transform 0.4s ease;
    }

    .profile-image-wrapper:hover .profile-image-circle {
      transform: scale(1.1);
    }

    .profile-badge {
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--gradient-primary);
      color: #ffffff;
      padding: 10px 24px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      white-space: nowrap;
      z-index: 10;
      box-shadow: 0 6px 20px rgba(13, 157, 184, 0.3);
      animation: pulse 2s ease-in-out infinite;
    }

    .profile-info-box {
      text-align: center;
      padding: 20px 0;
    }

    .profile-name {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-secondary);
      font-family: "Merriweather", serif;
      margin-bottom: 8px;
    }

    .profile-name-bio {
      font-size: 1.05rem;
      color: var(--color-dark);
      font-weight: 500;
      opacity: 0.7;
      margin-bottom: 12px;
    }

    .profile-title {
      font-size: 1.15rem;
      color: var(--color-third);
      font-weight: 600;
      margin: 0;
    }

    .profile-bio {
      font-size: 1.05rem;
      line-height: 1.8;
      color: var(--color-dark);
      text-align: justify;
      margin: 30px 0;
    }

    .profile-bio strong {
      color: var(--color-secondary);
      font-weight: 600;
    }

    .social-links-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 30px;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 14px 24px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      border: 2px solid;
      color: var(--color-dark);
    }

    .linkedin-link {
      color: #0a66c2;
      border-color: #0a66c2;
      background: rgba(10, 102, 194, 0.05);
    }

    .linkedin-link:hover {
      background: rgba(10, 102, 194, 0.15);
      transform: translateX(8px);
    }

    .email-link {
      color: var(--color-secondary);
      border-color: var(--color-secondary);
      background: rgba(13, 157, 184, 0.05);
    }

    .email-link:hover {
      background: rgba(13, 157, 184, 0.15);
      transform: translateX(8px);
    }

    .sticky-nav-container {
      position: sticky;
      top: 80px;
      background: var(--color-primary);
      z-index: 100;
      border-bottom: 1px solid rgba(13, 157, 184, 0.1);
      margin-bottom: 60px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .custom-nav-link {
      color: var(--color-secondary) !important;
      font-weight: 600;
      padding: 16px 20px !important;
      border-radius: 8px;
      transition: all 0.3s ease;
      white-space: nowrap;
      font-size: 0.95rem;
    }

    .custom-nav-link:hover {
      background-color: rgba(13, 157, 184, 0.1) !important;
      transform: translateY(-2px);
    }

    .custom-nav-link.active {
      background: var(--gradient-primary) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(13, 157, 184, 0.3);
    }

    .main-content-card {
      background: var(--color-primary) !important;
      border-radius: 24px;
      padding: 60px;
      border: 1px solid rgba(13, 157, 184, 0.1);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      margin-bottom: 60px;
      transition: all 0.3s ease;
    }

    [data-theme="dark"] .main-content-card {
      background: var(--color-fourth) !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(13, 157, 184, 0.2);
    }

    .main-content-card h4 {
      margin-top: 20px;
      margin-bottom: 30px;
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--color-secondary);
      font-family: "Merriweather", serif;
      scroll-margin-top: 160px;
      position: relative;
      padding-bottom: 15px;
    }

    .main-content-card h4::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 4px;
      background: var(--gradient-primary);
      border-radius: 2px;
    }

    .main-content-card p {
      font-size: 1.05rem;
      color: var(--color-dark);
      line-height: 1.8;
      text-align: justify;
      margin-bottom: 20px;
    }

    .main-content-card p strong {
      color: var(--color-secondary);
      font-weight: 600;
    }

    .section-divider {
      border: 0;
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(13, 157, 184, 0.3), transparent);
      margin: 50px 0;
    }

    .impact-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }

    .stat-item {
      background: var(--gradient-secondary);
      padding: 35px 25px;
      border-radius: 16px;
      transition: all 0.4s ease;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .stat-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(13, 157, 184, 0.1), transparent);
      transition: left 0.6s ease;
    }

    .stat-item:hover::before {
      left: 100%;
    }

    .stat-item:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 30px rgba(13, 157, 184, 0.2);
    }

    .stat-item h5 {
      font-size: 3rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-family: "Merriweather", serif;
      margin-bottom: 10px;
    }

    .stat-item p {
      font-size: 0.95rem;
      margin: 0;
      font-weight: 500;
    }

    p[data-warning="true"] {
      background: rgba(220, 53, 69, 0.1);
      padding: 25px;
      border-radius: 12px;
      font-weight: 500;
      margin: 30px 0;
    }

    p[data-contact="true"] {
      background: var(--gradient-secondary);
      padding: 25px;
      border-radius: 12px;
      font-weight: 500;
      text-align: center;
      margin: 30px 0;
    }

    .support-option-email {
      color: var(--color-secondary);
      text-decoration: none;
      font-weight: 700;
      transition: all 0.3s ease;
    }

    .support-option-email:hover {
      text-decoration: underline;
      color: var(--color-third);
    }

    @media (max-width: 1024px) {
      .team-members-wrapper {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .allContainer {
        padding-top: 70px;
      }

      .about-container h2 {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .team-member-card {
        padding: 35px 25px;
      }

      .main-content-card {
        padding: 35px 25px;
      }

      .main-content-card h4 {
        font-size: 1.8rem;
      }

      .sticky-nav-container {
        top: 70px;
      }

      .impact-stats-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 576px) {
      .allContainer {
        padding-top: 60px;
      }

      .about-container {
        padding: 20px 12px;
      }

      .about-container h2 {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .team-member-card {
        padding: 25px 20px;
      }

      .profile-image-wrapper {
        width: 180px;
        height: 180px;
      }

      .profile-name {
        font-size: 1.6rem;
      }

      .main-content-card {
        padding: 25px 20px;
      }

      .main-content-card h4 {
        font-size: 1.5rem;
      }

      .main-content-card p {
        font-size: 0.95rem;
      }

      .impact-stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-item h5 {
        font-size: 2.2rem;
      }

      .sticky-nav-container {
        top: 60px;
      }

      .team-members-wrapper {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="allContainer">
        <div className="container about-container">

          <div className="hero-section">
            <span className="hero-badge">🚀 Pioneering Digital Healthcare</span>
            <h2>About DoctorXCare</h2>
            <p className="hero-subtitle">
              Making healthcare simpler, smarter, and more accessible through secure technology and clinically guided innovation. DoctorXCare empowers patients with reliable digital health support anytime, anywhere.
            </p>
          </div>

          <div className="team-members-wrapper">

            <div id="founder-card" className="team-member-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="profile-image-wrapper">
                  <div className="image-container">
                    <img
                      src="/assets/arun.jpg"
                      alt="Arun Pratap Singh"
                      className="profile-image-circle"
                    />
                  </div>
                  <div className="profile-badge">Lead Developer</div>
                </div>

                <div className="profile-info-box">
                  <h3 className="profile-name">Arun Pratap Singh</h3>
                  <p className="profile-name-bio">B.Tech (Information Technology)</p>
                  <p className="profile-title">Founder &amp; Lead Developer</p>
                </div>

                <p className="profile-bio">
                  <strong>Arun</strong> is the Founder and Lead Developer of <strong>DoctorXCare</strong>, operating at the intersection of full-stack engineering, ethical AI, and healthcare innovation. He is dedicated to democratizing healthcare by architecting a secure, patient-centered ecosystem that bridges the gap between complex medical data and public accessibility.
                  <br /><br />
                  By prioritizing reliability and transparency, Arun ensures that stress-free medical guidance is accessible to everyone, everywhere. Committed to empowering users and fighting Cyberchondria, he is building a future of trusted digital health where technology serves as a foundation for patient confidence.
                </p>

                <div className="social-links-row">
                  <a
                    href="https://www.linkedin.com/in/arun-pratap-singh-944491292"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link linkedin-link"
                  >
                    <Linkedin size={20} />
                    <span>Connect on LinkedIn</span>
                  </a>

                  <a
                    href="mailto:arunstp45@gmail.com"
                    className="social-link email-link"
                  >
                    <Mail size={20} />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            </div>

            <div id="medical-advisor-card" className="team-member-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="profile-image-wrapper">
                  <div className="image-container">
                    <img
                      src="/assets/jayshree.jpg"
                      alt="Jayshree Gondane"
                      className="profile-image-circle"
                    />
                  </div>
                  <div className="profile-badge">Medical Advisor</div>
                </div>

                <div className="profile-info-box">
                  <h3 className="profile-name">Jayshree Gondane</h3>
                  <p className="profile-name-bio">BHMS</p>
                  <p className="profile-title">Medical Advisor &amp; Clinical Validator</p>
                </div>

                <p className="profile-bio">
                  <strong>Jayshree</strong> is the Medical Advisor at <strong>DoctorXCare</strong>, operating at the intersection of medicine, technology, and healthcare innovation. She is dedicated to ensuring clinical excellence by contributing to rigorous clinical validation, medical accuracy, and scalable digital healthcare solutions.
                  <br /><br />
                  By bridging the gap between medical standards and AI innovation, she ensures that every insight provided by DoctorXCare is built on a foundation of medical integrity and trust. Her expertise in holistic medicine brings a unique perspective to our patient-centered approach.
                </p>

                <div className="social-links-row">
                  <a
                    href="https://www.linkedin.com/in/jayshree-g-12aa47357"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link linkedin-link"
                  >
                    <Linkedin size={20} />
                    <span>Connect on LinkedIn</span>
                  </a>

                  <a
                    href="mailto:jayshree08gondane@gmail.com"
                    className="social-link email-link"
                  >
                    <Mail size={20} />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          <div id="top-navigation" className="sticky-nav-container">
            <nav className="nav nav-pills flex-nowrap overflow-auto justify-content-lg-center">
              <a className="nav-link custom-nav-link" href="#sec-overview">Overview</a>
              <a className="nav-link custom-nav-link" href="#sec-mission">Mission</a>
              <a className="nav-link custom-nav-link" href="#sec-services">Services</a>
              <a className="nav-link custom-nav-link" href="#sec-impact">Impact</a>
              <a className="nav-link custom-nav-link" href="#sec-tech">Technology</a>
              <a className="nav-link custom-nav-link" href="#sec-privacy">Privacy</a>
              <a className="nav-link custom-nav-link" href="#sec-compliance">Compliance</a>
              <a className="nav-link custom-nav-link" href="#sec-future">Roadmap</a>
            </nav>
          </div>

          <div className="main-content-card">

            <h4 id="sec-overview">Company Overview</h4>
            <p>DoctorXCare is a leading digital health information platform that revolutionizes how individuals understand and manage their health concerns. Founded with the vision of democratizing healthcare information, we bridge the gap between medical expertise and public accessibility through innovative AI-powered technology solutions.</p>
            <p>Our platform serves as a comprehensive digital health companion, featuring an advanced AI Medical Assistant powered by Google Gemini. This intelligent assistant provides personalized medical guidance, accurate treatment recommendations, and professional health advice based on established medical guidelines. By combining evidence-based medical knowledge with state-of-the-art artificial intelligence, DoctorXCare delivers reliable, accurate, and actionable health insights tailored to each user unique needs.</p>
            <p>From symptom analysis and disease information to personalized health risk assessments, DoctorXCare empowers individuals worldwide to make informed decisions about their health and wellness. We are committed to ensuring that quality healthcare information and expert medical guidance are accessible to everyone, anytime, anywhere.</p>

            <hr className="section-divider" />

            <h4 id="sec-mission">Mission &amp; Vision</h4>
            <p><strong>Our Mission:</strong> To empower individuals globally by providing accessible, accurate, and reliable health information that enables informed healthcare decisions. We strive to make quality health insights available anytime, anywhere, while maintaining the highest standards of privacy, security, and medical accuracy. We provide the initial knowledge that allows our users to make informed decisions, guiding them on whether to manage their condition at home or to seek professional medical help.</p>
            <p><strong>Our Vision:</strong> To create a future where healthcare is demystified and accessible to all. We envision a world where every person can confidently take the first step in understanding their health, leading to better outcomes and more effective collaboration with medical professionals. A world where technology serves as a foundation for patient confidence and well-being.</p>
            <p><strong>Core Values:</strong> Our work is guided by a deep commitment to Trust, Accuracy, and Accessibility. We champion Patient-Centered Care, rigorously protect user Privacy, drive Innovation in everything we do, and maintain unwavering Medical Integrity in all our services.</p>

            <hr className="section-divider" />

            <h4 id="sec-services">Our Core Services</h4>

            <p><strong>1. AI Symptom Analysis (Powered by Infermedica):</strong> Experience clinical-grade triage powered by the world-leading Infermedica API. Our engine analyzes symptoms against millions of clinical cases to provide research-backed triage advice.</p>

            <p><strong>2. Disease Knowledge Hub:</strong> Access a comprehensive, medically reviewed library containing detailed information on thousands of conditions. This resource is continuously updated with the latest health advisories and WHO guidelines for educational clarity.</p>

            <p><strong>3. Smart Lab Analysis:</strong> Upload lab reports and medical imaging for AI-driven interpretation. Gain instant feedback on abnormal values, track historical health trends, and receive detailed clinical insights.</p>

            <p><strong>4. 24/7 AI Health Assistant (Powered by Google Gemini):</strong> Your intelligent health companion available round-the-clock. It provides evidence-based guidance, explains complex medical concepts, and offers personalized support through secure, contextual conversations.</p>

            <p><strong>5. Chronic Disease Management:</strong> A dedicated platform for long-term monitoring of conditions like Diabetes and Hypertension. Benefit from visual health trend analytics, lifestyle tracking, and proactive health alerts to manage your well-being effectively.<em>---In development phase---</em>
            </p>
            <p><strong>6. Post-Discharge Care:</strong> Structured support to ensure a safe transition from hospital to home. Features include personalized recovery plans, progress tracking dashboards, and monitoring for critical warning signs or "danger signs".<em>---In development phase---</em></p>

            <p><strong>7. Healthcare Network:</strong> Seamlessly discover nearby specialists and hospitals using our GPS-based finder. Use smart filters for ratings and specialties to book verified appointments directly through the platform.<em>---In development phase---</em></p>

            <hr className="section-divider" />

            <h4 id="sec-impact">Our Impact in Numbers</h4>
            <div className="impact-stats-grid">
              <div className="stat-item">
                <h5>2500+</h5>
                <p>Hours of medical research and platform development invested to ensure accuracy and reliability</p>
              </div>
              <div className="stat-item">
                <h5>250+</h5>
                <p>Symptom assessments completed by users worldwide, helping individuals better understand their health concerns</p>
              </div>
              <div className="stat-item">
                <h5>200+</h5>
                <p>Monthly active users receiving health guidance and information through our platform</p>
              </div>
              <div className="stat-item">
                <h5>95%</h5>
                <p>User satisfaction rate based on feedback surveys and platform reviews</p>
              </div>
            </div>

            <hr className="section-divider" />

            <h4 id="sec-tech">Technology &amp; Approach</h4>
            <p><strong>Intelligent Analysis Engine:</strong> Our symptom analysis engine is built on a foundation of carefully researched and validated health information. We are committed to ensuring our knowledge base is comprehensive and reflects a deep understanding of the conditions presented. Our integration with industry-leading APIs ensures clinical-grade accuracy.</p>
            <p><strong>User-Centric Design:</strong> We believe that health information should be clear and empowering. Every aspect of our platform is designed with the user experience as the top priority, ensuring complex medical topics are presented in an accessible and easy-to-understand format. Our interface is intuitive, responsive, and designed for users of all technical backgrounds.</p>
            <p><strong>Commitment to Accuracy:</strong> We are dedicated to providing accurate and relevant health information. All content undergoes a thorough internal review process to ensure its validity, and we are committed to keeping it updated with the latest health insights from trusted medical sources and research institutions.</p>
            <p><strong>Continuous Improvement:</strong> Our platform is constantly evolving. We actively use user feedback to guide our improvements, and your input is essential to helping us enhance our services. We employ agile development methodologies and regular updates to ensure we are always delivering the best possible experience.</p>

            <hr className="section-divider" />

            <h4 id="sec-privacy">Privacy &amp; Security</h4>
            <p><strong>Your Privacy Comes First:</strong> Your trust is our highest priority. We are committed to protecting your privacy by not storing the personal symptoms or health inquiries you submit after your session is complete. We only handle the minimal account information necessary for our service to function, and it is always encrypted and securely managed using industry-standard protocols.</p>
            <p><strong>Anonymous Processing for Improvement:</strong> To help us improve our system, the symptom data you provide is processed in a completely anonymous form. This means your identity is fully protected, as the information is detached from any personal account details before it is used for statistical analysis and system enhancement.</p>
            <p><strong>Secure Infrastructure:</strong> Our platform utilizes industry-standard security measures, including SSL/TLS encryption, secure data transmission protocols, encrypted databases, and regular security audits to protect your account information and ensure a safe user experience. We comply with international data protection standards.</p>
            <p><strong>Confidentiality Commitment:</strong> We adhere to strict data protection and confidentiality protocols in all our operations and will never sell your data to third parties. Your health information is yours alone, and we are committed to keeping it that way.</p>

            <hr className="section-divider" />

            <h4 id="sec-compliance">Regulatory Compliance</h4>
            <p data-warning="true"><strong>Important Regulatory Notice:</strong> DoctorXCare is an informational tool for educational purposes and is not a licensed medical device in any jurisdiction. It is not intended to provide a medical diagnosis.</p>
            <p><strong>Regulatory Status:</strong> This platform has not been registered, reviewed, or approved as a medical device by regulatory authorities such as the U.S. Food and Drug Administration (FDA), the European Medicines Agency (EMA), or the Central Drugs Standard Control Organisation (CDSCO) in India.</p>
            <p><strong>Usage Restrictions:</strong> The use of this platform is prohibited in any country or jurisdiction where its services would be considered a regulated medical device and require formal certification. It is the user responsibility to ensure compliance with their local regulations.</p>
            <p><strong>Permitted Use:</strong> This platform is intended for use in jurisdictions where AI-driven health information tools for educational purposes are permitted without requiring formal medical device registration. We continuously monitor regulatory developments to ensure compliance.</p>

            <hr className="section-divider" />

            <h4 id="sec-future">Future Roadmap</h4>
            <p><strong>Enhanced AI Capabilities:</strong> Continued development of our artificial intelligence algorithms to provide more accurate, personalized health assessments and recommendations. We are investing in advanced machine learning models and natural language processing to better understand user needs.</p>
            <p><strong>Expanded Service Portfolio:</strong> Introduction of additional features including health tracking tools, medication reminders, telemedicine integration, and seamless connection with wearable devices for comprehensive health monitoring and preventive care.</p>
            <p><strong>Global Expansion:</strong> Strategic expansion into new markets while ensuring compliance with local regulatory requirements and cultural health practices. We aim to make our services available in multiple languages and adapt to regional healthcare contexts.</p>
            <p><strong>Healthcare Provider Integration:</strong> Development of tools and APIs that enable healthcare providers to integrate DoctorXCare insights into their clinical workflows, enhancing patient care and consultation efficiency. Building bridges between patients and healthcare professionals.</p>
            <p><strong>Research Partnerships:</strong> Collaboration with academic institutions, research organizations, and healthcare systems to advance digital health research and improve global health outcomes. We are committed to contributing to the scientific community and evidence-based medicine.</p>

            <p data-contact="true">For partnership opportunities, investment inquiries, or media relations, please reach out to us. We are always open to collaboration that advances our mission.</p>
            <p data-contact="true">We value your input and feedback. To share your thoughts, ask questions, or report issues, contact us at: <a href="mailto:contact@doctorxcare.in" className="support-option-email">contact@doctorxcare.in</a></p>
          </div>

        </div>
      </div>
    </>
  );
}

export default About;