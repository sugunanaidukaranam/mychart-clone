import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const adminEmails = ["admin1@hospital.com", "staff@greenmed.com"];

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            if (!adminEmails.includes(email.toLowerCase())) {
                setError("❌ You are not authorized as an admin.");
                return;
            }

            navigate("/admin");
        } catch (err) {
            setError("❌ Login failed. Check credentials.");
        }
    };

    return (
        <div className="form-container">
            <h2>🔐 Admin Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login as Admin</button>
            </form>
        </div>
    );
}
