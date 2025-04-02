import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css"; // or index.css depending on what you're using

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
