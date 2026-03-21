import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { useAuth } from "./context/AuthContext.jsx";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LoginModal from "./components/common/LoginModal";
import ScrollToTop from "./components/common/ScrollToTop";
import Audience from "./components/sections/Audience";
import About from "./components/sections/AboutUs";
import Services from "./components/features/ServiceList";
import DiseaseSearch from "./components/features/DiseaseSearch";
import IndividualDiseasesInfo from "./components/features/IndividualDiseaseInfo";
import InfermedicaTriageSymptomChecker from "./components/features/InfermedicaTriageSymptomChecker";
import LabUpload from "./components/features/ai-agents/LabAnalysis/LabUpload";
import ChronicCareLanding from "./components/features/ai-agents/HealthTracking/ChronicCareLanding";
import Charts from "./components/features/ai-agents/HealthTracking/Charts";
import TrackerDashboard from "./components/features/ai-agents/HealthTracking/TrackerDashboard";
import FinderMap from "./components/features/ai-agents/SpecialistFinder/FinderMap";

// Pages
import Home from "./pages/Home";
import ContactPage from "./pages/ContactUsPage";
import SymptomPage from "./pages/SymptomPage";
import RegisterPage from "./pages/RegisterPage";
import TermsOfService from "./pages/TermsOfService";
import DoctorXAIPage from "./pages/DoctorXAIPage";
import HistoryPage from "./pages/HistoryPage";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";

// ── ProtectedRouter — JWT AuthContext ─────────────────────────────────────────
const ProtectedRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--color-secondary)'
      }}>
        Loading...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

// Login Modal Wrapper
function LoginPageWrapper() {
  return <LoginModal show={true} onClose={() => { }} />;
}

// Layout Wrapper
function Layout({ children }) {
  return (
    <div className="landing-page">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>

          {/* ── PUBLIC ROUTES ─────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/healthcare-network" element={<FinderMap />} />

          {/* ── PROTECTED ROUTES ──────────────────────────── */}
          <Route element={<ProtectedRouter />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Profile — Dashboard uses navigate('/my-profile') */}
            <Route path="/my-profile" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/services" element={<Services />} />
            <Route path="/diseases" element={<DiseaseSearch />} />
            <Route path="/diseases/:diseaseName" element={<IndividualDiseasesInfo />} />
            <Route path="/symptoms" element={<SymptomPage />} />

            {/* apiBaseUrl prop removed — InfermedicaTriageSymptomChecker now uses axios internally */}
            <Route
              path="/symptom-checker"
              element={<InfermedicaTriageSymptomChecker />}
            />

            <Route path="/lab-analysis" element={<LabUpload />} />
            <Route path="/health-tracking/chronic-care" element={<ChronicCareLanding />} />
            <Route path="/health-tracking/charts" element={<Charts patientData={[]} />} />
            <Route path="/health-tracking/dashboard" element={<TrackerDashboard />} />
            <Route path="/doctorx-ai" element={<DoctorXAIPage />} />
          </Route>

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;