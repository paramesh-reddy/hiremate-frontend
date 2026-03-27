import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AdminRoute from '../components/layout/AdminRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/dashboard/Home';
import InterviewPractice from '../pages/dashboard/InterviewPractice';
import InterviewQnAGenerator from '../pages/dashboard/InterviewQnAGenerator';
import ResumeGenerator from '../pages/resume-generator';
import ResumeGeneratorStart from '../pages/resume-generator/ResumeGeneratorStart';
import JobRecommendations from '../pages/dashboard/JobRecommendations';
import AiResumeStudio from '../pages/ai-resume-studio/AiResumeStudio';
import JobScan from '../pages/job-scan/JobScan';
import ScanReport from '../pages/job-scan/ScanReport';
import ResumeAnalyzer from '../pages/ai-resume-studio/ResumeAnalyzer';
import ResumeAnalyzeScore from '../pages/ai-resume-studio/ResumeAnalyzeScore';
import Profile from '../pages/profile/Profile';
import OnboardingProfile from '../pages/profile/OnboardingProfile';
import Pricing from '../pages/pricing/Pricing';
import Settings from '../pages/Settings';
import StartPage from '../pages/start/StartPage';
import ApplicationTrackerPage from '../pages/application-tracker';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminOverview from '../pages/admin/AdminOverview';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminUserDetail from '../pages/admin/AdminUserDetail';
import AdminCompaniesViewed from '../pages/admin/AdminCompaniesViewed';
import AdminCareerPages from '../pages/admin/AdminCareerPages';
import AdminLearning from '../pages/admin/AdminLearning';
import AdminIssues from '../pages/admin/AdminIssues';
import PrivacyPolicy from '../pages/legal/PrivacyPolicy';
import ReportIssuePage from '../pages/report-issue/ReportIssuePage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no auth required */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/start" element={<StartPage />} />
          <Route path="/onboarding/profile" element={<OnboardingProfile />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="companies" element={<AdminCompaniesViewed />} />
              <Route path="career-pages" element={<AdminCareerPages />} />
              <Route path="learning" element={<AdminLearning />} />
              <Route path="issues" element={<AdminIssues />} />
            </Route>
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/application-tracker" element={<ApplicationTrackerPage />} />
            <Route path="/interview-practice" element={<InterviewPractice />} />
            <Route path="/interview-practice/:interviewId/questions" element={<InterviewQnAGenerator />} />
            <Route path="/resume-generator" element={<ResumeGeneratorStart />} />
            <Route path="/resume-generator/build" element={<ResumeGenerator />} />
            <Route path="/ai-resume-studio" element={<AiResumeStudio />} />
            <Route path="/job-scan" element={<JobScan />} />
            <Route path="/scan-report" element={<ScanReport />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/resume-analyze-score" element={<ResumeAnalyzeScore />} />
            <Route path="/job-recommendations" element={<JobRecommendations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/report-issue" element={<ReportIssuePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
