import React, { useState, useEffect } from 'react';
import {
  Activity, Heart, Droplet, Weight, Wind, Plus, TrendingUp, CheckCircle,
  Download, RefreshCw, BarChart3, Upload, FileText, Sparkles, Info,
  AlertTriangle, AlertCircle, Edit2, Save, X, Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyzeHealthTracking as analyzeHealthDataAPI, extractReportData as extractReportDataAPI } from "../../../../api/aiAgentsApi.js";
import { addMetric as saveHealthMetricAPI, getTrackingByCondition as getConditionDataAPI } from "../../../../api/healthTrackingApi.js"; 

const TrackerDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeMetric, setActiveMetric] = useState('blood_pressure');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanningReport, setScanningReport] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('Diabetes');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [reportDateTime, setReportDateTime] = useState(new Date().toISOString().slice(0, 16));

  // for scrolling to analysis section
  const analysisRef = React.useRef(null);


  useEffect(() => {
    if (analysis && analysisRef.current) {
      setTimeout(() => {
        analysisRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [analysis]);

  const [healthData, setHealthData] = useState({
    blood_pressure: [], blood_glucose: [], heart_rate: [], weight: [],
    oxygen_saturation: [], tsh: [], t3: [], t4: []
  });

  const [newReading, setNewReading] = useState({
    date: new Date().toISOString().slice(0, 16),
    systolic: '', diastolic: '', pulse: '', value: '', context: '', notes: ''
  });

  const [editReading, setEditReading] = useState({
    date: '', systolic: '', diastolic: '', pulse: '', value: '', context: '', notes: ''
  });

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

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    switch (selectedCondition) {
      case 'Diabetes': setActiveMetric('blood_glucose'); break;
      case 'Hypertension': setActiveMetric('blood_pressure'); break;
      case 'Thyroid': setActiveMetric('tsh'); break;
      default: setActiveMetric('blood_pressure');
    }
  }, [selectedCondition]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PNG, JPG, or PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleScanReport = async () => {
    if (!uploadedFile) {
      alert('Please select a file to upload');
      return;
    }
    if (!reportDateTime) {
      alert('Please select the report date and time');
      return;
    }

    setScanningReport(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('condition', selectedCondition);
      formData.append('report_date', reportDateTime);

      // Use axios API function — replaces fetch to AI service
      const res = await extractReportDataAPI(formData);
      const data = res.data;

      if (data.success && data.extracted_data) {
        const newHealthData = { ...healthData };
        // eslint-disable-next-line no-unused-vars
        let extractedCount = 0;

        ['blood_pressure', 'blood_glucose', 'heart_rate', 'weight', 'tsh', 't3', 't4'].forEach(metric => {
          if (data.extracted_data[metric]?.length > 0) {
            newHealthData[metric] = [
              ...healthData[metric],
              ...data.extracted_data[metric]
            ].sort((a, b) => new Date(a.date) - new Date(b.date));
            extractedCount += data.extracted_data[metric].length;
          }
        });

        setHealthData(newHealthData);

        // Save to MongoDB per condition
        await saveHealthMetricAPI(selectedCondition, null, newHealthData[activeMetric] || []);

        setShowScanModal(false);
        setShowSuccessModal(true);
        setUploadedFile(null);
      } else {
        alert('❌ Could not extract data from the report. Please try manual entry or upload a clearer image.');
      }
    } catch (error) {
      console.error('Report scanning error:', error);
      alert('❌ Failed to scan report. Please try again later.');
    } finally {
      setScanningReport(false);
    }
  };

  const handleAddReading = async () => {
    if (activeMetric === 'blood_pressure') {
      if (!newReading.systolic || !newReading.diastolic) {
        alert('Please enter both systolic and diastolic values');
        return;
      }
    } else {
      if (!newReading.value) {
        alert('Please enter a value');
        return;
      }
    }

    const reading = {
      date: newReading.date,
      ...(activeMetric === 'blood_pressure' ? {
        systolic: parseFloat(newReading.systolic),
        diastolic: parseFloat(newReading.diastolic),
        pulse: newReading.pulse ? parseInt(newReading.pulse) : null,
        context: newReading.context
      } : {
        value: parseFloat(newReading.value),
        unit: getUnitForMetric(activeMetric),
        context: newReading.context
      }),
      notes: newReading.notes
    };

    const updatedMetricData = [...healthData[activeMetric], reading].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    setHealthData(prev => ({
      ...prev,
      [activeMetric]: updatedMetricData
    }));

    // Save to MongoDB
    try {
      await saveHealthMetricAPI(selectedCondition, reading, updatedMetricData);
    } catch (err) {
      console.error('Failed to save to MongoDB:', err);
    }

    setNewReading({
      date: new Date().toISOString().slice(0, 16),
      systolic: '', diastolic: '', pulse: '', value: '', context: '', notes: ''
    });

    setShowAddModal(false);
  };

  const handleEditReading = (index) => {
    const reading = healthData[activeMetric][index];
    setEditingIndex(index);
    setEditReading({
      date: reading.date,
      systolic: reading.systolic || '',
      diastolic: reading.diastolic || '',
      pulse: reading.pulse || '',
      value: reading.value || '',
      context: reading.context || '',
      notes: reading.notes || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updatedReading = {
      date: editReading.date,
      ...(activeMetric === 'blood_pressure' ? {
        systolic: parseFloat(editReading.systolic),
        diastolic: parseFloat(editReading.diastolic),
        pulse: editReading.pulse ? parseInt(editReading.pulse) : null,
        context: editReading.context
      } : {
        value: parseFloat(editReading.value),
        unit: getUnitForMetric(activeMetric),
        context: editReading.context
      }),
      notes: editReading.notes
    };

    const updatedData = [...healthData[activeMetric]];
    updatedData[editingIndex] = updatedReading;

    setHealthData(prev => ({
      ...prev,
      [activeMetric]: updatedData.sort((a, b) => new Date(a.date) - new Date(b.date))
    }));

    setShowEditModal(false);
    setEditingIndex(null);
  };

  const handleDeleteReading = (index) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      const updatedData = healthData[activeMetric].filter((_, i) => i !== index);
      setHealthData(prev => ({
        ...prev,
        [activeMetric]: updatedData
      }));
    }
  };

  const getUnitForMetric = (metric) => {
    const units = {
      blood_glucose: 'mg/dL', heart_rate: 'bpm', weight: 'kg',
      oxygen_saturation: '%', tsh: 'mIU/L', t3: 'ng/dL', t4: 'ng/dL'
    };
    return units[metric] || '';
  };

  // Load existing data from MongoDB when condition changes
  useEffect(() => {
    const loadConditionData = async () => {
      try {
        const res = await getConditionDataAPI(selectedCondition.toLowerCase());
        const data = res.data;
        if (data && data.metrics && data.metrics.length > 0) {
          // Merge MongoDB data into healthData state
          const merged = { ...healthData };
          data.metrics.forEach(m => {
            if (m.blood_pressure) merged.blood_pressure = m.blood_pressure;
            if (m.blood_glucose) merged.blood_glucose = m.blood_glucose;
            if (m.heart_rate) merged.heart_rate = m.heart_rate;
            if (m.weight) merged.weight = m.weight;
            if (m.tsh) merged.tsh = m.tsh;
            if (m.t3) merged.t3 = m.t3;
            if (m.t4) merged.t4 = m.t4;
          });
          setHealthData(merged);
        }
        if (data && data.chartData && data.chartData.length > 0) {
          setHealthData(prev => ({ ...prev, ...data.chartData[0] }));
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // No existing data — fresh start
        console.log('No existing data for', selectedCondition);
      }
    };
    loadConditionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCondition]);

  const handleAnalyzeData = async () => {
    const totalReadings = Object.values(healthData).reduce((sum, arr) => sum + arr.length, 0);

    if (totalReadings === 0) {
      alert('⚠️ No data available for analysis. Please scan a report or add readings manually first.');
      return;
    }

    setLoading(true);
    try {
      const trackingData = {
        condition: selectedCondition,
        bp_readings: healthData.blood_pressure,
        glucose_readings: healthData.blood_glucose.map(r => ({ ...r, context: r.context || 'fasting' })),
        tsh_readings: healthData.tsh,
        patient_context: { condition: selectedCondition }
      };

      // Use axios API function — replaces fetch to AI service
      const res = await analyzeHealthDataAPI(trackingData);
      const data = res.data;

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        alert('❌ Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('❌ Failed to analyze data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysisText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let currentTable = [];
    let inTable = false;

    const renderTable = (tableLines, key) => {
      if (tableLines.length === 0) return null;

      const parseRow = (line) => {
        return line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      };

      const headers = parseRow(tableLines[0]);
      const rows = tableLines.slice(1).map(parseRow);

      return (
        <div key={`table-${key}`} style={{
          overflowX: 'auto',
          marginTop: '16px',
          marginBottom: '16px',
          borderRadius: '8px',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr style={{
                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb'
              }}>
                {headers.map((header, i) => (
                  <th key={i} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{
                  borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f3f4f6'
                }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '12px 16px',
                      color: isDarkMode ? '#d1d5db' : '#111827'
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        if (inTable && currentTable.length > 0) {
          elements.push(renderTable(currentTable, index));
          currentTable = [];
          inTable = false;
        }
        elements.push(<div key={`space-${index}`} style={{ height: '8px' }} />);
        return;
      }

      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        inTable = true;
        if (!trimmedLine.includes('---')) {
          currentTable.push(trimmedLine);
        }
        return;
      } else if (inTable) {
        elements.push(renderTable(currentTable, index));
        currentTable = [];
        inTable = false;
      }

      if (trimmedLine.startsWith('##')) {
        const cleanText = trimmedLine.replace(/^##\s*\d*\.?\s*/, '').replace(/\*\*/g, '');
        elements.push(
          <h3 key={`h3-${index}`} style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#0d9db8',
            marginTop: '24px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {cleanText}
          </h3>
        );
      } else if (trimmedLine.startsWith('###') || (trimmedLine.startsWith('**') && trimmedLine.endsWith('**:'))) {
        const cleanText = trimmedLine.replace(/^###\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
        elements.push(
          <h4 key={`h4-${index}`} style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: isDarkMode ? '#f3f4f6' : '#111827',
            marginTop: '16px',
            marginBottom: '8px'
          }}>
            {cleanText}
          </h4>
        );
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const cleanText = trimmedLine.replace(/^[-*]\s/, '').replace(/\*\*/g, '');
        elements.push(
          <li key={`li-${index}`} style={{
            marginLeft: '24px',
            marginBottom: '8px',
            color: isDarkMode ? '#d1d5db' : '#374151',
            lineHeight: '1.6'
          }}>
            {cleanText}
          </li>
        );
      } else {
        const cleanText = trimmedLine.replace(/\*\*/g, '');
        elements.push(
          <p key={`p-${index}`} style={{
            marginBottom: '8px',
            color: isDarkMode ? '#d1d5db' : '#374151',
            lineHeight: '1.6'
          }}>
            {cleanText}
          </p>
        );
      }
    });

    if (inTable && currentTable.length > 0) {
      elements.push(renderTable(currentTable, 'final'));
    }

    return elements;
  };

  const downloadPDF = async () => {
    if (!analysis) return;
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      const addText = (text, size, style = 'normal', color = [0, 0, 0]) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line) => {
          if (yPosition > pageHeight - margin - 35) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += size * 0.5;
        });
        yPosition += 3;
      };

      doc.setTextColor(13, 157, 184);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Health Tracking Analysis Report', margin, yPosition);
      yPosition += 15;

      doc.setDrawColor(13, 157, 184);
      doc.setLineWidth(1);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      doc.text(`Condition: ${selectedCondition}`, pageWidth - margin - 60, yPosition);
      yPosition += 15;

      const lines = analysis.split('\n');
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          yPosition += 3;
          return;
        }

        if (trimmedLine.startsWith('##') || trimmedLine.startsWith('###')) {
          const cleanText = trimmedLine.replace(/#{2,3}/g, '').trim();
          addText(cleanText, 12, 'bold', [13, 157, 184]);
        } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          const cleanText = trimmedLine.replace(/\*\*/g, '').trim();
          addText(cleanText, 10, 'bold', [40, 40, 40]);
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const cleanText = trimmedLine.replace(/^[-*]\s/, '').replace(/\*\*/g, '');
          addText('• ' + cleanText, 9, 'normal', [60, 60, 60]);
        } else {
          const cleanText = trimmedLine.replace(/\*\*/g, '');
          addText(cleanText, 9, 'normal', [60, 60, 60]);
        }
      });

      const footerY = pageHeight - 25;
      doc.setDrawColor(13, 157, 184);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(margin, footerY + 2, maxWidth, 15, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(120, 53, 15);
      doc.text('DISCLAIMER: This is AI-generated analysis. Please consult a healthcare provider.', margin + 4, footerY + 10);

      doc.save(`Health_Analysis_${selectedCondition}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF download failed. Please try again.');
    }
  };

  const prepareChartData = () => {
    const data = healthData[activeMetric] || [];
    if (activeMetric === 'blood_pressure') {
      return data.map(reading => ({
        date: new Date(reading.date).toLocaleDateString(),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        value: reading.systolic
      }));
    }
    return data.map(reading => ({
      date: new Date(reading.date).toLocaleDateString(),
      value: reading.value
    }));
  };

  const getMetricCardsForCondition = () => {
    const allCards = {
      blood_pressure: {
        id: 'blood_pressure', title: 'Blood Pressure', icon: Heart, color: '#ef4444',
        bgColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        unit: 'mmHg', conditions: ['Hypertension', 'General']
      },
      blood_glucose: {
        id: 'blood_glucose', title: 'Blood Glucose', icon: Droplet, color: '#f59e0b',
        bgColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
        unit: 'mg/dL', conditions: ['Diabetes', 'General']
      },
      heart_rate: {
        id: 'heart_rate', title: 'Heart Rate', icon: Activity, color: '#ec4899',
        bgColor: isDarkMode ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)',
        unit: 'bpm', conditions: ['Hypertension', 'General']
      },
      weight: {
        id: 'weight', title: 'Weight', icon: Weight, color: '#8b5cf6',
        bgColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
        unit: 'kg', conditions: ['Diabetes', 'Hypertension', 'General']
      },
      oxygen_saturation: {
        id: 'oxygen_saturation', title: 'SpO₂', icon: Wind, color: '#0d9db8',
        bgColor: isDarkMode ? 'rgba(13, 157, 184, 0.1)' : 'rgba(13, 157, 184, 0.05)',
        unit: '%', conditions: ['General']
      },
      tsh: {
        id: 'tsh', title: 'TSH', icon: Activity, color: '#06b6d4',
        bgColor: isDarkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
        unit: 'mIU/L', conditions: ['Thyroid']
      },
      t3: {
        id: 't3', title: 'T3', icon: TrendingUp, color: '#8b5cf6',
        bgColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
        unit: 'ng/dL', conditions: ['Thyroid']
      },
      t4: {
        id: 't4', title: 'Free T4', icon: BarChart3, color: '#ec4899',
        bgColor: isDarkMode ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)',
        unit: 'ng/dL', conditions: ['Thyroid']
      }
    };

    return Object.values(allCards).filter(card => card.conditions.includes(selectedCondition));
  };

  const metricCards = getMetricCardsForCondition();

  const getLatestReading = (metricType) => {
    const data = healthData[metricType];
    if (!data || data.length === 0) return null;
    const latest = data[data.length - 1];
    if (metricType === 'blood_pressure') {
      return `${latest.systolic}/${latest.diastolic}`;
    }
    return latest.value;
  };

  const getTotalReadings = () => {
    return Object.values(healthData).reduce((sum, arr) => sum + arr.length, 0);
  };

  const getTrackingSince = () => {
    let earliestDate = null;
    Object.values(healthData).forEach(readings => {
      if (readings.length > 0) {
        const firstDate = new Date(readings[0].date);
        if (!earliestDate || firstDate < earliestDate) {
          earliestDate = firstDate;
        }
      }
    });
    if (!earliestDate) return 'No data yet';
    const now = new Date();
    const diffDays = Math.floor((now - earliestDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
      padding: '24px',
      marginTop: '60px'
    },
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    },
    modalContent: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: '16px', padding: '32px',
      maxWidth: '900px', width: '100%',
      maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    button: (isPrimary) => ({
      padding: '12px 24px', borderRadius: '8px', border: 'none',
      fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px',
      transition: 'all 0.2s ease',
      backgroundColor: isPrimary ? '#0d9db8' : isDarkMode ? '#334155' : '#e5e7eb',
      color: isPrimary ? '#ffffff' : isDarkMode ? '#f3f4f6' : '#111827',
      boxShadow: isPrimary ? '0 2px 4px rgba(13, 157, 184, 0.3)' : 'none'
    }),
    input: {
      width: '100%', padding: '12px', borderRadius: '8px',
      border: isDarkMode ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#f3f4f6' : '#111827',
      fontSize: '1rem', boxSizing: 'border-box'
    }
  };

  const chartData = prepareChartData();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto 32px',
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderRadius: '16px', padding: '32px',
        boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '2rem', fontWeight: '700',
              background: 'linear-gradient(135deg, #0d9db8, #3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', marginBottom: '8px'
            }}>Chronic Care Health Tracker</h1>
            <p style={{ fontSize: '1rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
              Monitor your vital signs and track health trends
            </p>
          </div>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            style={{ ...styles.input, width: 'auto', padding: '10px 16px' }}
          >
            <option value="Diabetes">Diabetes</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Thyroid">Thyroid</option><option value="General">General Health</option>
          </select>
        </div>

        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Total Readings</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: getTotalReadings() > 0 ? '#0d9db8' : isDarkMode ? '#64748b' : '#94a3b8', margin: 0 }}>{getTotalReadings()}</p>
          </div>
          <div style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Tracking Since</p>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>{getTrackingSince()}</p>
          </div>
          <div style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Last Updated</p>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>
              {getTotalReadings() > 0 ? new Date().toLocaleDateString() : 'No data'}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '1400px', margin: '0 auto 32px' }}>
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          const isActive = activeMetric === metric.id;
          const latestValue = getLatestReading(metric.id);
          return (
            <div
              key={metric.id}
              style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderRadius: '12px', padding: '20px', cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: isActive ? `2px solid ${metric.color}` : isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
                boxShadow: isActive ? `0 4px 12px ${metric.color}40` : 'none',
                transform: isActive ? 'translateY(-4px)' : 'translateY(0)'
              }}
              onClick={() => setActiveMetric(metric.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  backgroundColor: metric.bgColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={24} style={{ color: metric.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>
                    {metric.title}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', margin: '4px 0 0 0' }}>
                    {healthData[metric.id].length} readings
                  </p>
                </div>
              </div>
              {latestValue ? (
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: metric.color }}>
                  {latestValue} <span style={{ fontSize: '0.875rem', fontWeight: '400' }}>{metric.unit}</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>
                  No data yet
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart or Empty State */}
      {healthData[activeMetric]?.length > 0 ? (
        <div style={{
          maxWidth: '1400px', margin: '0 auto 32px',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          borderRadius: '16px', padding: '32px',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>
              {metricCards.find(m => m.id === activeMetric)?.title} Trend
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleEditReading(healthData[activeMetric].length - 1)}
                style={{ ...styles.button(false), padding: '8px 16px', fontSize: '0.875rem' }}
              >
                <Edit2 size={16} />
                Edit Latest
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="date" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {activeMetric === 'blood_pressure' ? (
                <>
                  <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
                </>
              ) : (
                <Line type="monotone" dataKey="value" stroke={metricCards.find(m => m.id === activeMetric)?.color} strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>

          {/* Data Table */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827', marginBottom: '12px' }}>
              All Readings
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                    borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb'
                  }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: '600' }}>Date</th>
                    {activeMetric === 'blood_pressure' ? (
                      <>
                        <th style={{ padding: '12px', textAlign: 'left', color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: '600' }}>Systolic</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: '600' }}>Diastolic</th>
                      </>
                    ) : (
                      <th style={{ padding: '12px', textAlign: 'left', color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: '600' }}>Value</th>
                    )}
                    <th style={{ padding: '12px', textAlign: 'left', color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: '600' }}>Context</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {healthData[activeMetric].map((reading, index) => (
                    <tr key={index} style={{ borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', color: isDarkMode ? '#d1d5db' : '#111827' }}>
                        {new Date(reading.date).toLocaleString()}
                      </td>
                      {activeMetric === 'blood_pressure' ? (
                        <>
                          <td style={{ padding: '12px', color: isDarkMode ? '#d1d5db' : '#111827' }}>{reading.systolic} mmHg</td>
                          <td style={{ padding: '12px', color: isDarkMode ? '#d1d5db' : '#111827' }}>{reading.diastolic} mmHg</td>
                        </>
                      ) : (
                        <td style={{ padding: '12px', color: isDarkMode ? '#d1d5db' : '#111827' }}>
                          {reading.value} {reading.unit}
                        </td>
                      )}
                      <td style={{ padding: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{reading.context || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditReading(index)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isDarkMode ? '#334155' : '#e5e7eb',
                              color: isDarkMode ? '#f3f4f6' : '#111827',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReading(index)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          maxWidth: '1400px', margin: '0 auto 32px', textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          borderRadius: '12px',
          border: `2px dashed ${isDarkMode ? '#334155' : '#d1d5db'}`
        }}>
          <Info size={48} style={{ color: isDarkMode ? '#64748b' : '#94a3b8', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827', marginBottom: '8px' }}>
            No {metricCards.find(m => m.id === activeMetric)?.title} Data Available for {selectedCondition}
          </h3>
          <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '24px' }}>
            Start tracking by scanning a report or adding readings manually
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowScanModal(true)} style={{ ...styles.button(true), background: 'linear-gradient(135deg, #0d9db8, #06b6d4)' }}>
              <Sparkles size={20} />
              Scan Report
            </button>
            <button onClick={() => setShowAddModal(true)} style={styles.button(false)}>
              <Plus size={20} />
              Add Manually
            </button>
          </div>
        </div>
      )}

      {/* Analysis Section */}
      {analysis && (
        <div style={{
          maxWidth: '1400px', margin: '0 auto 32px',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          borderRadius: '16px', padding: '32px',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>
              AI Health Analysis - {selectedCondition}
            </h3>
            <button onClick={downloadPDF} style={styles.button(true)}>
              <Download size={20} />
              Export PDF
            </button>
          </div>
          <div
            ref={analysisRef}
            style={{
              backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
              padding: '20px', borderRadius: '8px', marginBottom: '20px'
            }}
          >
            {formatAnalysisText(analysis)}
          </div>

          <div style={{
            marginTop: '20px', padding: '16px',
            backgroundColor: isDarkMode ? '#422006' : '#fffbeb',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #713f12' : '1px solid #fde68a'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle style={{ color: isDarkMode ? '#fbbf24' : '#d97706', flexShrink: 0, marginTop: '2px' }} size={18} />
              <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#fde68a' : '#78350f', lineHeight: '1.5', margin: 0 }}>
                <strong>Disclaimer:</strong> This is AI-generated analysis. Please consult with qualified healthcare providers for medical decisions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowScanModal(true)} style={{ ...styles.button(true), background: 'linear-gradient(135deg, #0d9db8, #06b6d4)' }}>
          <Sparkles size={20} />
          Scan Report (AI)
        </button>
        <button onClick={() => setShowAddModal(true)} style={styles.button(true)}>
          <Plus size={20} />
          Add Manually
        </button>
        <button
          onClick={handleAnalyzeData}
          disabled={loading || getTotalReadings() === 0}
          style={{
            ...styles.button(true),
            opacity: (loading || getTotalReadings() === 0) ? 0.5 : 1,
            cursor: (loading || getTotalReadings() === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 size={20} />
              Get AI Analysis
            </>
          )}
        </button>
      </div>

      {/* Modals - Success, Scan, Add, Edit, Analysis */}
      {/* Success Modal */}
      {showSuccessModal && (
        <div style={styles.modal} onClick={() => setShowSuccessModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: isDarkMode ? '#f3f4f6' : '#111827', marginBottom: '12px' }}>
                Report Analysis Complete!
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#0d9db8', fontWeight: '600', marginBottom: '16px' }}>
                Condition: {selectedCondition}
              </p>
              <p style={{ fontSize: '0.9375rem', color: isDarkMode ? '#9ca3af' : '#6b7280', lineHeight: '1.6' }}>
                Your health data has been successfully extracted and added to the dashboard. You can now view trends and get AI-powered insights.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{ ...styles.button(true), width: '100%', justifyContent: 'center', marginTop: '24px' }}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Modal */}
      {showScanModal && (
        <div style={styles.modal} onClick={() => setShowScanModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              fontSize: '1.5rem', fontWeight: '700',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <Sparkles size={28} style={{ color: '#0d9db8' }} />
              Scan Medical Report
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', marginBottom: '8px',
                fontWeight: '600',
                color: isDarkMode ? '#f3f4f6' : '#111827'
              }}>
                Report Date & Time *
              </label>
              <input
                type="datetime-local"
                value={reportDateTime}
                onChange={(e) => setReportDateTime(e.target.value)}
                style={styles.input}
              />
              <p style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
                When was this report generated or reading taken?
              </p>
            </div>

            <div
              style={{
                border: `2px dashed ${isDarkMode ? '#334155' : '#d1d5db'}`,
                borderRadius: '12px', padding: '32px', textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb'
              }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {uploadedFile ? (
                <div>
                  <FileText size={48} style={{ color: '#0d9db8', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                    {uploadedFile.name}
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={48} style={{ color: isDarkMode ? '#64748b' : '#94a3b8', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    PNG, JPG, or PDF (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleScanReport}
                disabled={!uploadedFile || scanningReport}
                style={{
                  ...styles.button(true), flex: 1,
                  opacity: (!uploadedFile || scanningReport) ? 0.5 : 1
                }}
              >
                {scanningReport ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Scan & Extract
                  </>
                )}
              </button>
              <button
                onClick={() => { setShowScanModal(false); setUploadedFile(null); }}
                style={{ ...styles.button(false), flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reading Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: isDarkMode ? '#f3f4f6' : '#111827', marginBottom: '24px' }}>
              Add {metricCards.find(m => m.id === activeMetric)?.title} Reading
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={newReading.date}
                onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
                style={styles.input}
              />
            </div>
            {activeMetric === 'blood_pressure' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                    Systolic (mmHg)*
                  </label>
                  <input
                    type="number"
                    value={newReading.systolic}
                    onChange={(e) => setNewReading({ ...newReading, systolic: e.target.value })}
                    placeholder="120"
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                    Diastolic (mmHg)*
                  </label>
                  <input
                    type="number"
                    value={newReading.diastolic}
                    onChange={(e) => setNewReading({ ...newReading, diastolic: e.target.value })}
                    placeholder="80"
                    style={styles.input}
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                  Value ({getUnitForMetric(activeMetric)})*
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newReading.value}
                  onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                  placeholder="Enter value"
                  style={styles.input}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={handleAddReading} style={{ ...styles.button(true), flex: 1 }}>
                <CheckCircle size={20} />
                Save Reading
              </button>
              <button onClick={() => setShowAddModal(false)} style={{ ...styles.button(false), flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.modal} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: isDarkMode ? '#f3f4f6' : '#111827', marginBottom: '24px' }}>
              Edit {metricCards.find(m => m.id === activeMetric)?.title} Reading
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={editReading.date}
                onChange={(e) => setEditReading({ ...editReading, date: e.target.value })}
                style={styles.input}
              />
            </div>
            {activeMetric === 'blood_pressure' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                    Systolic (mmHg)*
                  </label>
                  <input
                    type="number"
                    value={editReading.systolic}
                    onChange={(e) => setEditReading({ ...editReading, systolic: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                    Diastolic (mmHg)*
                  </label>
                  <input
                    type="number"
                    value={editReading.diastolic}
                    onChange={(e) => setEditReading({ ...editReading, diastolic: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                  Value ({getUnitForMetric(activeMetric)})*
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editReading.value}
                  onChange={(e) => setEditReading({ ...editReading, value: e.target.value })}
                  style={styles.input}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={handleSaveEdit} style={{ ...styles.button(true), flex: 1 }}>
                <Save size={20} />
                Save Changes
              </button>
              <button onClick={() => setShowEditModal(false)} style={{ ...styles.button(false), flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && analysis && (
        <div style={styles.modal} onClick={() => setShowAnalysisModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>
                  Analysis Complete!
                </h2>
                <p style={{ fontSize: '1.125rem', color: '#0d9db8', fontWeight: '600', marginTop: '8px', margin: 0 }}>
                  Condition: {selectedCondition}
                </p>
              </div>
              <button
                onClick={() => setShowAnalysisModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              maxHeight: '60vh',
              overflowY: 'auto',
              marginBottom: '20px'
            }}>
              {formatAnalysisText(analysis)}
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: isDarkMode ? '#422006' : '#fffbeb',
              borderRadius: '8px',
              border: isDarkMode ? '1px solid #713f12' : '1px solid #fde68a',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle style={{ color: isDarkMode ? '#fbbf24' : '#d97706', flexShrink: 0, marginTop: '2px' }} size={18} />
                <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#fde68a' : '#78350f', lineHeight: '1.5', margin: 0 }}>
                  <strong>Disclaimer:</strong> This is AI-generated analysis for informational purposes only. Consult healthcare providers for medical decisions.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAnalysisModal(false)}
              style={{
                ...styles.button(true),
                width: '100%',
                justifyContent: 'center'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackerDashboard;