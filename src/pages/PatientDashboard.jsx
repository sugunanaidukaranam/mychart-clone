import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";

const hospitals = [
    { id: "HospitalA", name: "CityCare Hospital" },
    { id: "HospitalB", name: "GreenMed Clinic" },
    { id: "HospitalC", name: "Sunrise Medical Center" },
];

export default function PatientDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const goToHospital = (hospitalId) => {
        navigate(`/hospital/${hospitalId}`);
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>🏥 Welcome to your Health Dashboard</h2>
            {user && <p>Logged in as: <strong>{user.email}</strong></p>}

            <button onClick={handleLogout} style={{ margin: "1rem 0" }}>Log Out</button>

            <h3>Select a Hospital:</h3>
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginTop: "1rem"
            }}>
                {hospitals.map(hospital => (
                    <div
                        key={hospital.id}
                        onClick={() => goToHospital(hospital.id)}
                        style={{
                            cursor: "pointer",
                            padding: "1rem",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            width: "200px",
                            textAlign: "center",
                            backgroundColor: "#f9f9f9"
                        }}
                    >
                        🏨 <strong>{hospital.name}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}
