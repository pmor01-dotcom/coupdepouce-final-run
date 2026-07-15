"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLanguage } from "../components/LanguageProvider";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: params.get("refresh_token") || ""
      });
    }
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(t('common.error'));
    } else {
      setMessage(t('forgotPassword.passwordUpdated'));
    }
  }

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
          type="password"
          placeholder={t('login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#4CAF50",
            color: "white",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            marginBottom: "15px",
          }}
        >
          {t('forgotPassword.updatePassword')}
        </button>

        {message && (
          <p style={{ marginBottom: "15px", fontSize: "14px", color: "#333" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
