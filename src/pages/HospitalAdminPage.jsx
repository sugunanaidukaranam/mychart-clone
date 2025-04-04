import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import {
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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
    const [messages, setMessages] = useState([]);
    const [adminMessage, setAdminMessage] = useState("");

    const adminEmails = ["admin1@hospital.com", "staff@greenmed.com"];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser || !adminEmails.includes(currentUser.email)) {
                navigate("/"); // Redirect non-admins
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

                // 🔁 Load messages
                const messagesRef = collection(patientRef, "messages");
                const q = query(messagesRef, orderBy("timestamp"));

                onSnapshot(q, (snapshot) => {
                    const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setMessages(msgs);
                });

            } else {
                setMessage("⚠️ No existing data found for this patient.");
                setTestResults("");
                setAppointments("");
                setScans("");
                setMessages([]);
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
                testResults: testResults.split(",").map((t) => t.trim()),
                appointments: appointments.split(",").map((a) => a.trim()),
                scans: scans.split(",").map((s) => s.trim()),
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
            const patientRef = doc(db, "hospitals", hospitalId, "patients", email.toLowerCase());
            await deleteDoc(patientRef);
            setTestResults("");
            setAppointments("");
            setScans("");
            setMessages([]);
            setMessage("🗑️ Patient record deleted successfully.");
        } catch (err) {
            console.error("Delete error:", err);
            setMessage("❌ Failed to delete patient.");
        }
    };

    const handleSendAdminMessage = async () => {
        if (!adminMessage.trim()) return;

        const msgRef = collection(db, "hospitals", hospitalId, "patients", email.toLowerCase(), "messages");

        await addDoc(msgRef, {
            text: adminMessage.trim(),
            sender: "admin",
            timestamp: serverTimestamp(),
        });

        setAdminMessage("");
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
            <h2>🛠️ Hospital Admin Panel</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label>
                    Select Hospital:
                    <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
                        {hospitals.map((h) => (
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

                {message && (
                    <p style={{ color: message.includes("✅") || message.includes("🗑️") ? "green" : "red" }}>
                        {message}
                    </p>
                )}
            </form>

            {/* 💬 Messaging Section */}
            {messages.length > 0 && (
                <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
                    <h3>💬 Patient Messages</h3>

                    <div style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        marginBottom: "1rem",
                        padding: "1rem",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        background: "#f9f9f9"
                    }}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    textAlign: msg.sender === "admin" ? "right" : "left",
                                    marginBottom: "0.5rem"
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "20px",
                                        background: msg.sender === "admin" ? "#d1e7dd" : "#f8d7da"
                                    }}
                                >
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            placeholder="Type a reply..."
                            style={{ flex: 1 }}
                        />
                        <button onClick={handleSendAdminMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}
