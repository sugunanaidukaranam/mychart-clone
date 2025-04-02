import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [emailValid, setEmailValid] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailValid(email === "" ? null : regex.test(email));
    }, [email]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!emailValid) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/patient/dashboard");
        } catch (err) {
            console.error("Firebase login error:", err);
            setError("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="signup-wrapper">
            <div className="signup-form">
                <h2>Login</h2>

                {error && <p style={{ color: "red", fontWeight: "bold" }}>❌ {error}</p>}

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={emailValid === false ? "invalid" : ""}
                        required
                    />
                    {emailValid === false && (
                        <p style={{ color: "red", fontSize: "0.9rem" }}>❗ Invalid email format</p>
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Log In</button>
                </form>

                <p>
                    Don’t have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
