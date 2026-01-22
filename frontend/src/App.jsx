import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/Forgotpassword.jsx";
import EmailConfirmed from "./pages/EmailConfirmed.jsx";
import Verify2FA from "./pages/Verify2FA";
import VerifyEmail from "./pages/VerifyEmail";
import "./App.css";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/email-confirmed" element={<EmailConfirmed />} />
                    <Route path="/verify-2fa" element={<Verify2FA />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;