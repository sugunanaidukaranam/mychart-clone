import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalPage from "./pages/HospitalPage";
import HospitalAdminPage from "./pages/HospitalAdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import HomePage from "./pages/HomePage";




export default function App() {
    return (
        <Router>
            <Routes>
                {/* Public Landing */}
                <Route path="/" element={<HomePage />} />

                {/* Patient Routes */}
                
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/patient/login" element={<LoginPage />} />
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/hospital/:hospitalId" element={<HospitalPage />} />

                {/* Admin Routes */}
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<HospitalAdminPage />} />
            </Routes>
        </Router>
    );
}
