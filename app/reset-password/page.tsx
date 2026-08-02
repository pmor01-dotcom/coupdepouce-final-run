"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useLanguage } from "../components/LanguageProvider";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
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

      // Get user's role to redirect to correct dashboard
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();

        if (userData?.role === 'client') {
          router.push('/client-dashboard');
        } else if (userData?.role === 'artisan') {
          router.push('/artisan-dashboard');
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
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
