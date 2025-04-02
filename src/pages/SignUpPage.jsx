import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [emailValid, setEmailValid] = useState(null); // true/false/null
    const [passwordStrength, setPasswordStrength] = useState("");

    const navigate = useNavigate();

    // Email validation
    useEffect(() => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailValid(email === "" ? null : regex.test(email));
    }, [email]);

    // Password strength check
    useEffect(() => {
        if (password === "") {
            setPasswordStrength("");
        } else if (password.length < 6) {
            setPasswordStrength("weak");
        } else if (password.length < 10) {
            setPasswordStrength("medium");
        } else {
            setPasswordStrength("strong");
        }
    }, [password]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        if (!emailValid) {
            setError("Please enter a valid email address.");
            return;
        }

        if (passwordStrength === "weak") {
            setError("Password is too weak. Use at least 6 characters.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/patient/dashboard");
        } catch (err) {
            console.error("Firebase error:", err);
            setError(err.message);
        }
    };

    return (
        <div className="signup-wrapper">
            <div className="signup-form">
                <h2>Sign Up</h2>

                {error && <p style={{ color: "red", fontWeight: "bold" }}>❌ {error}</p>}

                <form onSubmit={handleSignUp} noValidate>
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
                    {emailValid === true && (
                        <p style={{ color: "green", fontSize: "0.9rem" }}>✅ Email looks good</p>
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {passwordStrength && (
                        <p
                            style={{
                                color:
                                    passwordStrength === "weak"
                                        ? "red"
                                        : passwordStrength === "medium"
                                            ? "orange"
                                            : "green",
                                fontSize: "0.9rem",
                            }}
                        >
                            {passwordStrength === "weak" && "⚠️ Weak password"}
                            {passwordStrength === "medium" && " Medium password"}
                            {passwordStrength === "strong" && " Strong password"}
                        </p>
                    )}

                    <button type="submit">Create Account</button>
                </form>

                <p>
                    Already have an account? <Link to="/">Log in</Link>
                </p>
            </div>
        </div>
    );
}
