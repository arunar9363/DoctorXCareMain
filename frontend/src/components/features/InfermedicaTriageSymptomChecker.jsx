import React, { useState, useEffect } from "react";
import { createAssessmentAPI as saveAssessmentAPI } from '../../api/assessment.api.js';
import useAuth from '../../context/AuthContext.jsx';

const styles = {
  root: {
    fontFamily: "'Merriweather', serif",
    background: "linear-gradient(135deg, var(--color-fourth) 0%, #f8fdfe 50%, var(--color-primary) 100%)",
    color: "var(--color-dark, #1a1a1a)",
    minHeight: "100vh",
    marginTop: "50px",
    padding: 16,
    boxSizing: "border-box",
    animation: "fadeInUp 0.8s ease-out",
  },
  rootDark: {
    background: "linear-gradient(135deg, var(--color-fourth) 0%, #0f172a 50%, var(--color-primary) 100%)",
    color: "var(--color-light, #e5e7eb)",
  },
  mainTitle: {
    textAlign: "center",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "var(--color-secondary)",
    marginBottom: 20,
    fontFamily: "'Merriweather', serif",
    animation: "slideInFromTop 0.8s ease-out 0.2s both",
  },
  card: {
    borderRadius: 10,
    padding: 20,
    maxWidth: 800,
    margin: "10px auto",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
    animation: "fadeInScale 0.8s ease-out 0.4s both",
    color: "var(--color-dark, #1a1a1a)",
  },
  left: {
    width: "100%",
  },
  header: {
    textAlign: "left",
    marginBottom: 16,
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--color-secondary)",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "var(--color-text-secondary, #666666)",
    opacity: 0.9,
    lineHeight: 1.4,
  },
  field: { marginBottom: 14 },
  label: {
    display: "block",
    marginBottom: 6,
    fontWeight: 600,
    color: "var(--color-text-primary, #1a1a1a)",
    fontSize: "0.85rem"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "rgba(107, 114, 128, 0.1)",
    color: "var(--color-text-primary, #1a1a1a)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 3px 5px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    transition: "all 0.3s ease",
    fontFamily: "'Inter', sans-serif",
  },
  darkInput: {
    background: "rgba(55, 65, 81, 0.8)",
    color: "#e5e7eb",
    boxShadow: "0 3px 5px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  },
  darkCard: {
    background: "rgba(15, 23, 42, 0.9)",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)",
    color: "#e5e7eb",
  },
  darkConditionItem: {
    background: "rgba(31, 41, 55, 0.8)",
    border: "1px solid rgba(13,157,184,0.2)",
    color: "#e5e7eb",
  },
  darkQuestionCard: {
    background: "rgba(31, 41, 55, 0.6)",
    border: "1px solid rgba(13,157,184,0.3)",
    color: "#e5e7eb",
  },
  darkSubtitle: {
    color: "#9ca3af",
  },
  darkLabel: {
    color: "#e5e7eb",
  },
  darkText: {
    color: "#e5e7eb",
  },
  btnPrimary: {
    background: "var(--color-secondary, #0d9db8)",
    color: "var(--color-primary, #ffffff)",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  btnGhost: {
    background: "transparent",
    color: "var(--color-text-primary, #1a1a1a)",
    border: "1px solid rgba(13, 157, 184, 0.3)",
    padding: "9px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.3s ease",
  },
  btnGhostDark: {
    color: "#e5e7eb",
    border: "1px solid rgba(13, 157, 184, 0.5)",
  },
  feedbackButton: {
    background: "rgba(13, 157, 184, 0.1)",
    color: "var(--color-secondary)",
    border: "1px solid var(--color-secondary)",
    padding: "9px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.3s ease",
    margin: "16px auto",
    display: "block",
    textAlign: "center",
    textDecoration: "none",
  },
  symptomChip: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(13,157,184,0.1)",
    color: "var(--color-secondary, #0d9db8)",
    padding: "5px 10px",
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
    fontSize: "0.8rem",
    border: "1px solid rgba(13,157,184,0.2)",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    marginLeft: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
  },
  questionCard: {
    background: "rgba(13,157,184,0.05)",
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    border: "1px solid rgba(13,157,184,0.2)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    color: "var(--color-text-primary, #1a1a1a)",
    animation: "slideInQuestion 0.5s ease-out",
  },
  choiceButton: {
    background: "var(--color-primary, #ffffff)",
    border: "1px solid rgba(13,157,184,0.3)",
    padding: "10px 14px",
    borderRadius: 8,
    margin: "6px 10px 6px 0",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "0.85rem",
    color: "var(--color-text-primary, #1a1a1a)",
  },
  choiceButtonDark: {
    background: "rgba(55, 65, 81, 0.8)",
    color: "#e5e7eb",
    border: "1px solid rgba(13,157,184,0.5)",
  },
  conditionItem: {
    background: "rgba(255, 255, 255, 0.6)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    border: "1px solid rgba(13,157,184,0.1)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    color: "var(--color-text-primary, #1a1a1a)",
  },
  errorBox: {
    background: "#fee",
    color: "#c00",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    border: "1px solid #fcc",
    fontSize: "0.85rem",
  },
  errorBoxDark: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  warningBox: {
    background: "#fff3cd",
    color: "#856404",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    border: "1px solid #ffeaa7",
    fontSize: "0.85rem",
  },
  warningBoxDark: {
    background: "rgba(245, 158, 11, 0.1)",
    color: "#fcd34d",
    border: "1px solid rgba(245, 158, 11, 0.3)",
  },
  loaderContainer: {
    textAlign: 'center'
  },
  loader: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'inline-block',
    borderTop: '3px solid var(--color-secondary)',
    borderRight: '3px solid transparent',
    borderBottom: '3px solid transparent',
    borderLeft: '3px solid transparent',
    boxSizing: 'border-box',
    animation: 'rotation 1s linear infinite',
    position: 'relative'
  },
  searchResultsContainer: {
    marginBottom: 14,
    maxHeight: 180,
    overflowY: "auto",
    border: "1px solid rgba(13,157,184,0.2)",
    borderRadius: 10,
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
  },
  searchResultsContainerDark: {
    background: "rgba(31, 41, 55, 0.8)",
    border: "1px solid rgba(13,157,184,0.3)",
  },
  searchResultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottom: "1px solid rgba(13,157,184,0.1)",
    color: "var(--color-text-primary, #1a1a1a)",
    fontSize: "0.85rem",
  },
  searchResultItemDark: {
    color: "#e5e7eb",
    borderBottom: "1px solid rgba(13,157,184,0.2)",
  },
  searchResultName: {
    fontWeight: "bold",
    color: "var(--color-text-primary, #1a1a1a)",
    fontSize: "0.85rem",
  },
  searchResultNameDark: {
    color: "#e5e7eb",
  },
  searchResultCommonName: {
    fontSize: 11,
    color: "#666",
  },
  searchResultCommonNameDark: {
    color: "#9ca3af",
  },
  infoBox: {
    background: "rgba(13,157,184,0.05)",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeft: "3px solid var(--color-secondary, #0d9db8)",
    color: "var(--color-text-primary, #1a1a1a)",
    fontSize: "0.85rem",
  },
  infoBoxDark: {
    background: "rgba(13,157,184,0.1)",
    color: "#e5e7eb",
  },
  disclaimerBox: {
    marginTop: 16,
    padding: 10,
    background: "#fff3cd",
    borderRadius: 6,
    fontSize: 11,
    color: "#856404",
  },
  disclaimerBoxDark: {
    background: "rgba(245, 158, 11, 0.1)",
    color: "#fcd34d",
  },
  careRecommendations: {
    background: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
    border: "1px solid #e9ecef",
    color: "#1a1a1a",
    fontSize: "0.85rem",
  },
  careRecommendationsDark: {
    background: "rgba(31, 41, 55, 0.6)",
    border: "1px solid rgba(13,157,184,0.2)",
    color: "#e5e7eb",
  },
  takeCareMessage: {
    background: "linear-gradient(135deg, rgba(13,157,184,0.1), rgba(13,157,184,0.05))",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    border: "1px solid rgba(13,157,184,0.2)",
    color: "var(--color-text-primary, #1a1a1a)",
    fontSize: "0.85rem",
  },
  takeCareMessageDark: {
    background: "linear-gradient(135deg, rgba(13,157,184,0.15), rgba(13,157,184,0.08))",
    border: "1px solid rgba(13,157,184,0.3)",
    color: "#e5e7eb",
  },
  probabilityBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 6,
    fontWeight: "bold",
    fontSize: "0.8rem",
    marginLeft: 8,
  }
};

export default function InfermedicaTriageSymptomChecker() {
  // Replaces apiBaseUrl prop — all calls now go through axios API functions
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: 18,
    sex: "male",
  });

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [symptoms, setSymptoms] = useState([]);
  const [symptomSearch, setSymptomSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [allSymptoms, setAllSymptoms] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [maxQuestions] = useState(18);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [assessmentSaved, setAssessmentSaved] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Replaced Firebase onAuthStateChanged — now uses JWT AuthContext
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkTheme(theme === 'dark');
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const loadingTimer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);

    return () => {
      observer.disconnect();
      clearTimeout(loadingTimer);
    };
  }, []);

  useEffect(() => {
    if (!isPageLoading) {
      loadAllSymptoms();
    }
  }, [patientInfo.age, isPageLoading]);

  // Replaces generic fetch-based apiCall — now uses typed axios API functions
  // Each caller (loadAllSymptoms, startDiagnosis, etc.) imports and calls
  // the specific API function directly. This function is kept as a fallback
  // for any endpoint not yet migrated.
  const apiCall = async (endpoint, options = {}) => {
    setError(null);
    try {
      console.log(`API Call: ${endpoint}`, options.body ? JSON.parse(options.body) : '');

      // Route to the correct axios API function based on endpoint
      const { default: axios } = await import('../../api/axios.js');
      const method = (options.method || 'GET').toLowerCase();
      const body = options.body ? JSON.parse(options.body) : undefined;
      const backendEndpoint = `/api/infermedica${endpoint}`;

      const response = await axios[method](backendEndpoint, body);
      console.log(`API Response:`, response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Unknown API error";
      setError(errorMessage);
      console.error("API call failed:", err);
      throw err;
    }
  };

  const loadAllSymptoms = async () => {
    try {
      const result = await apiCall(`/symptoms?age=${patientInfo.age}`);
      console.log("Loaded symptoms:", result.length);
      setAllSymptoms(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to load symptoms:", err);
      setAllSymptoms([
        { id: "s_1193", name: "Headache", common_name: "Headache" },
        { id: "s_1394", name: "Fever", common_name: "Fever" },
        { id: "s_1988", name: "Cough", common_name: "Cough" },
        { id: "s_102", name: "Abdominal pain", common_name: "Stomach pain" },
        { id: "s_1398", name: "Fatigue", common_name: "Tiredness" }
      ]);
    }
  };

  const searchSymptoms = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const localResults = allSymptoms.filter(symptom =>
        symptom.name.toLowerCase().includes(query.toLowerCase()) ||
        (symptom.common_name && symptom.common_name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10);

      if (localResults.length > 0) {
        console.log("Using local search results:", localResults.length);
        setSearchResults(localResults);
        return;
      }

      console.log("No local results, trying API suggest...");

      // Replaces inline fetch — uses apiCall which routes through axios to backend
      const results = await apiCall(`/symptoms?q=${encodeURIComponent(query)}&age=${patientInfo.age}`);
      console.log("API suggest results:", Array.isArray(results) ? results.length : 0);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error("Symptom search failed:", err);
      const fallbackResults = allSymptoms.slice(0, 10);
      setSearchResults(fallbackResults);
      setError("Search temporarily unavailable. Showing common symptoms.");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (symptomSearch) {
        searchSymptoms(symptomSearch);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [symptomSearch, patientInfo.age, allSymptoms]);

  const addSymptom = (symptom) => {
    const newEvidenceItem = {
      id: symptom.id,
      choice_id: "present",
      source: "initial"
    };

    setEvidence(prev => {
      const filtered = prev.filter(e => e.id !== symptom.id);
      return [...filtered, newEvidenceItem];
    });

    setSymptoms(prev => {
      const exists = prev.find(s => s.id === symptom.id);
      if (!exists) {
        return [...prev, symptom];
      }
      return prev;
    });

    setSymptomSearch("");
    setSearchResults([]);
  };

  const removeSymptom = (symptomId) => {
    setEvidence(prev => prev.filter(e => e.id !== symptomId));
    setSymptoms(prev => prev.filter(s => s.id !== symptomId));
  };

  const startDiagnosis = async () => {
    if (evidence.length === 0) {
      setError("Please add at least one symptom before starting diagnosis.");
      return;
    }

    setIsLoading(true);
    setQuestionCount(0);
    setError(null);

    try {
      const diagnosisPayload = {
        sex: patientInfo.sex,
        age: {
          value: parseInt(patientInfo.age),
          unit: "year"
        },
        evidence: evidence
      };

      console.log("Starting diagnosis with:", diagnosisPayload);
      const result = await apiCall("/diagnosis", {
        method: "POST",
        body: JSON.stringify(diagnosisPayload),
      });

      console.log("Diagnosis result:", result);

      if (result.question && result.question.text) {
        setCurrentQuestion(result.question);
        setConditions(result.conditions || []);
        setQuestionCount(1);
        setStep(2);
      } else if (result.conditions && result.conditions.length > 0) {
        setConditions(result.conditions);
        setFinalResult(result);
        setStep(3);
      } else {
        setError("No diagnosis results received. This might indicate an issue with the selected symptoms.");
        setConditions([]);
        setStep(3);
      }
    } catch (err) {
      console.error("Diagnosis failed:", err);
      setError(`Diagnosis failed: ${err.message}. Please try again with different symptoms.`);
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = async (answerId, choiceId) => {
    if (answerId === "skip") {
      return continueDialogue();
    }

    setIsLoading(true);
    setError(null);

    try {
      const newEvidenceItem = {
        id: answerId,
        choice_id: choiceId,
        source: "suggest"
      };

      const newEvidence = [...evidence, newEvidenceItem];
      setEvidence(newEvidence);

      await continueDialogue(newEvidence);
    } catch (err) {
      console.error("Question answering failed:", err);
      setError(`Failed to process answer: ${err.message}`);
      setIsLoading(false);
    }
  };

  const continueDialogue = async (updatedEvidence = evidence) => {
    setIsLoading(true);
    setError(null);

    if (questionCount >= maxQuestions) {
      console.log(`Reached question limit (${maxQuestions}), proceeding to results`);
      setCurrentQuestion(null);
      setStep(3);
      setIsLoading(false);
      return;
    }

    try {
      const diagnosisPayload = {
        sex: patientInfo.sex,
        age: {
          value: parseInt(patientInfo.age),
          unit: "year"
        },
        evidence: updatedEvidence
      };

      console.log("Continuing diagnosis with:", diagnosisPayload);
      const result = await apiCall("/diagnosis", {
        method: "POST",
        body: JSON.stringify(diagnosisPayload),
      });

      console.log("Next diagnosis result:", result);

      if (result.question && result.question.text && questionCount < maxQuestions) {
        setCurrentQuestion(result.question);
        setConditions(result.conditions || []);
        setQuestionCount(prev => prev + 1);
      } else {
        setCurrentQuestion(null);
        setConditions(result.conditions || []);
        setFinalResult(result);
        setStep(3);
      }
    } catch (err) {
      console.error("Dialogue continuation failed:", err);
      setError(`Failed to continue: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTriage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const triagePayload = {
        sex: patientInfo.sex,
        age: {
          value: parseInt(patientInfo.age),
          unit: "year"
        },
        evidence: evidence,
      };

      console.log("Getting triage with:", triagePayload);
      const result = await apiCall("/triage", {
        method: "POST",
        body: JSON.stringify(triagePayload),
      });

      console.log("Triage result:", result);
      const updatedResult = { ...(finalResult || {}), triage: result };
      setFinalResult(updatedResult);

      // Auto-save to MongoDB when triage is complete (user is logged in)
      if (isAuthenticated) {
        try {
          await saveAssessmentToBackend(updatedResult);
          setAssessmentSaved(true);
          showToast('Assessment auto-saved! View it in your History.', 'success');
        } catch (autoSaveErr) {
          console.error('Auto-save failed:', autoSaveErr);
          // Auto-save failure is silent — user can still manually save
        }
      }
    } catch (err) {
      console.error("Triage failed:", err);
      setError(`Triage failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCareRecommendations = (triageLevel) => {
    const recommendations = {
      'emergency': [
        "Go to the nearest emergency room immediately",
        "Do not drive yourself - call emergency services or have someone drive you",
        "Bring a list of your current medications",
        "Have someone accompany you if possible"
      ],
      'emergency_ambulance': [
        "Call 102 or emergency services immediately",
        "Do not attempt to drive or transport yourself",
        "Stay calm and follow dispatcher instructions",
        "Have your medical information ready if possible"
      ],
      'consultation_6': [
        "Contact your doctor or urgent care within 6 hours",
        "Monitor symptoms closely and seek immediate care if they worsen",
        "Avoid strenuous activities until evaluated",
        "Keep track of any new symptoms that develop"
      ],
      'consultation_24': [
        "Schedule an appointment with your healthcare provider within 24 hours",
        "Monitor your symptoms and note any changes",
        "Rest and stay hydrated",
        "Seek immediate care if symptoms worsen significantly"
      ],
      'consultation': [
        "Schedule a routine appointment with your healthcare provider",
        "Keep a symptom diary to discuss with your doctor",
        "Continue normal activities unless symptoms interfere",
        "Consider preventive measures relevant to your symptoms"
      ],
      'self_care': [
        "Monitor your symptoms at home",
        "Rest, stay hydrated, and maintain good nutrition",
        "Use appropriate over-the-counter remedies if needed",
        "Contact a healthcare provider if symptoms persist or worsen"
      ],
      'no_action': [
        "Continue your normal daily activities",
        "Maintain healthy lifestyle habits",
        "Stay aware of any symptom changes",
        "Consider routine preventive care"
      ]
    };

    return recommendations[triageLevel] || [
      "Follow up with a healthcare provider for proper evaluation",
      "Monitor your symptoms",
      "Seek care if symptoms change or worsen"
    ];
  };

  const getTriageDisplayText = (level) => {
    const triageTexts = {
      'emergency': 'Emergency Care Needed',
      'emergency_ambulance': 'Call Emergency Services (102)',
      'consultation_6': 'See Doctor Within 6 Hours',
      'consultation_24': 'See Doctor Within 24 Hours',
      'consultation': 'Schedule Doctor Visit',
      'self_care': 'Self-Care Recommended',
      'no_action': 'No Action Needed'
    };
    return triageTexts[level] || level || 'Assessment Complete';
  };

  const getTriageUrgency = (level) => {
    const urgencyTexts = {
      'emergency': 'URGENT: Go to emergency room immediately',
      'emergency_ambulance': 'CRITICAL: Call 102 or emergency services now',
      'consultation_6': 'HIGH PRIORITY: Seek medical attention within 6 hours',
      'consultation_24': 'MODERATE PRIORITY: Schedule appointment within 24 hours',
      'consultation': 'LOW PRIORITY: Schedule routine appointment',
      'self_care': 'Monitor symptoms and use home care methods',
      'no_action': 'Continue normal activities'
    };
    return urgencyTexts[level];
  };

  const getTriageColor = (level) => {
    const colors = {
      'emergency': '#fee2e2',
      'emergency_ambulance': '#fecaca',
      'consultation_6': '#fed7aa',
      'consultation_24': '#fef3c7',
      'consultation': '#d1fae5',
      'self_care': '#ecfccb',
      'no_action': '#f0f9ff'
    };
    return colors[level] || '#f3f4f6';
  };

  // Get probability level styling
  const getProbabilityLevel = (probability) => {
    const percent = probability * 100;
    if (percent >= 70) {
      return { text: 'High', color: '#ef4444', bg: '#fee2e2' };
    } else if (percent >= 40) {
      return { text: 'Medium', color: '#f59e0b', bg: '#fef3c7' };
    } else if (percent >= 20) {
      return { text: 'Low', color: '#3b82f6', bg: '#dbeafe' };
    } else {
      return { text: 'Minimal', color: '#10b981', bg: '#d1fae5' };
    }
  };

  // ── Core save function — saves assessment to MongoDB ────────────────────────
  const saveAssessmentToBackend = async (triageResult = finalResult) => {
    if (!isAuthenticated || !triageResult) return;

    const assessmentData = {
      patientName: patientInfo.name,
      age: patientInfo.age,
      sex: patientInfo.sex,
      symptoms: symptoms.map(s => s.name),
      conditions: conditions.map(c => ({
        name: c.name,
        probability: Math.round(c.probability * 100),
        commonName: c.common_name
      })),
      triageLevel: triageResult.triage?.triage_level || 'self_care',
      triageDescription: triageResult.triage?.description || '',
      recommendations: getCareRecommendations(triageResult.triage?.triage_level || 'self_care'),
      evidenceCount: evidence.length
    };

    const res = await saveAssessmentAPI(assessmentData);
    return res.data;
  };

  const handleSaveAssessment = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save your assessment', 'error');
      return;
    }

    if (!finalResult) {
      showToast('Please Click on Get Core Recommendations, before saving.', 'error');
      return;
    }

    setIsSavingAssessment(true);

    try {
      // Replaced: saveAssessmentToFirebase → MongoDB backend API
      await saveAssessmentToBackend(finalResult);
      setAssessmentSaved(true);
      showToast('Assessment saved successfully! View it in your History.', 'success');
    } catch (error) {
      console.error('Error saving assessment:', error);
      showToast('Failed to save assessment. Please try again.', 'error');
    } finally {
      setIsSavingAssessment(false);
    }
  };

  const reset = () => {
    setStep(0);
    setSymptoms([]);
    setEvidence([]);
    setCurrentQuestion(null);
    setConditions([]);
    setFinalResult(null);
    setError(null);
    setSymptomSearch("");
    setSearchResults([]);
    setQuestionCount(0);
    setAssessmentSaved(false);
  };

  const getThemedStyle = (baseStyle, darkStyle = {}) => {
    return isDarkTheme ? { ...baseStyle, ...darkStyle } : baseStyle;
  };

  const renderPatientForm = () => (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Symptom Analyzer</div>
          <div style={getThemedStyle(styles.subtitle, styles.darkSubtitle)}>AI-powered symptom assessment for better health decisions.</div>
        </div>
      </div>

      <div style={styles.field}>
        <label style={getThemedStyle(styles.label, styles.darkLabel)}>Patient Name:</label>
        <input
          style={getThemedStyle(styles.input, styles.darkInput)}
          value={patientInfo.name}
          onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter patient name"
        />
      </div>
      <div style={styles.field}>
        <label style={getThemedStyle(styles.label, styles.darkLabel)}>Age:</label>
        <input
          type="number"
          style={getThemedStyle(styles.input, styles.darkInput)}
          value={patientInfo.age}
          onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
          min="1"
          max="130"
        />
      </div>
      <div style={styles.field}>
        <label style={getThemedStyle(styles.label, styles.darkLabel)}>Sex:</label>
        <select
          style={getThemedStyle(styles.input, styles.darkInput)}
          value={patientInfo.sex}
          onChange={(e) => setPatientInfo(prev => ({ ...prev, sex: e.target.value }))}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="male">Other</option>
        </select>
      </div>
      <button onClick={() => setStep(1)} style={styles.btnPrimary}>
        Continue to Symptoms
      </button>
    </div>
  );

  const renderSymptomSelection = () => (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Add Your Symptoms</div>
          <div style={getThemedStyle(styles.subtitle, styles.darkSubtitle)}>Search and add the symptoms you're experiencing.</div>
        </div>
      </div>

      <div style={styles.field}>
        <input
          style={getThemedStyle(styles.input, styles.darkInput)}
          value={symptomSearch}
          onChange={(e) => setSymptomSearch(e.target.value)}
          placeholder="Search symptoms (e.g., headache, fever, cough)"
        />
      </div>

      {searchResults.length > 0 && (
        <div style={getThemedStyle(styles.searchResultsContainer, styles.searchResultsContainerDark)}>
          {searchResults.map((symptom) => (
            <div key={symptom.id} style={getThemedStyle(styles.searchResultItem, styles.searchResultItemDark)}>
              <div>
                <div style={getThemedStyle(styles.searchResultName, styles.searchResultNameDark)}>{symptom.name}</div>
                {symptom.common_name && symptom.common_name !== symptom.name && (
                  <div style={getThemedStyle(styles.searchResultCommonName, styles.searchResultCommonNameDark)}>({symptom.common_name})</div>
                )}
              </div>
              <button
                onClick={() => addSymptom(symptom)}
                style={styles.btnPrimary}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {symptoms.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h4 style={getThemedStyle({ color: "var(--color-text-primary, #1a1a1a)", fontSize: "0.95rem" }, styles.darkText)}>Selected Symptoms:</h4>
          <div>
            {symptoms.map((symptom) => (
              <span key={symptom.id} style={styles.symptomChip}>
                {symptom.name}
                <button
                  onClick={() => removeSymptom(symptom.id)}
                  style={styles.removeBtn}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <div style={getThemedStyle(styles.errorBox, styles.errorBoxDark)}>{error}</div>}

      {symptoms.length === 0 && !symptomSearch && (
        <div style={getThemedStyle(styles.warningBox, styles.warningBoxDark)}>
          Start typing to search for symptoms, or select from common symptoms that will appear.
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={startDiagnosis}
          disabled={symptoms.length === 0 || isLoading}
          style={{
            ...styles.btnPrimary,
            opacity: (symptoms.length === 0 || isLoading) ? 0.5 : 1,
            cursor: (symptoms.length === 0 || isLoading) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? "Starting..." : "Start Diagnosis"}
        </button>
        <button onClick={() => setStep(0)} style={getThemedStyle(styles.btnGhost, styles.btnGhostDark)}>
          Back
        </button>
      </div>
    </div>
  );

  const renderQuestion = () => (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Question {questionCount} of {maxQuestions}</div>
          <div style={getThemedStyle(styles.subtitle, styles.darkSubtitle)}>Answer to help improve the diagnosis accuracy.</div>
        </div>
      </div>

      {error && <div style={getThemedStyle(styles.errorBox, styles.errorBoxDark)}>{error}</div>}

      {currentQuestion && (
        <div style={getThemedStyle(styles.questionCard, styles.darkQuestionCard)}>
          <h3 style={{ marginBottom: 10, color: isDarkTheme ? "#e5e7eb" : "#1a1a1a", fontSize: "1rem" }}>{currentQuestion.text}</h3>

          {currentQuestion.type === "single" && currentQuestion.items && currentQuestion.items.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 10, fontWeight: 500, color: isDarkTheme ? "#e5e7eb" : "#1a1a1a", fontSize: "0.9rem" }}>
                {currentQuestion.items[0].name}
              </div>
              <button
                onClick={() => answerQuestion(currentQuestion.items[0].id, "present")}
                disabled={isLoading}
                style={{ ...styles.btnPrimary, marginRight: 8 }}
              >
                Yes
              </button>
              <button
                onClick={() => answerQuestion(currentQuestion.items[0].id, "absent")}
                disabled={isLoading}
                style={{ ...getThemedStyle(styles.btnGhost, styles.btnGhostDark), marginRight: 8 }}
              >
                No
              </button>
              <button
                onClick={() => answerQuestion(currentQuestion.items[0].id, "unknown")}
                disabled={isLoading}
                style={getThemedStyle(styles.btnGhost, styles.btnGhostDark)}
              >
                Don't know
              </button>
            </div>
          )}

          {currentQuestion.type === "group_single" && currentQuestion.items && (
            <div style={{ marginTop: 10 }}>
              {currentQuestion.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => answerQuestion(item.id, "present")}
                  disabled={isLoading}
                  style={{ ...getThemedStyle(styles.choiceButton, styles.choiceButtonDark), display: "block", marginBottom: 8, width: "100%" }}
                >
                  {item.name}
                </button>
              ))}
              <button
                onClick={() => answerQuestion("skip", "unknown")}
                disabled={isLoading}
                style={{ ...getThemedStyle(styles.btnGhost, styles.btnGhostDark), marginTop: 8 }}
              >
                None of these apply
              </button>
            </div>
          )}

          {currentQuestion.type === "group_multiple" && currentQuestion.items && (
            <div style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 8, fontSize: 13, color: isDarkTheme ? "#9ca3af" : "#666" }}>
                Select all that apply:
              </div>
              {currentQuestion.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => answerQuestion(item.id, "present")}
                  disabled={isLoading}
                  style={getThemedStyle(styles.choiceButton, styles.choiceButtonDark)}
                >
                  {item.name}
                </button>
              ))}
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => continueDialogue()}
                  disabled={isLoading}
                  style={styles.btnPrimary}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: isDarkTheme ? "1px solid #374151" : "1px solid #eee" }}>
            <button
              onClick={() => {
                setCurrentQuestion(null);
                setStep(3);
              }}
              disabled={isLoading}
              style={{ ...getThemedStyle(styles.btnGhost, styles.btnGhostDark), fontSize: "0.8rem" }}
            >
              Skip remaining questions and see results
            </button>
          </div>
        </div>
      )}

      {conditions.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <h4 style={getThemedStyle({ color: "var(--color-text-primary, #1a1a1a)", fontSize: "0.95rem" }, styles.darkText)}>Current Possible Conditions:</h4>
          {conditions.slice(0, 3).map((condition) => (
            <div key={condition.id} style={getThemedStyle(styles.conditionItem, styles.darkConditionItem)}>
              <strong style={{ color: isDarkTheme ? "#e5e7eb" : "#1a1a1a", fontSize: "0.85rem" }}>{condition.name}</strong>
              <span style={{ marginLeft: 6, color: isDarkTheme ? "#9ca3af" : "#666", fontSize: "0.75rem" }}>
                ({Math.round(condition.probability * 100)}% probability)
              </span>
            </div>
          ))}
          {conditions.length > 3 && (
            <div style={{ fontSize: "0.8rem", color: isDarkTheme ? "#9ca3af" : "#666", marginTop: 6 }}>
              ...and {conditions.length - 3} more conditions
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>
            {patientInfo.name ? `${patientInfo.name}'s Assessment Results` : 'Assessment Results'}
          </div>
          <div style={getThemedStyle(styles.subtitle, styles.darkSubtitle)}>Based on the information provided</div>
        </div>
      </div>

      {error && <div style={getThemedStyle(styles.errorBox, styles.errorBoxDark)}>{error}</div>}

      {patientInfo.name && (
        <div style={getThemedStyle(styles.infoBox, styles.infoBoxDark)}>
          <h4 style={{ margin: 0, color: "var(--color-secondary, #0d9db8)", fontSize: "0.95rem" }}>
            Hello {patientInfo.name},
          </h4>
          <p style={{ margin: "6px 0 0 0", fontSize: "0.8rem", color: isDarkTheme ? "#e5e7eb" : "#1a1a1a" }}>
            Based on your symptoms and responses, here's what our AI assessment found:
          </p>
        </div>
      )}

      {conditions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={getThemedStyle({ color: "var(--color-text-primary, #1a1a1a)", fontSize: "1.1rem" }, styles.darkText)}>Possible Conditions:</h3>
          <div style={{ marginBottom: 10, fontSize: "0.8rem", color: isDarkTheme ? "#9ca3af" : "#666" }}>
            These are potential conditions based on your symptoms. A healthcare provider can provide proper diagnosis.
          </div>
          {conditions.map((condition, index) => {
            const probLevel = getProbabilityLevel(condition.probability);
            return (
              <div key={condition.id} style={{
                ...getThemedStyle(styles.conditionItem, styles.darkConditionItem),
                background: index === 0 ? "rgba(13,157,184,0.1)" : getThemedStyle(styles.conditionItem, styles.darkConditionItem).background
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <strong style={{ color: isDarkTheme ? "#e5e7eb" : "#1a1a1a", fontSize: "0.9rem" }}>{condition.name}</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      ...styles.probabilityBadge,
                      background: probLevel.bg,
                      color: probLevel.color
                    }}>
                      {probLevel.text}
                    </span>
                    <span style={{ color: "#0d9db8", fontWeight: "bold", fontSize: "0.85rem" }}>
                      {Math.round(condition.probability * 100)}%
                    </span>
                  </div>
                </div>
                {condition.common_name && condition.common_name !== condition.name && (
                  <div style={{ fontSize: 11, color: isDarkTheme ? "#9ca3af" : "#666", marginTop: 3 }}>
                    Also known as: {condition.common_name}
                  </div>
                )}
                {index === 0 && (
                  <div style={{ fontSize: "0.75rem", color: "#0d9db8", marginTop: 4, fontStyle: "italic" }}>
                    Most likely condition based on your symptoms
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!finalResult?.triage && (
        <button onClick={getTriage} disabled={isLoading} style={styles.btnPrimary}>
          {isLoading ? "Getting recommendation..." : "Get Care Recommendation"}
        </button>
      )}

      {finalResult?.triage && (
        <div style={{ background: "rgba(13,157,184,0.1)", padding: 12, borderRadius: 6, marginBottom: 14 }}>
          <h3 style={getThemedStyle({ color: "var(--color-text-primary, #1a1a1a)", fontSize: "1rem" }, styles.darkText)}>Recommended Care Level:</h3>
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#0d9db8" }}>
            {getTriageDisplayText(finalResult.triage.triage_level)}
          </div>
          {finalResult.triage.description && (
            <p style={{ marginTop: 6, color: isDarkTheme ? "#e5e7eb" : "#1a1a1a", fontSize: "0.8rem" }}>{finalResult.triage.description}</p>
          )}
          {getTriageUrgency(finalResult.triage.triage_level) && (
            <div style={{
              marginTop: 10,
              padding: 10,
              background: getTriageColor(finalResult.triage.triage_level),
              borderRadius: 6,
              fontWeight: "bold",
              color: "#1a1a1a",
              fontSize: "0.85rem"
            }}>
              {getTriageUrgency(finalResult.triage.triage_level)}
            </div>
          )}
        </div>
      )}

      {finalResult?.triage && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={getThemedStyle({ color: "var(--color-text-primary, #1a1a1a)", fontSize: "1rem" }, styles.darkText)}>What You Need to Do:</h3>
          <div style={getThemedStyle(styles.careRecommendations, styles.careRecommendationsDark)}>
            {getCareRecommendations(finalResult.triage.triage_level, conditions).map((recommendation, index) => (
              <div key={index} style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: index < getCareRecommendations(finalResult.triage.triage_level, conditions).length - 1 ? 10 : 0
              }}>
                <span style={{
                  color: "#0d9db8",
                  fontWeight: "bold",
                  marginRight: 6,
                  marginTop: 1,
                  fontSize: "1rem"
                }}>
                  {index + 1}.
                </span>
                <span style={{ fontSize: "0.8rem", lineHeight: "1.4", color: isDarkTheme ? "#e5e7eb" : "#1a1a1a" }}>
                  {recommendation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={getThemedStyle(styles.takeCareMessage, styles.takeCareMessageDark)}>
        <h4 style={{ color: "var(--color-secondary, #0d9db8)", margin: "0 0 8px 0", fontSize: "0.95rem" }}>
          Take Care Message:
        </h4>
        <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: "1.5", color: isDarkTheme ? "#e5e7eb" : "#1a1a1a" }}>
          {patientInfo.name ? `${patientInfo.name}, ` : ''}
          remember that this assessment is a helpful tool, but it cannot replace professional medical judgment.
          Your health is important - please follow the care recommendations above and don't hesitate to seek
          medical attention if you're concerned about your symptoms. Take care of yourself and stay healthy!
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={reset} style={getThemedStyle(styles.btnGhost, styles.btnGhostDark)}>
          Start New Assessment
        </button>

        {isAuthenticated && !assessmentSaved && (
          <button
            onClick={handleSaveAssessment}
            disabled={isSavingAssessment}
            style={{
              ...styles.btnPrimary,
              opacity: isSavingAssessment ? 0.6 : 1,
              cursor: isSavingAssessment ? 'not-allowed' : 'pointer'
            }}
          >
            {isSavingAssessment ? 'Saving...' : 'Save Assessment'}
          </button>
        )}

        {assessmentSaved && (
          <div style={{
            padding: "8px 16px",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
            borderRadius: 10,
            fontSize: "13px",
            fontWeight: 600,
            border: "1px solid rgba(16, 185, 129, 0.3)"
          }}>
            ✓ Assessment Saved
          </div>
        )}

        <a
          href="/contact"
          style={styles.feedbackButton}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-secondary)";
            e.target.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(13, 157, 184, 0.1)";
            e.target.style.color = "var(--color-secondary)";
          }}
        >
          Share Feedback
        </a>
      </div>

      <div style={getThemedStyle(styles.disclaimerBox, styles.disclaimerBoxDark)}>
        <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment. If you're experiencing a medical emergency, call emergency services immediately.
      </div>
    </div>
  );

  const LoaderComponent = () => (
    <div style={styles.loaderContainer}>
      <div style={styles.loader}></div>
      <div style={{ color: "var(--color-secondary)", fontSize: "1rem", fontWeight: 500, marginTop: 10 }}>
        Loading...
      </div>
    </div>
  );

  const ToastNotification = () => (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: toastVisible ? '20px' : '-400px',
      background: toastType === 'success'
        ? 'linear-gradient(135deg, #10b981, #059669)'
        : 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      padding: '12px 18px',
      borderRadius: '10px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      transition: 'right 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      minWidth: '280px',
      maxWidth: '380px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px'
    }}>
      <div style={{ fontSize: '20px' }}>
        {toastType === 'success' ? '✓' : '✕'}
      </div>
      <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>
        {toastMessage}
      </div>
      <button
        onClick={() => setToastVisible(false)}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
      >
        ×
      </button>
    </div>
  );

  if (isPageLoading) {
    return (
      <>
        <style>
          {`
            :root {
              --color-primary: #ffffff;
              --color-secondary: #0d9db8;
              --color-third: #00aeffff;
              --color-fourth: #f0f9ff;
              --color-dark: #1a1a1a;
              --color-light: #e5e7eb;
              --color-text-primary: #1a1a1a;
              --color-text-secondary: #666666;
            }
            
            [data-theme="dark"] {
              --color-primary: #0f172a;
              --color-secondary: #0d9db8;
              --color-third: #60a5fa;
              --color-fourth: #1f2937;
              --color-dark: #1a1a1a;
              --color-light: #e5e7eb;
              --color-text-primary: #e5e7eb;
              --color-text-secondary: #9ca3af;
            }
            
            @keyframes rotation {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes slideInFromTop {
              from {
                opacity: 0;
                transform: translateY(-50px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            
            @keyframes slideInQuestion {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}
        </style>
        <div style={{
          ...styles.root,
          ...(isDarkTheme ? styles.rootDark : {}),
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          animation: "none"
        }}>
          <LoaderComponent />
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          :root {
            --color-primary: #ffffff;
            --color-secondary: #0d9db8;
            --color-third: #00aeffff;
            --color-fourth: #f0f9ff;
            --color-dark: #1a1a1a;
            --color-light: #e5e7eb;
            --color-text-primary: #1a1a1a;
            --color-text-secondary: #666666;
          }
          
          [data-theme="dark"] {
            --color-primary: #0f172a;
            --color-secondary: #0d9db8;
            --color-third: #60a5fa;
            --color-fourth: #1f2937;
            --color-dark: #1a1a1a;
            --color-light: #e5e7eb;
            --color-text-primary: #e5e7eb;
            --color-text-secondary: #9ca3af;
          }
          
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInFromTop {
            from {
              opacity: 0;
              transform: translateY(-50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes slideInQuestion {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>

      <ToastNotification />

      <div style={getThemedStyle(styles.root, styles.rootDark)}>
        <div style={styles.mainTitle}>DoctorXCare</div>

        <div style={getThemedStyle(styles.card, styles.darkCard)}>
          <div style={styles.left}>
            {step === 0 && renderPatientForm()}
            {step === 1 && renderSymptomSelection()}
            {step === 2 && renderQuestion()}
            {step === 3 && renderResults()}
          </div>
        </div>
      </div>
    </>
  );
}