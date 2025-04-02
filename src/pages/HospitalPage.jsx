import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
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

                    // 👇 Add this line
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

                    {patientData && (
                        <div style={{ marginTop: "2rem" }}>
                            <h3> Your Medical Records Summary</h3>
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
                    )}
                </>
            ) : (
                <p style={{ color: "red" }}>No records found for you in this hospital.</p>
            )}
        </div>
    );
}
