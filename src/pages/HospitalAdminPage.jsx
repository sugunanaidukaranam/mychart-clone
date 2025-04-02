import React, { useState } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const hospitals = [
    { id: "HospitalA", name: "CityCare Hospital" },
    { id: "HospitalB", name: "GreenMed Clinic" },
    { id: "HospitalC", name: "Sunrise Medical Center" },
];

export default function HospitalAdminPage() {
    const navigate = useNavigate();
    const [hospitalId, setHospitalId] = useState("HospitalA");
    const [email, setEmail] = useState("");
    const [testResults, setTestResults] = useState("");
    const [appointments, setAppointments] = useState("");
    const [scans, setScans] = useState("");
    const [message, setMessage] = useState("");
 

    const adminEmails = ["admin1@hospital.com", "staff@greenmed.com"]; // Replace with real admin emails

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser || !adminEmails.includes(currentUser.email)) {
                navigate("/"); // Redirect non-admins or unauthenticated users
            }
        });

        return () => unsubscribe();
    }, [navigate]);


    const handleLoadPatient = async () => {
        setMessage("");
        if (!email) return;

        try {
            const patientRef = doc(db, "hospitals", hospitalId, "patients", email.toLowerCase());
            const docSnap = await getDoc(patientRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setTestResults(data.testResults?.join(", ") || "");
                setAppointments(data.appointments?.join(", ") || "");
                setScans(data.scans?.join(", ") || "");
                setMessage("✅ Patient data loaded. You can edit now.");
            } else {
                setMessage("⚠️ No existing data found for this patient.");
                setTestResults("");
                setAppointments("");
                setScans("");
            }
        } catch (err) {
            console.error("Error loading patient:", err);
            setMessage("❌ Failed to load patient data.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const patientRef = doc(db, "hospitals", hospitalId, "patients", email.toLowerCase());
            await setDoc(patientRef, {
                testResults: testResults.split(",").map(t => t.trim()),
                appointments: appointments.split(",").map(a => a.trim()),
                scans: scans.split(",").map(s => s.trim()),
                updatedAt: new Date().toISOString(),
            });

            setMessage("✅ Patient data saved/updated successfully!");
        } catch (err) {
            console.error("Firestore error:", err);
            setMessage("❌ Failed to save patient data.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this patient record?")) return;

        try {
            const patientRef = doc(db, "hospitals", hospitalId, "patients", email);
            await deleteDoc(patientRef);
            setTestResults("");
            setAppointments("");
            setScans("");
            setMessage("🗑️ Patient record deleted successfully.");
        } catch (err) {
            console.error("Delete error:", err);
            setMessage("❌ Failed to delete patient.");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
            <h2>🛠️ Hospital Admin Panel</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label>
                    Select Hospital:
                    <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
                        {hospitals.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                </label>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                        type="email"
                        placeholder="Patient Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ flex: 1 }}
                    />
                    <button type="button" onClick={handleLoadPatient}>🔄 Load</button>
                </div>

                <textarea
                    placeholder="Test Results (comma-separated)"
                    value={testResults}
                    onChange={(e) => setTestResults(e.target.value)}
                />

                <textarea
                    placeholder="Appointments (comma-separated)"
                    value={appointments}
                    onChange={(e) => setAppointments(e.target.value)}
                />

                <textarea
                    placeholder="Scans (comma-separated)"
                    value={scans}
                    onChange={(e) => setScans(e.target.value)}
                />

                <button type="submit">💾 Save / Update Record</button>
                <button type="button" onClick={handleDelete} style={{ backgroundColor: "#f87171", color: "white" }}>
                    🗑️ Delete Patient Record
                </button>

                {message && <p style={{ color: message.includes("✅") || message.includes("🗑️") ? "green" : "red" }}>{message}</p>}
            </form>
        </div>
    );
}
