"use client";

import { useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/custom-forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage("Erreur : " + data.error);
    } else {
      setMessage("Un email de réinitialisation a été envoyé.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {t("forgotPassword.title")}
        </h2>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700">{message}</div>
        )}

        <input
          type="email"
          placeholder={t("forgotPassword.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-6"
          required
        />

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded"
        >
          {loading ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
        </button>
      </form>
    </main>
  );
}
