"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useLanguage } from "../components/LanguageProvider";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ⭐ Supabase client (frontend)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ⭐ NEW handleReset — Supabase only, no backend route
  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(t('common.error') + " : " + error.message);
    } else {
      setMessage(t('forgotPassword.emailSentDesc'));
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #4CAF50 0%, #A5D6A7 40%, #ffffff 100%)",
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
          {t('forgotPassword.title')}
        </h1>

        <input
          type="email"
          placeholder={t('forgotPassword.email')}
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
          disabled={loading}
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
          {loading ? t('forgotPassword.sending') : t('forgotPassword.send')}
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
          {t('app.back')}
        </button>
      </div>
    </div>
  );
}
