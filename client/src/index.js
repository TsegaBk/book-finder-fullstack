import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BookProvider } from "./context/BookContext";
import { Toaster } from "react-hot-toast"; // ✅ add

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BookProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0b1020",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />
    </BookProvider>
  </React.StrictMode>
);
