import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', show, onClose, duration = 6000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  const toastStyles = {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 9999,
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    opacity: isVisible ? 1 : 0,
  };

  const toastContentStyles = {
    background: type === 'success'
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : type === 'error'
        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
        : 'linear-gradient(135deg, #3b82f6, #2563eb)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '16px 20px',
    minWidth: '320px',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  };

  const iconStyles = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  };

  const messageStyles = {
    flex: 1,
    fontWeight: '600',
    fontSize: '14px',
    lineHeight: '1.4',
  };

  const closeStyles = {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  };

  const progressStyles = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '0 0 16px 16px',
    animation: `toast-progress ${duration}ms linear forwards`,
  };

  // Add keyframe animation via style tag
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @media (max-width: 768px) {
          .toast-mobile {
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
            min-width: auto !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={toastStyles} className="toast-mobile">
      <div style={toastContentStyles}>
        <div style={iconStyles}>
          {getIcon()}
        </div>
        <div style={messageStyles}>{message}</div>
        <button
          style={closeStyles}
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ×
        </button>
        {show && <div style={progressStyles}></div>}
      </div>
    </div>
  );
};

export default Toast;