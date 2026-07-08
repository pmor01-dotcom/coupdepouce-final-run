"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.coupdepouce-aide.com/reset-password",
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Un email de réinitialisation a été envoyé.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #4CAF50 0%, #A5D6A7 40%, #ffffff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "420px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
          Réinitialiser le mot de passe
        </h1>

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            background: "#f2f2f2",
            fontSize: "16px",
            marginBottom: "15px",
          }}
        />

        <button
          onClick={handleReset}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#9e9e9e",
            color: "white",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            marginBottom: "15px",
          }}
        >
          Envoyer le lien
        </button>

        {message && (
          <p style={{ marginBottom: "15px", fontSize: "14px", color: "#333" }}>
            {message}
          </p>
        )}

        <button
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "#bdbdbd",
            color: "white",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          Retour
        </button>
      </div>
    </div>
  );
}
