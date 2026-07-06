"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/custom-forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setError(data.error || 'Error sending reset email');
        setLoading(false);
        return;
      }

      setMessage("A password reset link has been sent to your email.");
      setLoading(false);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Error sending reset email');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white p-6 rounded shadow"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Forgot password</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700">{error}</div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700">{message}</div>
        )}

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-6"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </main>
  );
}
