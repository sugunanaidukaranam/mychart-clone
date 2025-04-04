import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function HospitalPage() {
    const { hospitalId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    // ✅ Chat states
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // ✅ Handle sending a new message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const msgRef = collection(db, "hospitals", hospitalId, "patients", user.email.toLowerCase(), "messages");

        await addDoc(msgRef, {
            text: newMessage.trim(),
            sender: "patient",
            timestamp: serverTimestamp(),
        });

        setNewMessage("");
    };

    // ✅ Load user session + patient data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate("/");
                return;
            }

            setUser(currentUser);

            const patientRef = doc(db, "hospitals", hospitalId, "patients", currentUser.email.toLowerCase());

            try {
                const docSnap = await getDoc(patientRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log("📦 Firestore doc fetched:", data);

                    setPatientData({
                        ...data,
                        appointments: sortDates(data.appointments),
                        testResults: data.testResults?.sort() || [],
                        scans: data.scans?.sort() || [],
                    });
                    setLastUpdated(data.updatedAt);
                } else {
                    console.warn("⚠️ No patient doc found in Firestore.");
                    setPatientData(null);
                }
            } catch (err) {
                console.error("🔥 Error fetching patient data:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [hospitalId, navigate]);

    // ✅ Real-time chat messages listener
    useEffect(() => {
        if (!user) return;

        const messagesRef = collection(db, "hospitals", hospitalId, "patients", user.email.toLowerCase(), "messages");
        const q = query(messagesRef, orderBy("timestamp"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [user, hospitalId]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const sortDates = (list) => {
        return list?.slice().sort((a, b) => new Date(a) - new Date(b)) || [];
    };

    const renderList = (title, items) => (
        <div style={{ marginBottom: "1.5rem" }}>
            <h3>{title}</h3>
            {items?.length ? (
                <ul>
                    {items.map((item, idx) => (
                        <li key={idx}>✅ {item}</li>
                    ))}
                </ul>
            ) : (
                <p>No {title.toLowerCase()} available.</p>
            )}
        </div>
    );

    const formatDate = (iso) => {
        const date = new Date(iso);
        return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>🏥 {hospitalId.replace(/([A-Z])/g, " $1").trim()} - Your Medical Info</h2>
            {user && <p>Logged in as: <strong>{user.email}</strong></p>}

            <button onClick={handleLogout} style={{ marginBottom: "1rem" }}>Log Out</button>

            {loading ? (
                <p>Loading patient data...</p>
            ) : patientData ? (
                <>
                    {lastUpdated && (
                        <p style={{ fontStyle: "italic", color: "#555" }}>
                            Last updated: {formatDate(lastUpdated)}
                        </p>
                    )}

                    {renderList("Test Results", patientData.testResults)}
                    {renderList("Appointments", patientData.appointments)}
                    {renderList("Scans", patientData.scans)}

                    <div style={{ marginTop: "2rem" }}>
                        <h3>Your Medical Records Summary</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[
                                    { type: "Test Results", count: patientData.testResults?.length || 0 },
                                    { type: "Appointments", count: patientData.appointments?.length || 0 },
                                    { type: "Scans", count: patientData.scans?.length || 0 }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#4f46e5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ✅ Chat UI */}
                    <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
                        <h3>💬 Chat with Hospital</h3>

                        <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem", padding: "1rem", border: "1px solid #eee", borderRadius: "8px", background: "#fafafa" }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        textAlign: msg.sender === "patient" ? "right" : "left",
                                        marginBottom: "0.5rem"
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "20px",
                                            background: msg.sender === "patient" ? "#d1e7dd" : "#f8d7da"
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
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                style={{ flex: 1 }}
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                </>
            ) : (
                <p style={{ color: "red" }}>No records found for you in this hospital.</p>
            )}
        </div>
    );
}
