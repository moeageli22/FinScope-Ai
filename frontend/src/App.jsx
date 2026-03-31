import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { LanguageProvider } from "./pages/LanguageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import EmailConfirmed from "./pages/EmailConfirmed.jsx";
import Verify2FA from "./pages/Verify2FA";
import Terms from './pages/Terms'
import VerifyEmail from "./pages/EmailVerified.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import PracticeMode from './pages/PracticeMode.jsx';
import AuthCallback from './pages/AuthCallback';
import VerifyEmailCode from './pages/VerifyEmailCode';
import SmartAnalytics from './pages/SmartAnalytics';
import Help from './pages/Help.jsx';

function App() {
    return (
        <LanguageProvider>
            <CurrencyProvider>
                <ToastProvider>
                    <Router>
                        <div className="App">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/email-confirmed" element={<EmailConfirmed />} />
                                <Route path="/verify-2fa" element={<Verify2FA />} />
                                <Route path="/verify-email" element={<VerifyEmail />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/practice" element={<PracticeMode />} />
                                <Route path="/auth/callback" element={<AuthCallback />} />
                                <Route path="/verify-email-code" element={<VerifyEmailCode />} />
                                <Route path="/analytics" element={<SmartAnalytics />} />
                                <Route path="/help" element={<Help />} />
                            </Routes>
                        </div>
                    </Router>
                </ToastProvider>
            </CurrencyProvider>
        </LanguageProvider>
    );
}
export default App;

