import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line, AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';

const Charts = ({
  patientData,
  metricType = 'blood_pressure',
  timeRange = 30,
  onTrendInsight
}) => {
  const [chartData, setChartData] = useState([]);
  const [trendDirection, setTrendDirection] = useState('stable');
  const [statistics, setStatistics] = useState({});
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chartRef = useRef(null);

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

  // Process data when props change
  useEffect(() => {
    if (patientData && patientData.length > 0) {
      // eslint-disable-next-line react-hooks/immutability
      processChartData();
    }
  }, [patientData, metricType, selectedTimeRange]);

  const processChartData = () => {
    // Filter data by time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedTimeRange);

    const filteredData = patientData
      .filter(item => new Date(item.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Format data based on metric type
    let formattedData = [];

    if (metricType === 'blood_pressure') {
      formattedData = filteredData.map(item => ({
        date: formatDate(item.date),
        systolic: item.systolic,
        diastolic: item.diastolic,
        pulse: item.pulse || null,
        fullDate: item.date
      }));
    } else if (metricType === 'blood_glucose') {
      formattedData = filteredData.map(item => ({
        date: formatDate(item.date),
        value: item.value,
        context: item.context || 'General',
        fullDate: item.date
      }));
    } else {
      // Generic format for other metrics
      formattedData = filteredData.map(item => ({
        date: formatDate(item.date),
        value: item.value,
        unit: item.unit,
        fullDate: item.date
      }));
    }

    setChartData(formattedData);
    calculateStatistics(formattedData);
    calculateTrend(formattedData);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateStatistics = (data) => {
    if (data.length === 0) return;

    let values = [];
    if (metricType === 'blood_pressure') {
      const systolicValues = data.map(d => d.systolic);
      const diastolicValues = data.map(d => d.diastolic);

      setStatistics({
        systolicAvg: (systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length).toFixed(1),
        systolicMin: Math.min(...systolicValues),
        systolicMax: Math.max(...systolicValues),
        diastolicAvg: (diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length).toFixed(1),
        diastolicMin: Math.min(...diastolicValues),
        diastolicMax: Math.max(...diastolicValues),
      });
    } else {
      values = data.map(d => d.value).filter(v => v !== null && v !== undefined);

      if (values.length > 0) {
        setStatistics({
          average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1]
        });
      }
    }
  };

  const calculateTrend = (data) => {
    if (data.length < 2) {
      setTrendDirection('insufficient');
      return;
    }

    // Simple trend calculation: compare first half average to second half average
    const midPoint = Math.floor(data.length / 2);
    let firstHalfAvg, secondHalfAvg;

    if (metricType === 'blood_pressure') {
      const firstHalfSystolic = data.slice(0, midPoint).map(d => d.systolic);
      const secondHalfSystolic = data.slice(midPoint).map(d => d.systolic);

      firstHalfAvg = firstHalfSystolic.reduce((a, b) => a + b, 0) / firstHalfSystolic.length;
      secondHalfAvg = secondHalfSystolic.reduce((a, b) => a + b, 0) / secondHalfSystolic.length;
    } else {
      const firstHalfValues = data.slice(0, midPoint).map(d => d.value).filter(v => v);
      const secondHalfValues = data.slice(midPoint).map(d => d.value).filter(v => v);

      if (firstHalfValues.length === 0 || secondHalfValues.length === 0) {
        setTrendDirection('insufficient');
        return;
      }

      firstHalfAvg = firstHalfValues.reduce((a, b) => a + b, 0) / firstHalfValues.length;
      secondHalfAvg = secondHalfValues.reduce((a, b) => a + b, 0) / secondHalfValues.length;
    }

    const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (Math.abs(percentageChange) < 3) {
      setTrendDirection('stable');
    } else if (percentageChange > 0) {
      // For BP and glucose, increasing is bad
      if (metricType === 'blood_pressure' || metricType === 'blood_glucose') {
        setTrendDirection('worsening');
      } else {
        setTrendDirection('improving');
      }
    } else {
      // For BP and glucose, decreasing is good
      if (metricType === 'blood_pressure' || metricType === 'blood_glucose') {
        setTrendDirection('improving');
      } else {
        setTrendDirection('worsening');
      }
    }

    // Notify parent component if callback exists
    if (onTrendInsight) {
      onTrendInsight({
        direction: trendDirection,
        percentageChange: percentageChange.toFixed(1),
        metricType
      });
    }
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'improving':
        return <TrendingDown className="text-green-500" size={24} />;
      case 'worsening':
        return <TrendingUp className="text-red-500" size={24} />;
      case 'stable':
        return <Activity className="text-blue-500" size={24} />;
      default:
        return <Activity className="text-gray-500" size={24} />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'improving':
        return '#10b981';
      case 'worsening':
        return '#ef4444';
      case 'stable':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{
            fontWeight: '600',
            marginBottom: '8px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{
              color: entry.color,
              fontSize: '14px',
              margin: '4px 0'
            }}>
              {entry.name}: {entry.value} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBloodPressureChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDarkMode ? '#334155' : '#e5e7eb'}
        />
        <XAxis
          dataKey="date"
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
          label={{
            value: 'mmHg',
            angle: -90,
            position: 'insideLeft',
            style: { fill: isDarkMode ? '#9ca3af' : '#6b7280' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}
        />
        <Line
          type="monotone"
          dataKey="systolic"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
          name="Systolic"
        />
        <Line
          type="monotone"
          dataKey="diastolic"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Diastolic"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderGlucoseChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDarkMode ? '#334155' : '#e5e7eb'}
        />
        <XAxis
          dataKey="date"
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
          label={{
            value: 'mg/dL',
            angle: -90,
            position: 'insideLeft',
            style: { fill: isDarkMode ? '#9ca3af' : '#6b7280' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#f59e0b"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#glucoseGradient)"
          name="Blood Glucose"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderGenericChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDarkMode ? '#334155' : '#e5e7eb'}
        />
        <XAxis
          dataKey="date"
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0d9db8"
          strokeWidth={2}
          dot={{ fill: '#0d9db8', r: 4 }}
          activeDot={{ r: 6 }}
          name={metricType.replace('_', ' ').toUpperCase()}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: isDarkMode
        ? '0 4px 6px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {getTrendIcon()}
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              margin: 0
            }}>
              {metricType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Trend
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: getTrendColor(),
              fontWeight: '600',
              margin: '4px 0 0 0'
            }}>
              {trendDirection === 'improving' && '↓ Improving Trend'}
              {trendDirection === 'worsening' && '↑ Needs Attention'}
              {trendDirection === 'stable' && '→ Stable'}
              {trendDirection === 'insufficient' && 'Insufficient Data'}
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Calendar size={18} style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #d1d5db',
              backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      {metricType === 'blood_pressure' && statistics.systolicAvg && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Avg Systolic
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#ef4444',
              margin: 0
            }}>
              {statistics.systolicAvg}
            </p>
          </div>
          <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Avg Diastolic
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#3b82f6',
              margin: 0
            }}>
              {statistics.diastolicAvg}
            </p>
          </div>
        </div>
      )}

      {metricType !== 'blood_pressure' && statistics.average && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              Average
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#0d9db8',
              margin: 0
            }}>
              {statistics.average}
            </p>
          </div>
          <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              Range
            </p>
            <p style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              margin: 0
            }}>
              {statistics.min} - {statistics.max}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div ref={chartRef}>
        {chartData.length === 0 ? (
          <div style={{
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            <p>No data available for the selected time range</p>
          </div>
        ) : (
          <>
            {metricType === 'blood_pressure' && renderBloodPressureChart()}
            {metricType === 'blood_glucose' && renderGlucoseChart()}
            {metricType !== 'blood_pressure' && metricType !== 'blood_glucose' && renderGenericChart()}
          </>
        )}
      </div>
    </div>
  );
};

export default Charts;