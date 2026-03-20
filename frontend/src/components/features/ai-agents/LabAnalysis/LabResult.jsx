import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, FileText, Download, RefreshCw } from 'lucide-react';

const LabResult = ({ analysis, onNewAnalysis }) => {
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
  const analyzeSeverity = (text) => {
    if (!text) return 'unknown';
    const lowerText = text.toLowerCase();

    const criticalKeywords = [
      'critical', 'severe', 'emergency', 'urgent', 'high risk', 'danger',
      'significantly elevated', 'significantly high', 'significantly low',
      'very high', 'very low', 'extremely', 'acute'
    ];

    const warningKeywords = [
      'elevated', 'mildly elevated', 'moderate', 'concern', 'attention',
      'monitor', 'slightly abnormal', 'borderline', 'mild', 'mildly',
      'slightly low', 'slightly high', 'slightly elevated', 'low',
      'lower limit', 'upper limit', 'needs attention'
    ];

    const normalKeywords = [
      'normal', 'healthy', 'good', 'stable', 'no issues', 'within range',
      'satisfactory', 'adequate', 'within normal', 'no abnormal',
      'not detected', 'negative'
    ];

    let criticalCount = 0;
    let warningCount = 0;
    let normalCount = 0;

    criticalKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) criticalCount++;
    });

    warningKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) warningCount++;
    });

    normalKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) normalCount++;
    });

    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    if (normalCount > warningCount) return 'normal';
    return 'info';
  };

  const severity = analyzeSeverity(analysis);

  const getBadgeConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          icon: <AlertCircle size={22} />,
          text: 'Needs Immediate Attention',
          textColor: '#dc2626',
          iconColor: '#dc2626'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={22} />,
          text: 'Requires Monitoring',
          textColor: '#ea580c',
          iconColor: '#ea580c'
        };
      case 'normal':
        return {
          icon: <CheckCircle size={22} />,
          text: 'Results Look Good',
          textColor: '#0d9db8',
          iconColor: '#0d9db8'
        };
      default:
        return {
          icon: <FileText size={22} />,
          text: 'Analysis Complete',
          textColor: '#3b82f6',
          iconColor: '#3b82f6'
        };
    }
  };

  const badgeConfig = getBadgeConfig();

  const downloadPDF = async () => {
    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      const addText = (text, size, style = 'normal', color = [0, 0, 0], align = 'left') => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(color[0], color[1], color[2]);

        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line, index) => {
          if (yPosition > pageHeight - margin - 35) {
            doc.addPage();
            yPosition = margin;
          }

          if (align === 'justify' && index < lines.length - 1 && lines.length > 1) {
            const words = line.split(' ');
            if (words.length > 1) {
              const lineWidth = doc.getTextWidth(line);
              const spaceWidth = (maxWidth - lineWidth) / (words.length - 1);
              let xPos = margin;

              words.forEach((word, wordIndex) => {
                doc.text(word, xPos, yPosition);
                xPos += doc.getTextWidth(word) + doc.getTextWidth(' ') + (wordIndex < words.length - 1 ? spaceWidth : 0);
              });
            } else {
              doc.text(line, margin, yPosition);
            }
          } else {
            doc.text(line, margin, yPosition);
          }

          yPosition += size * 0.5;
        });
        yPosition += 3;
      };

      const addTextWithHighlights = (text, size) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', 'normal');

        const highlightPatterns = [
          { keywords: ['ABNORMAL', 'abnormal', 'Abnormal'], color: [220, 38, 38], bg: [254, 226, 226] },
          { keywords: ['NORMAL', 'normal', 'Normal'], color: [5, 150, 105], bg: [209, 250, 229] },
          { keywords: ['elevated', 'Elevated', 'high', 'High'], color: [234, 88, 12], bg: [254, 215, 170] },
          { keywords: ['low', 'Low'], color: [234, 88, 12], bg: [254, 215, 170] },
          { keywords: ['Critical', 'critical', 'Severe', 'severe'], color: [220, 38, 38], bg: [254, 202, 202] }
        ];

        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach(line => {
          if (yPosition > pageHeight - margin - 35) {
            doc.addPage();
            yPosition = margin;
          }

          let xPos = margin;
          const words = line.split(' ');

          words.forEach((word) => {
            let highlighted = false;

            for (const pattern of highlightPatterns) {
              if (pattern.keywords.some(kw => word.includes(kw))) {
                const wordWidth = doc.getTextWidth(word);
                doc.setFillColor(pattern.bg[0], pattern.bg[1], pattern.bg[2]);
                doc.roundedRect(xPos - 1, yPosition - size * 0.35, wordWidth + 2, size * 0.5, 1, 1, 'F');
                doc.setTextColor(pattern.color[0], pattern.color[1], pattern.color[2]);
                doc.setFont('helvetica', 'bold');
                doc.text(word, xPos, yPosition);
                doc.setFont('helvetica', 'normal');
                highlighted = true;
                break;
              }
            }

            if (!highlighted) {
              doc.setTextColor(60, 60, 60);
              doc.text(word, xPos, yPosition);
            }

            xPos += doc.getTextWidth(word + ' ');
          });

          yPosition += size * 0.6;
        });
        yPosition += 3;
      };

      try {
        const logoImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = '/assets/MAINLOGO1.png';
        });

        const logoMaxWidth = 30;
        const logoMaxHeight = 15;
        const aspectRatio = logoImg.width / logoImg.height;

        let logoWidth, logoHeight;
        if (aspectRatio > logoMaxWidth / logoMaxHeight) {
          logoWidth = logoMaxWidth;
          logoHeight = logoMaxWidth / aspectRatio;
        } else {
          logoHeight = logoMaxHeight;
          logoWidth = logoMaxHeight * aspectRatio;
        }

        const logoY = yPosition + (15 - logoHeight) / 2;
        doc.addImage(logoImg, 'PNG', margin, logoY, logoWidth, logoHeight);
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.log('Logo not loaded, continuing without it');
      }

      doc.setTextColor(13, 157, 184);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Lab Result Analysis Report', margin + 48, yPosition + 10, { align: 'left' });

      yPosition += 22;
      doc.setDrawColor(13, 157, 184);
      doc.setLineWidth(1);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin, yPosition);

      yPosition += 10;

      const statusColors = {
        'critical': [220, 38, 38],
        'warning': [234, 88, 12],
        'normal': [13, 157, 184],
        'info': [59, 130, 246]
      };
      const statusColor = statusColors[severity] || statusColors['info'];

      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(margin, yPosition, maxWidth, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(badgeConfig.text.toUpperCase(), pageWidth / 2, yPosition + 8, { align: 'center' });

      yPosition += 20;

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;

      const lines = analysis.split('\n');
      let inInvestigationsSection = false;
      let tableData = [];

      const addTableToPDF = () => {
        if (tableData.length === 0) return;

        yPosition += 5;

        const tableHeight = (tableData.length + 1) * 8 + 15;
        if (yPosition + tableHeight > pageHeight - margin - 35) {
          doc.addPage();
          yPosition = margin;
        }

        const colWidths = [55, 35, 40, 40];
        const tableStartX = margin;
        const rowHeight = 8;

        doc.setFillColor(13, 157, 184);
        doc.rect(tableStartX, yPosition, maxWidth, rowHeight, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);

        doc.text('Test Name', tableStartX + 2, yPosition + 5.5);
        doc.text('Result', tableStartX + colWidths[0] + 2, yPosition + 5.5);
        doc.text('Normal Range', tableStartX + colWidths[0] + colWidths[1] + 2, yPosition + 5.5);
        doc.text('Status', tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 5.5);

        yPosition += rowHeight;

        tableData.forEach((row, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          doc.rect(tableStartX, yPosition, maxWidth, rowHeight, 'F');

          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.1);
          doc.line(tableStartX, yPosition, tableStartX + maxWidth, yPosition);

          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);

          doc.setFont('helvetica', 'bold');
          const testNameLines = doc.splitTextToSize(row.testName, colWidths[0] - 4);
          doc.text(testNameLines[0], tableStartX + 2, yPosition + 5.5);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(51, 65, 85);
          doc.text(row.result, tableStartX + colWidths[0] + 2, yPosition + 5.5);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          const rangeLines = doc.splitTextToSize(row.normalRange, colWidths[2] - 4);
          doc.text(rangeLines[0], tableStartX + colWidths[0] + colWidths[1] + 2, yPosition + 5.5);

          const statusLower = row.status.toLowerCase();
          let statusBgColor, statusTextColor;

          if (statusLower.includes('abnormal') || statusLower.includes('low') || statusLower.includes('high')) {
            statusBgColor = [254, 226, 226];
            statusTextColor = [220, 38, 38];
          } else if (statusLower.includes('normal')) {
            statusBgColor = [209, 250, 229];
            statusTextColor = [5, 150, 105];
          } else if (statusLower.includes('borderline')) {
            statusBgColor = [254, 215, 170];
            statusTextColor = [234, 88, 12];
          } else {
            statusBgColor = [248, 250, 252];
            statusTextColor = [71, 85, 105];
          }

          const statusX = tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2;
          const statusBoxWidth = 35;
          const statusBoxHeight = 5;
          const statusBoxY = yPosition + 2;

          doc.setFillColor(statusBgColor[0], statusBgColor[1], statusBgColor[2]);
          doc.roundedRect(statusX, statusBoxY, statusBoxWidth, statusBoxHeight, 1, 1, 'F');

          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(statusTextColor[0], statusTextColor[1], statusTextColor[2]);
          const statusLines = doc.splitTextToSize(row.status, statusBoxWidth - 2);
          doc.text(statusLines[0], statusX + statusBoxWidth / 2, statusBoxY + 3.5, { align: 'center' });

          yPosition += rowHeight;
        });

        doc.setDrawColor(226, 232, 240);
        doc.line(tableStartX, yPosition, tableStartX + maxWidth, yPosition);

        yPosition += 8;
        tableData = [];
      };

      lines.forEach(line => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          addTableToPDF();
          yPosition += 3;
          return;
        }

        if (trimmedLine.toUpperCase().includes('INVESTIGATIONS') || trimmedLine.toUpperCase().includes('### 3.')) {
          addTableToPDF();
          inInvestigationsSection = true;
        }

        if ((trimmedLine.startsWith('##') || trimmedLine.startsWith('###')) &&
          !trimmedLine.toUpperCase().includes('INVESTIGATIONS')) {
          addTableToPDF();
          inInvestigationsSection = false;
        }

        if (inInvestigationsSection) {
          const pipePattern = /^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/;
          const match = trimmedLine.match(pipePattern);

          if (match) {
            const testName = match[1].trim();
            const result = match[2].trim();
            const normalRange = match[3].trim();
            const status = match[4].trim();

            // Skip header row and separator row
            if (testName !== 'Test Name' && !testName.includes('---') && !testName.includes('|--') && testName !== '') {
              tableData.push({ testName, result, normalRange, status });
              return;
            } else if (testName === 'Test Name' || testName.includes('---') || testName.includes('|--')) {
              // Skip these lines completely
              return;
            }
          }

          const imagingPattern = /^[-*]\s*\*\*(.+?)\*\*:\s*(.+?)\s*->\s*(.+)$/i;
          const imagingMatch = trimmedLine.match(imagingPattern);

          if (imagingMatch) {
            addTableToPDF();

            yPosition += 5;
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, yPosition, maxWidth, 20, 2, 2, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text(imagingMatch[1].trim(), margin + 3, yPosition + 5);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(`Finding: ${imagingMatch[2].trim()}`, margin + 3, yPosition + 10);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(13, 157, 184);
            doc.text(`Impression: ${imagingMatch[3].trim()}`, margin + 3, yPosition + 15);

            yPosition += 25;
            return;
          }
        }

        addTableToPDF();

        if (trimmedLine.startsWith('##') || trimmedLine.startsWith('###')) {
          yPosition += 4;
          const cleanText = trimmedLine.replace(/#{2,3}/g, '').trim();
          addText(cleanText, 13, 'bold', [13, 157, 184], 'left');
        } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          const cleanText = trimmedLine.replace(/\*\*/g, '').trim();
          addText(cleanText, 11, 'bold', [40, 40, 40], 'left');
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          let cleanText = trimmedLine.replace(/^[-*]\s/, '').replace(/\*\*/g, '');
          addTextWithHighlights('• ' + cleanText, 10);
        } else {
          const cleanText = trimmedLine.replace(/\*\*/g, '');
          addTextWithHighlights(cleanText, 10);
        }
      });

      addTableToPDF();

      const footerY = pageHeight - 28;

      doc.setDrawColor(13, 157, 184);
      doc.setLineWidth(0.8);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(234, 179, 8);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, footerY + 2, maxWidth, 18, 2, 2, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(120, 53, 15);
      const disclaimerLines = doc.splitTextToSize('DISCLAIMER: This is an AI-generated analysis and NOT a medical diagnosis. Please consult a qualified healthcare provider for medical advice.', maxWidth - 8);
      let disclaimerY = footerY + 7;
      disclaimerLines.forEach(line => {
        doc.text(line, margin + 4, disclaimerY);
        disclaimerY += 4;
      });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(13, 157, 184);
      doc.text('Powered by AI Analysis Engine', pageWidth / 2, footerY + 24, { align: 'center' });

      doc.save(`Lab_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);

      document.head.removeChild(script);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF download failed. Please try again.');
    }
  };

  const addColoredBadges = (text) => {
    const patterns = [
      { regex: /\b(NORMAL|Normal)\b/gi, color: '#059669', bg: '#d1fae5' },
      { regex: /\b(ABNORMAL|Abnormal|Elevated|Mildly Elevated|Slightly Elevated)\b/gi, color: '#dc2626', bg: '#fee2e2' },
      { regex: /\b(Low|Slightly Low|Mildly Low)\b/gi, color: '#ea580c', bg: '#fed7aa' },
      { regex: /\b(Critical|Severe|High Risk|Borderline)\b/gi, color: '#dc2626', bg: '#fecaca' },
      { regex: /\b(Not Specified|Not Applicable)\b/gi, color: '#64748b', bg: '#f1f5f9' }
    ];

    let parts = [text];

    patterns.forEach(({ regex, color, bg }) => {
      let newParts = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const segments = part.split(regex);
          segments.forEach((segment, i) => {
            if (i > 0 && i % 2 === 1) {
              newParts.push(
                <span
                  key={`badge-${i}-${segment}`}
                  style={{
                    backgroundColor: bg,
                    color: color,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    marginLeft: '4px',
                    marginRight: '4px',
                    display: 'inline-block',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}
                >
                  {segment}
                </span>
              );
            } else {
              newParts.push(segment);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts;
  };

  const parseTableRow = (line) => {
    const pipePattern = /^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/;
    const pipeMatch = line.match(pipePattern);

    if (pipeMatch) {
      const testName = pipeMatch[1].trim();
      const result = pipeMatch[2].trim();
      const normalRange = pipeMatch[3].trim();
      const status = pipeMatch[4].trim();

      // Skip header, separator rows, and empty rows
      if (testName === 'Test Name' || testName.includes('---') || testName.includes('--') || testName === '' || line.match(/^\|[-:\s|]+\|$/)) {
        return { isTableRow: false };
      }

      return {
        isTableRow: true,
        testName,
        result,
        normalRange,
        status
      };
    }

    const imagingPattern = /^[-*]\s*\*\*(.+?)\*\*:\s*(.+?)\s*->\s*(.+)$/i;
    const imagingMatch = line.match(imagingPattern);

    if (imagingMatch) {
      return {
        isImagingFinding: true,
        region: imagingMatch[1].trim(),
        finding: imagingMatch[2].trim(),
        impression: imagingMatch[3].trim()
      };
    }

    return { isTableRow: false };
  };

  const formatText = (text) => {
    if (!text) {
      return <p style={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>No analysis data available</p>;
    }

    const lines = text.split('\n');
    const elements = [];
    let tableRows = [];
    let inInvestigationsSection = false;
    const isMobile = window.innerWidth <= 768;

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} style={{
            overflowX: 'auto',
            marginBottom: isMobile ? '20px' : '28px',
            marginTop: isMobile ? '12px' : '16px',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: isMobile ? '0.8125rem' : '0.875rem',
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              <thead>
                <tr style={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                  borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb'
                }}>
                  <th style={{
                    padding: isMobile ? '12px 10px' : '14px 16px',
                    textAlign: 'left',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                    fontWeight: '600',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Test Name</th>
                  <th style={{
                    padding: isMobile ? '12px 10px' : '14px 16px',
                    textAlign: 'left',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                    fontWeight: '600',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Result</th>
                  <th style={{
                    padding: isMobile ? '12px 10px' : '14px 16px',
                    textAlign: 'left',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                    fontWeight: '600',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Normal Range</th>
                  <th style={{
                    padding: isMobile ? '12px 10px' : '14px 16px',
                    textAlign: 'left',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                    fontWeight: '600',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => {
                  const statusLower = row.status.toLowerCase();
                  let statusColor = '#475569';
                  let statusBg = '#f1f5f9';

                  if (statusLower.includes('abnormal') || statusLower.includes('low') || statusLower.includes('high')) {
                    statusColor = '#dc2626';
                    statusBg = '#fee2e2';
                  } else if (statusLower.includes('normal')) {
                    statusColor = '#059669';
                    statusBg = '#d1fae5';
                  } else if (statusLower.includes('borderline')) {
                    statusColor = '#ea580c';
                    statusBg = '#fed7aa';
                  }

                  return (
                    <tr key={idx} style={{
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f3f4f6',
                      transition: 'background-color 0.15s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#ffffff'}>
                      <td style={{
                        padding: isMobile ? '12px 10px' : '14px 16px',
                        color: isDarkMode ? '#f3f4f6' : '#111827',
                        fontWeight: '500'
                      }}>{row.testName}</td>
                      <td style={{
                        padding: isMobile ? '12px 10px' : '14px 16px',
                        color: isDarkMode ? '#e5e7eb' : '#1f2937',
                        fontWeight: '600'
                      }}>{row.result}</td>
                      <td style={{
                        padding: isMobile ? '12px 10px' : '14px 16px',
                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                      }}>{row.normalRange}</td>
                      <td style={{
                        padding: isMobile ? '12px 10px' : '14px 16px'
                      }}>
                        <span style={{
                          backgroundColor: statusBg,
                          color: statusColor,
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: isMobile ? '0.75rem' : '0.8125rem',
                          display: 'inline-block'
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        flushTable();
        elements.push(<div key={`space-${index}`} style={{ height: '12px' }} />);
        return;
      }

      if (trimmedLine.toUpperCase().includes('INVESTIGATIONS') || trimmedLine.toUpperCase().includes('### 3.')) {
        flushTable();
        inInvestigationsSection = true;
      }

      if ((trimmedLine.startsWith('###') || trimmedLine.startsWith('##')) &&
        !trimmedLine.toUpperCase().includes('INVESTIGATIONS')) {
        flushTable();
        inInvestigationsSection = false;
      }

      if (inInvestigationsSection) {
        // Skip the separator line
        if (trimmedLine.match(/^\|[-:\s|]+\|$/)) {
          return;
        }

        const tableData = parseTableRow(trimmedLine);

        if (tableData.isTableRow) {
          tableRows.push(tableData);
          return;
        }

        if (tableData.isImagingFinding) {
          flushTable();
          elements.push(
            <div key={`imaging-${index}`} style={{
              marginBottom: isMobile ? '16px' : '20px',
              padding: isMobile ? '16px' : '20px',
              backgroundColor: isDarkMode ? '#1e293b' : '#f9fafb',
              borderLeft: '4px solid #0d9db8',
              borderRadius: '6px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
            }}>
              <div style={{
                fontWeight: '600',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: isMobile ? '0.9375rem' : '1rem',
                marginBottom: '10px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {tableData.region}
              </div>
              <div style={{
                color: isDarkMode ? '#9ca3af' : '#4b5563',
                fontSize: isMobile ? '0.8125rem' : '0.875rem',
                marginBottom: '8px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                <strong style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>Finding:</strong> {tableData.finding}
              </div>
              <div style={{
                color: '#0d9db8',
                fontSize: isMobile ? '0.8125rem' : '0.875rem',
                fontWeight: '600',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                <strong>Impression:</strong> {tableData.impression}
              </div>
            </div>
          );
          return;
        }
      }

      flushTable();

      if (trimmedLine.startsWith('###') || trimmedLine.startsWith('##') || (trimmedLine.startsWith('**') && trimmedLine.endsWith('**'))) {
        const cleanText = trimmedLine.replace(/#{2,3}/g, '').replace(/\*\*/g, '').trim();
        elements.push(
          <h3 key={`header-${index}`} style={{
            marginTop: isMobile ? '24px' : '32px',
            marginBottom: isMobile ? '12px' : '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f3f4f6' : '#111827',
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            lineHeight: '1.4',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            letterSpacing: '-0.01em'
          }}>
            {cleanText}
          </h3>
        );
        return;
      }

      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        elements.push(
          <p key={`text-${index}`} style={{
            marginBottom: isMobile ? '12px' : '16px',
            color: isDarkMode ? '#d1d5db' : '#374151',
            lineHeight: '1.7',
            fontSize: isMobile ? '0.9375rem' : '1rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i} style={{ fontWeight: '600', color: isDarkMode ? '#f9fafb' : '#111827' }}>{part}</strong> : part
            )}
          </p>
        );
        return;
      }

      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const cleanText = trimmedLine.replace(/^[-*]\s/, '');
        elements.push(
          <li key={`bullet-${index}`} style={{
            marginBottom: isMobile ? '10px' : '12px',
            marginLeft: isMobile ? '20px' : '28px',
            color: isDarkMode ? '#d1d5db' : '#374151',
            lineHeight: '1.7',
            fontSize: isMobile ? '0.9375rem' : '1rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            {cleanText}
          </li>
        );
        return;
      }

      elements.push(
        <p key={`para-${index}`} style={{
          marginBottom: isMobile ? '12px' : '16px',
          color: isDarkMode ? '#d1d5db' : '#374151',
          lineHeight: '1.7',
          fontSize: isMobile ? '0.9375rem' : '1rem',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          {addColoredBadges(trimmedLine)}
        </p>
      );
    });

    flushTable();

    return elements;
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '20px 16px' : '40px 32px',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{
        borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb',
        paddingBottom: isMobile ? '24px' : '32px',
        marginBottom: isMobile ? '28px' : '36px'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.25rem',
          fontWeight: '700',
          color: isDarkMode ? '#f9fafb' : '#111827',
          marginBottom: isMobile ? '8px' : '12px',
          letterSpacing: '-0.025em',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Medical Analysis Report
        </h1>
        <p style={{
          fontSize: isMobile ? '0.875rem' : '0.9375rem',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Status Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '14px',
        marginBottom: isMobile ? '20px' : '28px',
        padding: isMobile ? '14px 18px' : '16px 24px',
        backgroundColor: isDarkMode ? '#1e293b' : '#f9fafb',
        borderRadius: '8px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
      }}>
        <span style={{ color: badgeConfig.iconColor, display: 'flex', flexShrink: 0 }}>
          {React.cloneElement(badgeConfig.icon, { size: isMobile ? 20 : 24 })}
        </span>
        <span style={{
          fontSize: isMobile ? '0.9375rem' : '1.0625rem',
          fontWeight: '600',
          color: badgeConfig.textColor,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          {badgeConfig.text}
        </span>
      </div>

      {/* Disclaimer */}
      <div style={{
        marginBottom: isMobile ? '24px' : '32px',
        padding: isMobile ? '14px 16px' : '16px 20px',
        backgroundColor: isDarkMode ? '#422006' : '#fffbeb',
        borderRadius: '8px',
        border: isDarkMode ? '1px solid #713f12' : '1px solid #fde68a'
      }}>
        <div style={{
          display: 'flex',
          gap: isMobile ? '10px' : '12px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle style={{
            color: isDarkMode ? '#fbbf24' : '#d97706',
            flexShrink: 0,
            marginTop: '2px'
          }} size={isMobile ? 16 : 18} />
          <p style={{
            fontSize: isMobile ? '0.8125rem' : '0.875rem',
            color: isDarkMode ? '#fde68a' : '#78350f',
            lineHeight: '1.5',
            margin: 0,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            <strong style={{ fontWeight: '600' }}>Medical Disclaimer:</strong> This report contains AI-generated analysis for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Please consult with qualified healthcare providers for medical decisions.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderRadius: '8px',
        padding: isMobile ? '20px' : '32px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
        marginBottom: isMobile ? '24px' : '32px'
      }}>
        <div style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}>
          {formatText(analysis)}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        gap: isMobile ? '12px' : '16px',
        marginTop: isMobile ? '28px' : '36px',
        paddingTop: isMobile ? '24px' : '32px',
        borderTop: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
      }}>
        <button
          onClick={downloadPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '8px' : '12px',
            padding: isMobile ? '12px 24px' : '14px 32px',
            backgroundColor: '#0d9db8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: isMobile ? '0.9375rem' : '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            flex: isMobile ? '1' : '0 1 auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0a7a8f';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0d9db8';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Download size={isMobile ? 18 : 20} />
          Download PDF Report
        </button>

        <button
          onClick={onNewAnalysis}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '8px' : '12px',
            padding: isMobile ? '12px 24px' : '14px 32px',
            backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
            color: isDarkMode ? '#f9fafb' : '#111827',
            border: isDarkMode ? '1px solid #475569' : '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: isMobile ? '0.9375rem' : '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            flex: isMobile ? '1' : '0 1 auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#e5e7eb';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f3f4f6';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <RefreshCw size={isMobile ? 18 : 20} />
          Analyze Another Report
        </button>
      </div>

      {/* Footer */}
      <p style={{
        textAlign: 'center',
        fontSize: isMobile ? '0.8125rem' : '0.875rem',
        color: isDarkMode ? '#6b7280' : '#9ca3af',
        marginTop: isMobile ? '24px' : '32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        🔒 Your data is encrypted and processed securely. Reports are not stored permanently.
      </p>
    </div>
  );
};

export default LabResult;