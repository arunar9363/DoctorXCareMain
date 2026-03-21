import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordAPI, verifyOtpAPI, resetPasswordAPI } from "../api/auth.api.js";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme === 'dark');
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkTheme();
    checkScreenSize();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    window.addEventListener('resize', checkScreenSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Step 1: Validate email and send OTP
  // Replaced: sendPasswordResetEmail(auth, ...) → POST /api/auth/forgot-password
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage({ text: "✗ Please enter a valid email address.", type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      await forgotPasswordAPI({ email: email.trim() });

      setMessage({
        text: "✓ OTP sent to your email! Please check your inbox and spam folder. OTP expires in 10 minutes.",
        type: "success"
      });

      // Move to OTP entry step
      setStep(2);
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to send OTP. Please try again.";
      setMessage({ text: `✗ ${errMsg}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  // Replaced: verifyPasswordResetCode(auth, oobCode) → POST /api/auth/verify-otp
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (!otp || otp.length !== 6) {
      setMessage({ text: "✗ Please enter the 6-digit OTP.", type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const res = await verifyOtpAPI({ email: email.trim(), otp: otp.trim() });

      // Store JWT reset token for step 3
      setResetToken(res.data.resetToken);

      setMessage({
        text: "✓ OTP verified! Please enter your new password.",
        type: "success"
      });

      setStep(3);
    } catch (error) {
      const errMsg = error.response?.data?.error || "Invalid or expired OTP.";

      if (errMsg.toLowerCase().includes('expired')) {
        setMessage({
          text: "✗ OTP has expired. Please request a new one.",
          type: "error"
        });
        // Go back to step 1 after 3 seconds
        setTimeout(() => {
          setStep(1);
          setOtp("");
          setMessage({ text: "", type: "" });
        }, 3000);
      } else {
        setMessage({ text: `✗ ${errMsg}`, type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password with JWT resetToken
  // Replaced: confirmPasswordReset(auth, oobCode, newPassword) → POST /api/auth/reset-password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ text: "✗ Passwords do not match!", type: "error" });
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setMessage({
        text: "✗ Password must be at least 6 characters long.",
        type: "error"
      });
      return;
    }

    // Check password strength
    if (newPassword.length < 8) {
      setMessage({
        text: "⚠ Password is weak. Consider using at least 8 characters with numbers and symbols.",
        type: "warning"
      });
    }

    setIsLoading(true);

    try {
      // Pass resetToken as Authorization header via API call
      await resetPasswordAPI({ newPassword }, resetToken);

      setMessage({
        text: "✓ Password reset successful! Redirecting to login...",
        type: "success"
      });

      // Redirect to home/login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to reset password. Please try again.";
      setMessage({ text: `✗ ${errMsg}`, type: "error" });

      // If token expired, go back to step 1
      if (error.response?.status === 401) {
        setTimeout(() => {
          setStep(1);
          setOtp("");
          setResetToken("");
          setNewPassword("");
          setConfirmPassword("");
          setMessage({ text: "", type: "" });
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    setOtp("");

    try {
      await forgotPasswordAPI({ email: email.trim() });
      setMessage({
        text: "✓ New OTP sent! Please check your inbox.",
        type: "success"
      });
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to resend OTP.";
      setMessage({ text: `✗ ${errMsg}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to step 1
  const handleBackToStep1 = () => {
    if (!isLoading) {
      setStep(1);
      setOtp("");
      setMessage({ text: "", type: "" });
    }
  };

  // Handle home navigation
  const handleBackToHome = () => {
    if (!isLoading) {
      navigate("/");
    }
  };

  // CSS Variables
  const colorPrimary = isDark ? '#121212' : '#ffffff';
  const colorSecondary = '#0d9db8';
  const colorThird = isDark ? '#60a5fa' : '#3b82f6';
  const colorFourth = isDark ? '#1f2937' : '#d1f4f9';
  const colorDark = isDark ? '#e5e7eb' : '#1a1a1a';

  const pageStyle = {
    marginTop: '60px',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    minHeight: '100vh',
    width: '100%',
    fontFamily: '"Inter", sans-serif',
    background: isDark
      ? `linear-gradient(135deg, ${colorFourth} 0%, #0f172a 50%, #1a365d 100%)`
      : `linear-gradient(135deg, ${colorFourth} 0%, #f0f9fc 50%, #e0f2fe 100%)`,
    paddingTop: isMobile ? '70px' : '0',
  };

  const leftStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? '20px' : '40px',
    textAlign: 'center',
  };

  const leftH1Style = {
    fontSize: isMobile ? '24px' : 'clamp(24px, 4vw, 36px)',
    marginBottom: '12px',
    fontWeight: 600,
    lineHeight: 1.2,
    color: colorSecondary,
  };

  const leftPStyle = {
    color: colorDark,
    fontSize: isMobile ? '14px' : 'clamp(14px, 2.5vw, 18px)',
    marginBottom: '30px',
    opacity: 0.85,
    lineHeight: 1.6,
    maxWidth: '400px',
  };

  const svgContainerStyle = {
    marginTop: '20px',
    maxWidth: isMobile ? '300px' : '450px',
    width: '100%',
  };

  const rightStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '20px' : '40px',
  };

  const formBoxStyle = {
    width: '100%',
    maxWidth: isMobile ? '100%' : '520px',
    margin: '0 auto',
  };

  const h2Style = {
    fontSize: isMobile ? '1.8rem' : 'clamp(1.8rem, 4vw, 2.5rem)',
    fontWeight: 600,
    marginBottom: isMobile ? '15px' : '20px',
    color: colorSecondary,
    fontFamily: '"Merriweather", serif',
    lineHeight: 1.2,
  };

  const subtitleStyle = {
    fontSize: isMobile ? '0.9rem' : 'clamp(0.9rem, 2vw, 1.1rem)',
    color: colorDark,
    marginBottom: isMobile ? '20px' : '24px',
    lineHeight: 1.5,
    opacity: 0.85,
  };

  const alertStyle = {
    padding: isMobile ? '14px 16px' : '16px 18px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '500',
    textAlign: 'left',
    animation: 'slideDown 0.3s ease-out',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const alertSuccess = {
    ...alertStyle,
    background: isDark
      ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.2), rgba(96, 165, 250, 0.15))'
      : 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
    color: colorSecondary,
    borderLeft: `4px solid ${colorSecondary}`,
  };

  const alertError = {
    ...alertStyle,
    background: isDark
      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))'
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
    color: isDark ? '#fca5a5' : '#dc2626',
    borderLeft: `4px solid ${isDark ? '#fca5a5' : '#dc2626'}`,
  };

  const alertWarning = {
    ...alertStyle,
    background: isDark
      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15))'
      : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
    color: isDark ? '#fcd34d' : '#d97706',
    borderLeft: `4px solid ${isDark ? '#fcd34d' : '#d97706'}`,
  };

  const alertInfo = {
    ...alertStyle,
    background: isDark
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.15))'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.1))',
    color: colorThird,
    borderLeft: `4px solid ${colorThird}`,
  };

  const inputStyle = {
    width: '100%',
    padding: isMobile ? '16px' : '14px 16px',
    marginBottom: isMobile ? '18px' : '16px',
    border: `2px solid ${isDark ? colorFourth : '#e5e7eb'}`,
    borderRadius: isMobile ? '10px' : '12px',
    fontSize: isMobile ? '16px' : '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    background: colorPrimary,
    fontFamily: 'inherit',
    color: colorDark,
  };

  const otpInputStyle = {
    ...inputStyle,
    textAlign: 'center',
    fontSize: '1.6rem',
    letterSpacing: '0.5rem',
    fontWeight: 700,
    padding: isMobile ? '16px' : '14px 16px',
  };

  const buttonStyle = {
    width: '100%',
    padding: isMobile ? '18px' : '16px',
    background: `linear-gradient(135deg, ${colorSecondary}, ${colorThird})`,
    color: '#ffffff',
    border: 'none',
    borderRadius: isMobile ? '10px' : '12px',
    fontSize: isMobile ? '16px' : '16px',
    fontWeight: 600,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    marginTop: isMobile ? '8px' : '12px',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.5px',
    opacity: isLoading ? 0.6 : 1,
  };


  const backLinkStyle = {
    textAlign: 'center',
    marginTop: isMobile ? '24px' : '20px',
    fontSize: isMobile ? '15px' : '15px',
    color: colorDark,
    opacity: 0.85,
  };

  const btnBackStyle = {
    background: 'none',
    border: 'none',
    color: colorSecondary,
    fontWeight: 600,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
    padding: 0,
    margin: 0,
    transition: 'color 0.3s ease',
    opacity: isLoading ? 0.6 : 1,
  };

  // Step indicator
  const stepIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '28px',
    justifyContent: 'center'
  };

  const stepDotStyle = (stepNum) => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: step >= stepNum
      ? `linear-gradient(135deg, ${colorSecondary}, ${colorThird})`
      : isDark ? '#334155' : '#e5e7eb',
    color: step >= stepNum ? '#fff' : colorDark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    transition: 'all 0.3s ease'
  });

  const stepLineStyle = (stepNum) => ({
    flex: 1,
    height: '2px',
    background: step > stepNum
      ? `linear-gradient(90deg, ${colorSecondary}, ${colorThird})`
      : isDark ? '#334155' : '#e5e7eb',
    borderRadius: '2px',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={pageStyle}>
      <div style={leftStyle}>
        <h1 style={leftH1Style}>Recover Your Access</h1>
        <p style={leftPStyle}>
          We're here to help! Follow the simple steps to reset your password and regain access to your DoctorXCare account.
        </p>
        <div style={svgContainerStyle}>
          <img
            src="/assets/Forgot password.svg"
            alt="Forgot Password"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      <div style={rightStyle}>
        <div style={formBoxStyle}>

          {/* Step Indicator */}
          <div style={stepIndicatorStyle}>
            <div style={stepDotStyle(1)}>1</div>
            <div style={stepLineStyle(1)}></div>
            <div style={stepDotStyle(2)}>2</div>
            <div style={stepLineStyle(2)}></div>
            <div style={stepDotStyle(3)}>3</div>
          </div>

          {/* ── STEP 1: Email Entry ───────────────────────────── */}
          {step === 1 && (
            <>
              <h2 style={h2Style}>Reset Password</h2>
              <p style={subtitleStyle}>
                Enter your registered email — we'll send a 6-digit OTP to verify it's you.
              </p>

              {message.text && (
                <div style={
                  message.type === 'success' ? alertSuccess
                    : message.type === 'warning' ? alertWarning
                      : alertError
                }>
                  <span style={{ fontSize: '18px' }}>
                    {message.type === 'success' ? '✓' : message.type === 'warning' ? '⚠' : '✕'}
                  </span>
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSendResetEmail}>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = colorSecondary;
                    e.target.style.boxShadow = isDark
                      ? `0 0 0 3px rgba(13, 157, 184, 0.1)`
                      : `0 0 0 3px rgba(13, 157, 184, 0.15)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? colorFourth : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 8px 20px rgba(13, 157, 184, 0.3)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP →"}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP Verification ──────────────────────── */}
          {step === 2 && (
            <>
              <h2 style={h2Style}>Enter OTP</h2>
              <p style={subtitleStyle}>
                Enter the 6-digit OTP sent to your email.
              </p>

              {message.text && (
                <div style={
                  message.type === 'success' ? alertSuccess
                    : message.type === 'warning' ? alertWarning
                      : alertError
                }>
                  <span style={{ fontSize: '18px' }}>
                    {message.type === 'success' ? '✓' : message.type === 'warning' ? '⚠' : '✕'}
                  </span>
                  <span>{message.text}</span>
                </div>
              )}

              {/* Email info box */}
              <div style={alertInfo}>
                <span style={{ fontSize: '18px' }}>✉️</span>
                <div>
                  <strong>OTP sent to:</strong> {email}
                </div>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={isLoading}
                  maxLength={6}
                  style={otpInputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = colorSecondary;
                    e.target.style.boxShadow = isDark
                      ? `0 0 0 3px rgba(13, 157, 184, 0.1)`
                      : `0 0 0 3px rgba(13, 157, 184, 0.15)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? colorFourth : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  style={{ ...buttonStyle, opacity: (isLoading || otp.length !== 6) ? 0.6 : 1 }}
                  onMouseEnter={(e) => {
                    if (!isLoading && otp.length === 6) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 8px 20px rgba(13, 157, 184, 0.3)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isLoading ? "Verifying..." : "Verify OTP →"}
                </button>
              </form>

              {/* Resend OTP + Change email */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  style={btnBackStyle}
                >
                  Resend OTP
                </button>
                <button
                  onClick={handleBackToStep1}
                  disabled={isLoading}
                  style={btnBackStyle}
                >
                  ← Change Email
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: New Password ──────────────────────────── */}
          {step === 3 && (
            <>
              <h2 style={h2Style}>Create New Password</h2>
              <p style={subtitleStyle}>
                Set a strong new password for your account.
              </p>

              {message.text && (
                <div style={
                  message.type === 'success' ? alertSuccess
                    : message.type === 'warning' ? alertWarning
                      : alertError
                }>
                  <span style={{ fontSize: '18px' }}>
                    {message.type === 'success' ? '✓' : message.type === 'warning' ? '⚠' : '✕'}
                  </span>
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword}>
                <input
                  type="password"
                  placeholder="New Password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength="6"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = colorSecondary;
                    e.target.style.boxShadow = isDark
                      ? `0 0 0 3px rgba(13, 157, 184, 0.1)`
                      : `0 0 0 3px rgba(13, 157, 184, 0.15)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? colorFourth : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength="6"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = colorSecondary;
                    e.target.style.boxShadow = isDark
                      ? `0 0 0 3px rgba(13, 157, 184, 0.1)`
                      : `0 0 0 3px rgba(13, 157, 184, 0.15)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? colorFourth : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 8px 20px rgba(13, 157, 184, 0.3)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isLoading ? "Resetting..." : "Reset Password →"}
                </button>
              </form>
            </>
          )}

          <p style={backLinkStyle}>
            <button
              onClick={handleBackToHome}
              type="button"
              disabled={isLoading}
              style={btnBackStyle}
            >
              ← Back to Home
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;