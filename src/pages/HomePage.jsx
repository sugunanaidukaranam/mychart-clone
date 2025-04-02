import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const adminEmails = ["admin1@hospital.com", "staff@greenmed.com"]; // add yours

export default function HomePage() {
    const navigate = useNavigate();

    // ✅ Auto-redirect if already logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const email = user.email.toLowerCase();
                if (adminEmails.includes(email)) {
                    navigate("/admin");
                } else {
                    navigate("/patient/dashboard");
                }
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "5rem" }}>
            <h1>🏥 Welcome to MyChart Clone</h1>
            <p>Please choose how you'd like to log in:</p>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "2rem" }}>
                <button onClick={() => navigate("/patient/login")}>👤 Patient Login</button>
                <button onClick={() => navigate("/admin-login")}>🩺 Admin Login</button>
            </div>
        </div>
    );
}
